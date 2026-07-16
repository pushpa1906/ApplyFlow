const API_BASE = "/api";

export default async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  let data: unknown = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { detail: text || "The server returned an invalid response." };
  }

  if (!response.ok) {
    const error = data as { detail?: string; message?: string };
    throw new Error(error.detail ?? error.message ?? `Request failed (${response.status}).`);
  }

  return data as T;
}
