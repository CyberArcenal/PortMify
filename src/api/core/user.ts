// src/api/user.ts
import { apiClient } from "@/lib/fetcher";
import { Pagination } from "../utils";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  user_type: "viewer" | "customer" | "staff" | "manager" | "admin";
  user_type_display: string;
  status: "active" | "restricted" | "suspended" | "deleted";
  status_display: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface UserCreateData {
  username: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  user_type?: "viewer" | "customer" | "staff" | "manager" | "admin";
  status?: "active" | "restricted" | "suspended" | "deleted";
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export type UserUpdateData = Partial<UserCreateData>;

export interface UsersListParams {
  search?: string;
  user_type?: string;
  status?: string;
  is_active?: boolean;
  include_deleted?: boolean;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  status: boolean;
  message: string;
  pagination: Pagination;
  results: T[];
}

class UserAPI {
  private basePath = '/api/v2/portfolio/users/';

  async list(params?: UsersListParams): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get<PaginatedResponse<User>>(this.basePath, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch users');
    }
  }

  async get(id: number): Promise<User> {
    try {
      const response = await apiClient.get<{ status: boolean; message: string; result: User }>(
        `${this.basePath}${id}/`
      );
      return response.data.result;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user');
    }
  }

  async create(data: UserCreateData): Promise<User> {
    try {
      const response = await apiClient.post<{ status: boolean; message: string; result: User }>(
        this.basePath,
        data
      );
      return response.data.result;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create user');
    }
  }

  async update(id: number, data: UserCreateData): Promise<User> {
    try {
      const response = await apiClient.put<{ status: boolean; message: string; result: User }>(
        `${this.basePath}${id}/`,
        data
      );
      return response.data.result;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update user');
    }
  }

  async patch(id: number, data: UserUpdateData): Promise<User> {
    try {
      const response = await apiClient.patch<{ status: boolean; message: string; result: User }>(
        `${this.basePath}${id}/`,
        data
      );
      return response.data.result;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to patch user');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete user');
    }
  }

    /**
   * Change password for a user.
   * If userId is not provided, changes the current user's password.
   * If userId is provided (admin only), changes password for that user.
   */
  async changePassword(
    userId?: number,
    data?: { current_password?: string; new_password: string }
  ): Promise<{ message: string }> {
    try {
      const url = userId
        ? `${this.basePath}${userId}/change-password/`
        : `${this.basePath}change-password/`;
      
      const response = await apiClient.post<{
        status: boolean;
        message: string;
        result: { message: string };
      }>(url, data);
      
      return response.data.result;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || "Failed to change password"
      );
    }
  }
}

const userAPI = new UserAPI();
export default userAPI;