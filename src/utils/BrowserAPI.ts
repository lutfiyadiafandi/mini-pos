const API_BASE_URL = "http://localhost:3000/api";

export class BrowserAPI {
  // Fungsi bantuan HTTP Request Private
  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      return await response.json();
    } catch (error) {
      console.error(`Gagal menghubungkan ke server ${endpoint}:`, error);
      return { success: false, error: String(error) };
    }
  }

  // Panggil Endpoint Backend
  // ======= API Produk ========
  async productGetAll(): Promise<any> {
    return this.fetchApi("/products");
  }

  async productGetById(id: number): Promise<any> {
    return this.fetchApi(`/products/${id}`);
  }

  // Panggil Endpoint Simpan Objek Backend
  async productCreate(data: Record<string, unknown>): Promise<any> {
    return this.fetchApi("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async productUpdate(id: number, data: Record<string, unknown>): Promise<any> {
    return this.fetchApi(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async productDelete(id: number): Promise<any> {
    return this.fetchApi(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // ======= API Kategori ========
  async categoryGetAll(): Promise<any> {
    return this.fetchApi("/categories");
  }

  async categoryGetById(id: number): Promise<any> {
    return this.fetchApi(`/categories/${id}`);
  }

  // Panggil Endpoint Simpan Objek Backend
  async categoryCreate(data: Record<string, unknown>): Promise<any> {
    return this.fetchApi("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async categoryUpdate(
    id: number,
    data: Record<string, unknown>,
  ): Promise<any> {
    return this.fetchApi(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async categoriesDelete(id: number): Promise<any> {
    return this.fetchApi(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // ======= API Transaksi ========
  async transactionProcess(data: Record<string, unknown>): Promise<any> {
    return this.fetchApi("/transactions/process", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async transactionGetAll(): Promise<any> {
    return this.fetchApi("/transactions");
  }

  async transactionFilter(startDate: string, endDate: string): Promise<any> {
    return this.fetchApi(
      `/transactions/filter?startDate=${startDate}&endDate=${endDate}`,
    );
  }

  // ======= API Laporan Dashboard ========
  async reportsGetAll(): Promise<any> {
    return this.fetchApi("/reports");
  }
}
