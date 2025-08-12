const API_BASE_URL = '/api';

export class ApiService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>(url);
  }

  post<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(url: string): Promise<void> {
    return this.request<void>(url, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();