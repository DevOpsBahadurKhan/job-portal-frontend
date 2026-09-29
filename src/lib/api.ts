
/* eslint-disable @typescript-eslint/no-explicit-any */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

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
  private csrfToken: string | null = null;

  // Prevent refresh attempts after the user has logged out or the session expired.
  private isLoggedOut = false;

  // Prevent multiple simultaneous 401 responses from rotating
  // the same refresh token more than once.
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  // =========================
  // CSRF
  // =========================

  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    const response = await fetch(
      `${this.baseUrl}/api/auth/csrf-token`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    let result: any;

    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    if (!response.ok) {
      throw new Error(
        typeof result === "string"
          ? result
          : result?.message ||
          `CSRF token request failed: ${response.status}`
      );
    }

    const token = result?.data?.csrfToken;

    if (!token) {
      throw new Error("CSRF token missing in response");
    }

    this.csrfToken = token;

    return token;
  }

  private clearCsrfToken() {
    this.csrfToken = null;
  }

  // Call after logout or when refresh fails.
  public markLoggedOut() {
    this.isLoggedOut = true;
    this.clearCsrfToken();
  }

  // Call after a successful login or registration.
  public resetAuthState() {
    this.isLoggedOut = false;
    this.clearCsrfToken();
  }

  // =========================
  // ACCESS TOKEN REFRESH
  // =========================

  private async refreshAccessToken(): Promise<boolean> {
    // Never refresh after logout/session expiry.
    if (this.isLoggedOut) {
      return false;
    }

    // Share one refresh operation between concurrent API requests.
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        // Always fetch a fresh CSRF token before refreshing.
        this.clearCsrfToken();
        const csrfToken = await this.getCsrfToken();

        const response = await fetch(
          `${this.baseUrl}/api/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,
            },
          }
        );

        // A logout may have happened while refresh was in flight.
        // Do not treat that response as an active session.
        this.clearCsrfToken();

        if (this.isLoggedOut) {
          return false;
        }

        if (!response.ok) {
          this.markLoggedOut();
          return false;
        }

        return true;
      } catch {
        this.clearCsrfToken();
        if (!this.isLoggedOut) {
          this.markLoggedOut();
        }
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private isAuthEndpoint(endpoint: string): boolean {
    return [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/refresh",
      "/api/auth/csrf-token",
      "/api/auth/logout",
    ].some((path) => endpoint.split("?")[0] === path);
  }

  private isPublicAuthPage(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    const path = window.location.pathname;
    return (
      path === "/login" ||
      path === "/register" ||
      path === "/forgot-password" ||
      path.startsWith("/reset-password")
    );
  }

  // =========================
  // COMMON REQUEST
  // =========================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCsrf: boolean = true,
    allowRefresh: boolean = true,
    hasRetried: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const method = (
      options.method || "GET"
    ).toUpperCase();

    const requiresCsrf =
      useCsrf &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    try {
      // Detect multipart FormData uploads.
      // The browser must set Content-Type with its multipart boundary.
      const isFormData =
        typeof FormData !== "undefined" &&
        options.body instanceof FormData;

      const headers = new Headers(this.getHeaders());

      // Do not send application/json for FormData.
      if (isFormData) {
        headers.delete("Content-Type");
      }

      new Headers(options.headers).forEach(
        (value, key) => {
          headers.set(key, value);
        }
      );

      // Ensure a caller-supplied header cannot override the browser's
      // multipart Content-Type/boundary handling.
      if (isFormData) {
        headers.delete("Content-Type");
      }

      // Fetch and attach CSRF token only when required.
      // Login and register pass useCsrf=false.
      if (requiresCsrf) {
        const csrfToken = await this.getCsrfToken();
        headers.set("X-CSRF-Token", csrfToken);
      }

      const config: RequestInit = {
        ...options,
        method,
        credentials: "include",
        headers,
      };

      const response = await fetch(url, config);

      const contentType =
        response.headers.get("content-type") || "";

      let data: any;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // If access token expired, refresh the session once and retry
        // the original request. Do not refresh auth endpoints or retry twice.
        if (
          response.status === 401 &&
          !this.isLoggedOut &&
          !this.isPublicAuthPage() &&
          allowRefresh &&
          !hasRetried &&
          !this.isAuthEndpoint(endpoint)
        ) {
          const refreshed = await this.refreshAccessToken();

          if (refreshed) {
            return this.request<T>(
              endpoint,
              options,
              useCsrf,
              false,
              true
            );
          }

          // Refresh failed: mark the session ended. Redirect only when
          // not already on an auth page to avoid reloading /login forever.
          this.markLoggedOut();
          if (
            typeof window !== "undefined" &&
            !this.isPublicAuthPage()
          ) {
            window.location.replace("/login");
          }

          return {
            success: false,
            error: "Session expired. Please log in again.",
          };
        }

        // Clear cached CSRF token if authentication or CSRF
        // validation fails, so the next attempt can fetch a fresh one.
        if (response.status === 401 || response.status === 403) {
          this.clearCsrfToken();
        }

        const errorMessage =
          data?.message ||
          data?.error ||
          data?.errors?.[0]?.msg ||
          (typeof data === "string" ? data : null) ||
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
          error instanceof Error
            ? error.message
            : "Network error",
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
    const result = await this.request<any>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false // Skip authenticated CSRF token before registration
    );

    if (result.success) {
      this.resetAuthState();
    }

    return result;
  }

  async login(data: {
    name?: string;
    email: string;
    password: string;
  }) {
    // Clear any token cached from a previous session.
    this.clearCsrfToken();

    const result = await this.request<any>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false // Skip authenticated CSRF token before login
    );

    // Reset any logged-out state after a successful login.
    // Fetch a fresh CSRF token later, after the JWT cookie is set.
    if (result.success) {
      this.resetAuthState();
    }

    return result;
  }

  async getProfile() {
    return this.request<any>(
      "/api/auth/profile",
      {
        method: "GET",
      }
    );
  }

  async getMe() {
    return this.request<any>(
      "/api/auth/profile",
      {
        method: "GET",
      }
    );
  }

  async logout(): Promise<void> {
    // Do not let any 401 response start a refresh during logout.
    this.markLoggedOut();

    const result = await this.request<null>(
      "/api/auth/logout",
      {
        method: "POST",
      }
    );

    // Keep the client in logged-out state even if the server request fails.
    this.markLoggedOut();

    if (!result.success) {
      throw new Error(result.error || "Logout failed");
    }
  }

  // =========================
  // USERS
  // =========================

  async getUsers() {
    return this.request<any[]>(
      "/api/users",
      {
        method: "GET",
      }
    );
  }

  // =========================
  // COMPANIES
  // =========================

  async getMyCompany() {
    return this.request<any>(
      "/api/companies/me",
      {
        method: "GET",
      }
    );
  }

  async listCompanies() {
    return this.request<any>(
      "/api/companies",
      {
        method: "GET",
      }
    );
  }

  async getCompanyById(id: number) {
    return this.request<any>(
      `/api/companies/${id}`,
      {
        method: "GET",
      }
    );
  }

  async createCompany(data: {
    name: string;
    description: string;
    website: string;
    location: string;
  }) {
    return this.request<any>(
      "/api/companies",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
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
    return this.request<any>(
      `/api/companies/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteCompany(id: number) {
    return this.request<any>(
      `/api/companies/${id}`,
      {
        method: "DELETE",
      }
    );
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
      queryParams.append(
        "page",
        params.page.toString()
      );
    }

    if (params.limit) {
      queryParams.append(
        "limit",
        params.limit.toString()
      );
    }

    if (params.search) {
      queryParams.append(
        "search",
        params.search
      );
    }

    if (params.location) {
      queryParams.append(
        "location",
        params.location
      );
    }

    if (params.jobType) {
      queryParams.append(
        "jobType",
        params.jobType
      );
    }

    if (params.salaryMin) {
      queryParams.append(
        "salaryMin",
        params.salaryMin.toString()
      );
    }

    if (params.companyId) {
      queryParams.append(
        "companyId",
        params.companyId.toString()
      );
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
      queryParams.append(
        "search",
        params.search
      );
    }

    if (params.location) {
      queryParams.append(
        "location",
        params.location
      );
    }

    if (params.jobType) {
      queryParams.append(
        "jobType",
        params.jobType
      );
    }

    if (params.salaryMin) {
      queryParams.append(
        "salaryMin",
        params.salaryMin.toString()
      );
    }

    if (params.page) {
      queryParams.append(
        "page",
        params.page.toString()
      );
    }

    if (params.limit) {
      queryParams.append(
        "limit",
        params.limit.toString()
      );
    }

    if (params.companyId) {
      queryParams.append(
        "companyId",
        params.companyId.toString()
      );
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
    return this.request<any>(
      `/api/jobs/${id}`,
      {
        method: "GET",
      }
    );
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
    return this.request<any>(
      "/api/jobs",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async updateJob(
    id: number,
    data: Partial<any>
  ) {
    return this.request<any>(
      `/api/jobs/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteJob(id: number) {
    return this.request<any>(
      `/api/jobs/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // =========================
  // APPLICATIONS
  // =========================

  async applyForJob(
    jobId: number,
    formData: FormData
  ) {
    return this.request<any>(
      `/api/application/${jobId}/apply`,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  async getMyApplications() {
    return this.request<any[]>(
      "/api/application/my",
      {
        method: "GET",
      }
    );
  }

  // =========================
  // ADMIN
  // =========================

  async updateUserRole(
    userId: number,
    role: string
  ) {
    return this.request<any>(
      `/api/admin/users/${userId}/role`,
      {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }
    );
  }

  // =========================
  // NOTIFICATIONS
  // =========================

  async registerPushSubscription(
    subscription: {
      endpoint: string;
      expirationTime: number | null;
      keys: {
        p256dh: string;
        auth: string;
      };
    }
  ) {
    return this.request<any>(
      "/api/notifications/subscribe",
      {
        method: "POST",
        body: JSON.stringify(subscription),
      }
    );
  }

  async sendPushNotification(data: {
    userId: number;
    title: string;
    message: string;
    url: string;
  }) {
    return this.request<any>(
      "/api/notifications/send",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }
}

export const apiClient = new ApiClient(API_URL);