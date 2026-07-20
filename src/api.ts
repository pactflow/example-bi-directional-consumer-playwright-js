import axios from "axios";
import { Product, type ProductData } from "./product";

const DEFAULT_BASE_URL = "http://localhost:8080";

export class API {
  readonly url: string;

  constructor(url?: string) {
    const base =
      url && url !== ""
        ? url
        : (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL);
    this.url = base.endsWith("/") ? base.slice(0, -1) : base;
  }

  withPath(path: string): string {
    return `${this.url}${path.startsWith("/") ? path : `/${path}`}`;
  }

  generateAuthToken(): string {
    return `Bearer ${new Date().toISOString()}`;
  }

  async getAllProducts(id?: string): Promise<Product[]> {
    const path = id ? `/products?id=${id}` : "/products";
    const { data } = await axios.get<ProductData[]>(this.withPath(path), {
      headers: { Authorization: this.generateAuthToken() },
    });
    return data.map((p) => new Product(p));
  }

  async getProduct(id: string): Promise<Product> {
    const { data } = await axios.get<ProductData>(
      this.withPath(`/product/${id}`),
      { headers: { Authorization: this.generateAuthToken() } },
    );
    return new Product(data);
  }
}

export default new API();
