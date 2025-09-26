import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/config/api';

// Define types for our API responses
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  last_login: string;
  profile: UserProfile;
}

export interface UserProfile {
  id: number;
  user: number;
  phone_number: string;
  city: string;
  state: string;
  pin: string;
  address: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  role: 'OEM_ADMIN' | 'FLEET_ADMIN' | 'FLEET_USER' | 'DRIVER' | 'TECHNICIAN';
  preferred_theme: string;
  fleet_operator: number;
  ocpi_party_id?: string;
  ocpi_role?: string;
  ocpi_token?: string;
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type_app: string;
  content_type_model: string;
  content_type_name: string;
}

export interface Group {
  id: number;
  name: string;
  users?: number;
  permissions?: number;
}

export interface UserPermissions {
  direct_permissions: Permission[];
  group_permissions: Permission[];
  all_permissions: Permission[];
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface LoginResponse {
  refresh_token: string;
  access_token: string;
  user: User;
  message: string;
  provider_tokens?: any;
}

export interface OTPResponse {
  refresh_token: string;
  access_token: string;
  user: User;
  is_new_user: boolean;
  message: string;
}

// Create the API slice
export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.PROXY_URL,
    prepareHeaders: (headers) => {
      // Get token from localStorage or cookies
      const token = localStorage.getItem('access_token') || 
                   localStorage.getItem('authToken') ||
                   (typeof document !== 'undefined' ? 
                    document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1] : 
                    null);
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      // Add company name header if available
      const companyName = localStorage.getItem('company_name');
      if (companyName) {
        headers.set('x-company-name', companyName);
      }
      
