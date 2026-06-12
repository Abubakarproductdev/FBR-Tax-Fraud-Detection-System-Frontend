import type { Profile, SystemMetrics } from "@/types/domain";

export const API_BASE_URL = "http://127.0.0.1:8000";

type RequestOptions = RequestInit & {
  label?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { label, headers, ...init } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...headers
    }
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      `${label ?? "Request"} failed with ${response.status}${message ? `: ${message}` : ""}`
    );
  }

  return response.json() as Promise<T>;
}

export function fetchMetrics() {
  return request<SystemMetrics>("/api/metrics", { label: "Metrics request" });
}

export function fetchProfiles() {
  return request<Profile[]>("/api/profiles", { label: "Profiles request" });
}

export function runPipeline() {
  return request<{ message?: string; status?: string }>("/api/run-pipeline", {
    method: "POST",
    label: "Pipeline execution"
  });
}

export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Upload failed with ${response.status}${message ? `: ${message}` : ""}`);
  }

  return response.json() as Promise<{ message?: string; saved_files?: string[] }>;
}

export function updateProfileStatus(canonicalId: string, status: string) {
  return request<{ message?: string; status?: string }>(
    `/api/profiles/${encodeURIComponent(canonicalId)}/status`,
    {
      method: "POST",
      label: "Status update",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    }
  );
}
