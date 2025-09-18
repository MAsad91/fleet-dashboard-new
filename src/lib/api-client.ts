import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { API_CONFIG } from '@/config/api';

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

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
    Cookies.set('access_token', token, { expires: 7 }); // 7 days
    localStorage.setItem('access_token', token);
    localStorage.setItem('authToken', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    Cookies.remove('access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refresh_token');
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
    let url = `/fleet/dashboard/summary/`;
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
    const response = await this.client.get(url);
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
    let url = `/fleet/alerts/dashboard_stats/`;
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
