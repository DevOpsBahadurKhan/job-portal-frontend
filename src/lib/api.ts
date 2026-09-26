/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,

      // HttpOnly cookie automatically send hogi
      credentials: "include",

      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get("content-type");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          data?.error ||
          data?.errors?.[0]?.msg ||
          `HTTP ${response.status}: ${response.statusText}`;

        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: data?.data ?? data,
        message: data?.message,
        pagination: data?.pagination,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // =========================
  // AUTH
  // =========================

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    return this.request<any>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    name?: string;
    email: string;
    password: string;
  }) {
    return this.request<any>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request<any>("/api/auth/profile", {
      method: "GET",
    });
  }

  async getMe() {
    return this.request<any>("/api/auth/profile", {
      method: "GET",
    });
  }

  async logout() {
    return this.request<null>("/api/auth/logout", {
      method: "POST",
    });
  }

  // =========================
  // USERS
  // =========================

  async getUsers() {
    return this.request<any[]>("/api/users", {
      method: "GET",
    });
  }

  // =========================
  // COMPANIES
  // =========================

  async getMyCompany() {
    return this.request<any>("/api/companies/me", {
      method: "GET",
    });
  }

  async listCompanies() {
    return this.request<any>("/api/companies", {
      method: "GET",
    });
  }

  async getCompanyById(id: number) {
    return this.request<any>(`/api/companies/${id}`, {
      method: "GET",
    });
  }

  async createCompany(data: {
    name: string;
    description: string;
    website: string;
    location: string;
  }) {
    return this.request<any>("/api/companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCompany(
    id: number,
    data: {
      name: string;
      description: string;
      website: string;
      location: string;
    }
  ) {
    return this.request<any>(`/api/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: number) {
    return this.request<any>(`/api/companies/${id}`, {
      method: "DELETE",
    });
  }

  // =========================
  // JOBS
  // =========================

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

    if (params.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.location) {
      queryParams.append("location", params.location);
    }

    if (params.jobType) {
      queryParams.append("jobType", params.jobType);
    }

    if (params.salaryMin) {
      queryParams.append("salaryMin", params.salaryMin.toString());
    }

    if (params.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }

    const queryString = queryParams.toString();

    return this.request<any>(
      `/api/jobs${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
      }
    );
  }

  async getPublicJobs(params: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    jobType?: string;
    salaryMin?: number;
    companyId?: number;
  } = {}) {
    const queryParams = new URLSearchParams();

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.location) {
      queryParams.append("location", params.location);
    }

    if (params.jobType) {
      queryParams.append("jobType", params.jobType);
    }

    if (params.salaryMin) {
      queryParams.append("salaryMin", params.salaryMin.toString());
    }

    if (params.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    if (params.companyId) {
      queryParams.append("companyId", params.companyId.toString());
    }

    const queryString = queryParams.toString();

    return this.request<any>(
      `/api/jobs${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
      }
    );
  }

  async getJob(id: number) {
    return this.request<any>(`/api/jobs/${id}`, {
      method: "GET",
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
    return this.request<any>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: number, data: Partial<any>) {
    return this.request<any>(`/api/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: number) {
    return this.request<any>(`/api/jobs/${id}`, {
      method: "DELETE",
    });
  }

  // =========================
  // APPLICATIONS
  // =========================

  async applyForJob(
    jobId: number,
    data: {
      coverLetter: string;
      resumeUrl: string;
    }
  ) {
    return this.request<any>(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMyApplications() {
    return this.request<any[]>("/api/my", {
      method: "GET",
    });
  }

  // =========================
  // ADMIN
  // =========================

  async updateUserRole(userId: number, role: string) {
    return this.request<any>(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  // =========================
  // NOTIFICATIONS
  // =========================

  async registerPushSubscription(subscription: {
    endpoint: string;
    expirationTime: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  }) {
    return this.request<any>("/api/notifications/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
    });
  }

  async sendPushNotification(data: {
    userId: number;
    title: string;
    message: string;
    url: string;
  }) {
    return this.request<any>("/api/notifications/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_URL);