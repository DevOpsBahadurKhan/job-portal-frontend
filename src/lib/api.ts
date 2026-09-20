const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string; role?: string }) {
    return this.request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { name?: string; email: string; password: string }) {
    return this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request<any>('/api/auth/profile', {
      method: 'GET',
    });
  }

  // Users endpoints
  async getUsers() {
    return this.request<any[]>('/api/users', {
      method: 'GET',
    });
  }

  // Companies endpoints
  async getMyCompany() {
    return this.request<any>('/api/companies/me', {
      method: 'GET',
    });
  }

  async updateCompany(id: number, data: {
    name: string;
    description: string;
    website: string;
    location: string;
  }) {
    return this.request<any>(`/api/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createCompany(data: {
    name: string;
    description: string;
    website: string;
    location: string;
  }) {
    return this.request<any>('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Jobs endpoints
  async getJobs(params: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    jobType?: string;
    salaryMin?: number;
    companyId?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.location) queryParams.append('location', params.location);
    if (params.jobType) queryParams.append('jobType', params.jobType);
    if (params.companyId) queryParams.append('companyId', params.companyId.toString());
    if (params.salaryMin) queryParams.append('salaryMin', params.salaryMin.toString());

    const queryString = queryParams.toString();
    return this.request<any>(`/api/jobs${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  }

  async getJob(id: number) {
    return this.request<any>(`/api/jobs/${id}`, {
      method: 'GET',
    });
  }

  async createJob(data: {
    title: string;
    description: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    jobType: string;
    status: string;
    skills: string;
    companyId: number;
  }) {
    return this.request<any>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: number, data: Partial<any>) {
    return this.request<any>(`/api/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: number) {
    return this.request<any>(`/api/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Application endpoints
  async applyForJob(jobId: number, data: { coverLetter: string; resumeUrl: string }) {
    return this.request<any>(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyApplications() {
    return this.request<any[]>('/api/my', {
      method: 'GET',
    });
  }

  // Admin endpoints
  async updateUserRole(userId: number, role: string) {
    return this.request<any>(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
}

export const apiClient = new ApiClient(API_URL);
