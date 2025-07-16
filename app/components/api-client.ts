import { Video } from "@/types/index";
import { Image } from "@/types/index";


type fetchOptions = {
  method?: "POST" | "GET" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
};

type VideoFormData = Omit<Video, "id" | "createdAt" | "updatedAt" | "controls" | "width" | "height" | "quality">;
type ImageFormData = Omit<Image, "id" | "createdAt" | "updatedAt">;

class ApiClient {
  private async fetch<T>(
    endPoint: string,
    options: fetchOptions = {}
  ): Promise<T> {
    const { method = "GET", headers = {}, body } = options;

    const defaultHeaders = {
      "Content-Type": "Application/json",
      ...headers,
    };
    const response = await fetch(`/api${endPoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async getVideos(): Promise<Video[]> {
    return this.fetch("/video");
  }

  async createVideo(videoData: VideoFormData): Promise<Video> {
    return this.fetch("/video", {
      method: "POST",
      body: videoData,
    });
  }

  async getImages(url: string): Promise<Image[]> {
    return this.fetch(`/image${url}`);
  }

  async createImage(imageData: ImageFormData): Promise<Image> {
    return this.fetch("/image", {
      method: "POST",
      body: imageData,
    });
  }
}

export const apiClient = new ApiClient();
