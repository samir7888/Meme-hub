import { IImage } from "@/models/Image";
import { IVideo } from "@/models/Video";

type fetchOptions = {
  method?: "POST" | "GET" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
};

type VideoFormData = Omit<IVideo, "_id">;
type ImageFormData = Omit<IImage, "_id">;
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
console.log(response)
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async getVideos() {
    return this.fetch("/video");
  }

  async createVideo(videoData: VideoFormData) {
    return this.fetch("/video", {
      method: "POST",
      body: videoData,
    });
  }

  async getImages(url:string) {
    return this.fetch(`/image${url}`);
  }

  async createImage(imageData: ImageFormData) {
    return this.fetch("/image", {
      method: "POST",
      body: imageData,
    });
  }

  async deleteImage(imageId: string) {
    console.log(imageId);
    return this.fetch(`/image?id=${imageId}`, {
      method: "DELETE",
    });
  }

  async deleteVideo(videoId: string) {
    return this.fetch(`/video?id=${videoId}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