      return headers;
    },
  }),
  tagTypes: [
    'Users',
    'Groups',
    'Permissions',
    'UserProfile',
  ],
  endpoints: (builder) => ({
    // Users endpoints
    listUsers: builder.query<PaginatedResponse<User>, { 
      search?: string; 
      ordering?: string; 
      exclude_group_id?: number; 
      page?: number;
    }>({
      query: (paramsInit) => {
        const params = new URLSearchParams();
        const { search, ordering, exclude_group_id, page } = paramsInit || {};
        if (search !== undefined) params.set('search', search);
        if (ordering !== undefined) params.set('ordering', ordering);
        if (exclude_group_id !== undefined) params.set('exclude_group_id', String(exclude_group_id));
        if (page !== undefined) params.set('page', String(page));
        return `/users/users/?${params.toString()}`;
      },
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<User, any>({
      query: (body) => ({ url: `/users/users/`, method: 'POST', body }),
      invalidatesTags: ['Users'],
    }),
    getUserById: builder.query<User, number>({
      query: (id) => `/users/users/${id}/`,
      providesTags: ['Users'],
    }),
    updateUser: builder.mutation<User, { id: number; body: any }>({
      query: ({ id, body }) => ({ url: `/users/users/${id}/`, method: 'PUT', body }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<any, number>({
      query: (id) => ({ url: `/users/users/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),
    getMe: builder.query<User, void>({
      query: () => `/users/users/me/`,
      providesTags: ['Users'],
    }),

    // Permissions & Groups endpoints
    getPermissions: builder.query<PaginatedResponse<Permission>, { 
      app_label?: string; 
      model?: string; 
      search?: string;
      page?: number;
    }>({
      query: (paramsInit) => {
        const params = new URLSearchParams();
        const { app_label, model, search, page } = paramsInit || {};
        if (app_label !== undefined) params.set('app_label', app_label);
        if (model !== undefined) params.set('model', model);
        if (search !== undefined) params.set('search', search);
        if (page !== undefined) params.set('page', String(page));
        return `/users/permissions/?${params.toString()}`;
      },
      providesTags: ['Permissions'],
    }),
    getUserPermissions: builder.query<UserPermissions, number>({
      query: (userId) => `/users/users/${userId}/permissions/`,
      providesTags: ['Permissions'],
    }),
    setUserPermissions: builder.mutation<any, { userId: number; permissions: number[] }>({
      query: ({ userId, permissions }) => ({ 
        url: `/users/users/${userId}/permissions/`, 
        method: 'POST', 
        body: { permissions } 
      }),
      invalidatesTags: ['Permissions'],
    }),
    setGroupPermissions: builder.mutation<any, { groupId: number; permissions: number[] }>({
      query: ({ groupId, permissions }) => ({ 
        url: `/users/groups/${groupId}/permissions/`, 
        method: 'POST', 
        body: { permissions } 
      }),
      invalidatesTags: ['Permissions'],
    }),
    setGroupAppPermissions: builder.mutation<any, { 
      groupId: number; 
      app_label: string; 
      model?: string; 
      clear_existing?: boolean; 
    }>({
      query: ({ groupId, app_label, model, clear_existing = true }) => ({ 
        url: `/users/groups/${groupId}/app-permissions/`, 
        method: 'POST', 
        body: { app_label, model, clear_existing } 
      }),
      invalidatesTags: ['Permissions'],
    }),
    setGroupUsers: builder.mutation<any, { 
      groupId: number; 
      users: number[]; 
      action: 'add' | 'remove'; 
    }>({
      query: ({ groupId, users, action }) => ({ 
        url: `/users/groups/${groupId}/users/`, 
        method: 'POST', 
        body: { users, action } 
      }),
      invalidatesTags: ['Groups'],
    }),
    getMyPermissions: builder.query<{ permissions: string[] }, void>({
      query: () => `/users/my-permissions/`,
      providesTags: ['Permissions'],
    }),
    checkPermission: builder.query<{ permission_code: string; has_permission: boolean }, string>({
      query: (codename) => `/users/has-permission/${codename}/`,
      providesTags: ['Permissions'],
    }),

    // Auth & Profile endpoints
    loginWithPassword: builder.mutation<LoginResponse, { username: string; password: string }>({
      query: (body) => ({ url: `/users/login_with_password/`, method: 'POST', body }),
      invalidatesTags: ['Users'],
    }),
    refreshToken: builder.mutation<{ access_token: string }, { refresh: string }>({
      query: (body) => ({ url: `/users/refresh_token/`, method: 'POST', body }),
    }),
    setPassword: builder.mutation<any, { old_password?: string; new_password: string }>({
      query: (body) => ({ url: `/users/set_password/`, method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<any, void>({
      query: () => ({ url: `/users/forgot_password/`, method: 'POST' }),
    }),
    getUserProfile: builder.query<User, void>({
      query: () => `/users/user_profile/`,
      providesTags: ['UserProfile'],
    }),
    updateUserProfile: builder.mutation<User, any>({
      query: (body) => ({ url: `/users/user_profile/`, method: 'PUT', body }),
      invalidatesTags: ['UserProfile'],
    }),

    // OTP & Contact Updates
    sendOTP: builder.mutation<any, { phone?: string; email?: string }>({
      query: (body) => ({ url: `/users/send_otp/`, method: 'POST', body }),
    }),
    verifyOTP: builder.mutation<OTPResponse, { phone?: string; email?: string; otp: string }>({
      query: (body) => ({ url: `/users/verify_otp/`, method: 'POST', body }),
      invalidatesTags: ['Users'],
    }),
    verifyOTPUpdate: builder.mutation<any, { phone?: string; email?: string; otp: string }>({
      query: (body) => ({ url: `/users/verify_otp_update/`, method: 'POST', body }),
    }),
    updatePhone: builder.mutation<any, { phone_number: string }>({
      query: (body) => ({ url: `/users/update_phone/`, method: 'POST', body }),
    }),
    updateEmail: builder.mutation<any, { email: string }>({
      query: (body) => ({ url: `/users/update_email/`, method: 'POST', body }),
    }),
    verifyUpdate: builder.mutation<any, { otp: string; type: 'phone' | 'email'; new_value: string }>({
      query: (body) => ({ url: `/users/verify_update/`, method: 'POST', body }),
    }),

    // Groups endpoints
    listGroups: builder.query<PaginatedResponse<Group>, { page?: number }>({
      query: (paramsInit) => {
        const params = new URLSearchParams();
        const { page } = paramsInit || {};
        if (page !== undefined) params.set('page', String(page));
        return `/users/groups/?${params.toString()}`;
      },
      providesTags: ['Groups'],
    }),
    createGroup: builder.mutation<Group, { name: string }>({
      query: (body) => ({ url: `/users/groups/`, method: 'POST', body }),
      invalidatesTags: ['Groups'],
    }),
    getGroupById: builder.query<Group, number>({
      query: (id) => `/users/groups/${id}/`,
      providesTags: ['Groups'],
    }),
    updateGroup: builder.mutation<Group, { id: number; body: any }>({
      query: ({ id, body }) => ({ url: `/users/groups/${id}/`, method: 'PUT', body }),
      invalidatesTags: ['Groups'],
    }),
    deleteGroup: builder.mutation<any, number>({
      query: (id) => ({ url: `/users/groups/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Groups'],
    }),

    // Group Users management
    getGroupUsers: builder.query<PaginatedResponse<User>, number>({
      query: (groupId) => `/users/groups/${groupId}/users/`,
      providesTags: ['Groups'],
    }),
    updateGroupUsers: builder.mutation<any, { groupId: number; userIds: number[] }>({
      query: ({ groupId, userIds }) => ({
        url: `/users/groups/${groupId}/users/`,
        method: 'PUT',
        body: { user_ids: userIds }
      }),
      invalidatesTags: ['Groups'],
    }),

    // Group Permissions management
    getGroupPermissions: builder.query<PaginatedResponse<Permission>, number>({
      query: (groupId) => `/users/groups/${groupId}/permissions/`,
      providesTags: ['Groups'],
    }),
    updateGroupPermissions: builder.mutation<any, { groupId: number; permissionIds: number[] }>({
      query: ({ groupId, permissionIds }) => ({
        url: `/users/groups/${groupId}/permissions/`,
        method: 'PUT',
        body: { permission_ids: permissionIds }
      }),
      invalidatesTags: ['Groups'],
    }),

    // KPI endpoints for dashboard
    getUsersStats: builder.query<{ total_users: number }, void>({
      query: () => `/users/users/?page_size=1`,
      transformResponse: (response: PaginatedResponse<User>) => ({ total_users: response.count }),
      providesTags: ['Users'],
    }),
    getGroupsStats: builder.query<{ total_groups: number }, void>({
      query: () => `/users/groups/?page_size=1`,
      transformResponse: (response: PaginatedResponse<Group>) => ({ total_groups: response.count }),
      providesTags: ['Groups'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useListUsersQuery,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetMeQuery,
  useGetPermissionsQuery,
  useGetUserPermissionsQuery,
  useSetUserPermissionsMutation,
  useGetGroupPermissionsQuery,
  useSetGroupPermissionsMutation,
  useSetGroupAppPermissionsMutation,
  useGetGroupUsersQuery,
  useSetGroupUsersMutation,
  useGetMyPermissionsQuery,
  useCheckPermissionQuery,
  useLoginWithPasswordMutation,
  useRefreshTokenMutation,
  useSetPasswordMutation,
  useForgotPasswordMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useVerifyOTPUpdateMutation,
  useUpdatePhoneMutation,
  useUpdateEmailMutation,
  useVerifyUpdateMutation,
  useListGroupsQuery,
  useCreateGroupMutation,
  useGetGroupByIdQuery,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useUpdateGroupUsersMutation,
  useUpdateGroupPermissionsMutation,
  useGetUsersStatsQuery,
  useGetGroupsStatsQuery,
} = usersApi;
