import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { API_CONFIG, getCompanyApiUrl } from '@/config/api';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.PROXY_URL;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and company name
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add company name header if available
        const companyName = localStorage.getItem('company_name');
        if (companyName) {
          config.headers['X-Company-Name'] = companyName;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh and 403 errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              originalRequest.headers.Authorization = `Bearer ${this.getToken()}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/auth/sign-in';
          }
        }
        
        // Handle 403 Forbidden errors
        if (error.response?.status === 403) {
          console.error('❌ API Client: 403 Forbidden - Insufficient permissions');
          console.error('❌ API Client: Error details:', error.response.data);
          
          // Show user-friendly error message
          const errorMessage = error.response.data?.message || error.response.data?.detail || 'Access denied. You do not have permission to perform this action.';
          
          // You could dispatch a global error event or show a toast notification here
          // For now, we'll just log it and let the calling component handle it
          error.userMessage = errorMessage;
        }
        
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get('access_token') || localStorage.getItem('access_token') || localStorage.getItem('authToken');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    // Set cookie with longer expiration for better persistence
    Cookies.set('access_token', token, { 
      expires: 30, // 30 days
      secure: window.location.protocol === 'https:',
      sameSite: 'lax'
    });
    localStorage.setItem('access_token', token);
    localStorage.setItem('authToken', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    Cookies.remove('access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('company_name');
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await axios.post(`${this.baseURL}/users/refresh_token/`, {
        refresh: refreshToken, // API expects 'refresh' field, not 'refresh_token'
      });

      const { access_token } = response.data;
      this.setToken(access_token);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Auth methods
  async login(username: string, password: string) {
    const response = await this.client.post('/users/login_with_password', {
      username: username, // API expects 'username' field
      password,
    });
    
    const { access_token, refresh_token, user } = response.data;
    this.setToken(access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return { user, access_token };
  }

  // Company-based authentication methods
  async validateDomain(companyName: string) {
    try {
      const companyApiUrl = getCompanyApiUrl(companyName);
      const domain = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.platform-api-test.joulepoint.com`;
      
      console.log(`🔐 Validating domain: ${domain} for company: ${companyName}`);
      console.log(`🔐 API URL: ${companyApiUrl}`);
      
      const response = await axios.get(
        `${companyApiUrl}/api/tenant/validate-domain/?domain=${domain}`,
        {
          timeout: API_CONFIG.TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log(`✅ Domain validation successful for ${companyName}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`❌ Domain validation failed for ${companyName}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error(`Company '${companyName}' not found. Please check the company name and try again.`);
      } else if (error.response?.status === 400) {
        throw new Error(`Invalid domain for company '${companyName}'. Please check the company name.`);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        throw new Error(`Unable to connect to ${companyName}'s platform. Please check the company name and try again.`);
      } else {
        throw new Error(error.response?.data?.message || error.message || `Failed to validate domain for company '${companyName}'`);
      }
    }
  }

  async loginWithCompany(companyName: string, username: string, password: string) {
    try {
      // First validate the domain
      await this.validateDomain(companyName);
      
      // If domain validation is successful, proceed with login
      const companyApiUrl = getCompanyApiUrl(companyName);
      
      console.log(`🔐 Logging in to company: ${companyName}`);
      console.log(`🔐 API URL: ${companyApiUrl}`);
      
      const response = await axios.post(
        `${companyApiUrl}/api/users/login_with_password/`,
        {
          username: username,
          password: password,
        },
        {
          timeout: API_CONFIG.TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const { access_token, refresh_token, user } = response.data;
      this.setToken(access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Store company name for future requests
      localStorage.setItem('company_name', companyName.toLowerCase().replace(/[^a-z0-9]/g, ''));
      
      console.log(`✅ Login successful for company: ${companyName}`);
      return { user, access_token };
    } catch (error: any) {
      console.error(`❌ Company login failed for ${companyName}:`, error);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password. Please check your credentials and try again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Your account may not have permission to access this company.');
      } else if (error.response?.status === 404) {
        throw new Error(`Company '${companyName}' not found. Please check the company name and try again.`);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        throw new Error(`Unable to connect to ${companyName}'s platform. Please check the company name and try again.`);
      } else {
        throw new Error(error.response?.data?.message || error.message || `Login failed for company '${companyName}'`);
      }
    }
  }

  async logout() {
    try {
      // Note: There's no logout endpoint in the API, so we just clear local storage
      this.removeToken();
    } catch (error) {
      // Continue with logout even if API call fails
      this.removeToken();
    }
  }

  async getCurrentUser() {
    const response = await this.client.get('/users/users/me');
    return response.data;
  }

  // Fleet API methods
  async getDashboardSummary(dateRange: string = 'today', startDate?: string, endDate?: string) {
    try {
      let url = `/fleet/dashboard/summary/`;
      const params = new URLSearchParams();
      
      if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      } else {
        params.append('date_range', dateRange);
      }
      
      url += `?${params.toString()}`;
      console.log('🔍 API Client: Dashboard summary URL:', url);
      console.log('🔍 API Client: Making request to:', this.baseURL + url);
      const response = await this.client.get(url);
      console.log('🔍 API Client: Dashboard summary response:', response.data);
      console.log('🔍 API Client: Online vehicles in response:', response.data?.online_vehicles);
      return response.data;
    } catch (error: any) {
      console.error('❌ API Client: Dashboard summary error:', error.response?.data || error.message);
      console.error('❌ API Client: Full error details:', error);
      throw error;
    }
  }

  async getVehiclesStats(dateRange: string = 'today', startDate?: string, endDate?: string) {
    let url = `/fleet/vehicles/dashboard_stats/`;
    const params = new URLSearchParams();
    
    if (startDate && endDate) {
      params.append('start_date', startDate);
      params.append('end_date', endDate);
    } else {
      params.append('date_range', dateRange);
    }
    
    url += `?${params.toString()}`;
    console.log('🔍 API Client: Vehicles stats URL:', url);
    const response = await this.client.get(url);
    console.log('🔍 API Client: Vehicles stats response:', response.data);
    return response.data;
  }

  async getDriversStats(dateRange: string = 'today', startDate?: string, endDate?: string) {
    let url = `/fleet/drivers/dashboard_stats/`;
    const params = new URLSearchParams();
    
    if (startDate && endDate) {
      params.append('start_date', startDate);
      params.append('end_date', endDate);
    } else {
      params.append('date_range', dateRange);
    }
    
    url += `?${params.toString()}`;
    const response = await this.client.get(url);
    return response.data;
  }

  async getTripsStats(dateRange: string = 'today', startDate?: string, endDate?: string) {
    let url = `/fleet/trips/dashboard_stats/`;
    const params = new URLSearchParams();
    
    if (startDate && endDate) {
      params.append('start_date', startDate);
      params.append('end_date', endDate);
    } else {
      params.append('date_range', dateRange);
    }
    
    url += `?${params.toString()}`;
    const response = await this.client.get(url);
    return response.data;
  }

  async getAlertsStats(dateRange: string = 'today', startDate?: string, endDate?: string) {
    try {
      // Try the main alerts endpoint first as it's more reliable
      let url = `/fleet/alerts/`;
      const params = new URLSearchParams();
      
      // Add status filter to get active alerts
      params.append('status', 'active');
      
      // Add date filters if provided
      if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      } else {
        params.append('date_range', dateRange);
      }
      
      url += `?${params.toString()}`;
          const response = await this.client.get(url);
      
      // Transform the response to match expected format
      return {
        results: response.data.results || [],
        count: response.data.count || 0,
        summary: {
          total_alerts: response.data.count || 0,
          active_alerts: response.data.results?.filter((alert: any) => alert.status === 'active').length || 0,
          critical_alerts: response.data.results?.filter((alert: any) => alert.severity === 'critical').length || 0,
        }
      };
    } catch (error: any) {
      console.error('❌ API Client: Alerts error:', error.response?.data || error.message);
      
      // Fallback to dashboard stats endpoint
      try {
        console.log('🔄 API Client: Trying dashboard stats endpoint as fallback...');
        let fallbackUrl = `/fleet/alerts/dashboard_stats/`;
        const fallbackParams = new URLSearchParams();
        
        if (startDate && endDate) {
          fallbackParams.append('start_date', startDate);
          fallbackParams.append('end_date', endDate);
        } else {
          fallbackParams.append('date_range', dateRange);
        }
        
        fallbackUrl += `?${fallbackParams.toString()}`;
        const fallbackResponse = await this.client.get(fallbackUrl);
        console.log('✅ API Client: Dashboard stats fallback response:', fallbackResponse.data);
        return fallbackResponse.data;
      } catch (fallbackError: any) {
        console.error('❌ API Client: Both alerts endpoints failed:', fallbackError.response?.data || fallbackError.message);
        throw fallbackError;
      }
    }
  }

  async getMaintenanceStats(dateRange: string = 'today', startDate?: string, endDate?: string) {
    let url = `/fleet/scheduled-maintenance/dashboard_stats/`;
    const params = new URLSearchParams();
    
    if (startDate && endDate) {
      params.append('start_date', startDate);
      params.append('end_date', endDate);
    } else {
      params.append('date_range', dateRange);
    }
    
    url += `?${params.toString()}`;
    const response = await this.client.get(url);
    return response.data;
  }

  // Generic API methods
  async get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post(url, data, config);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put(url, data, config);
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
