export type SafeJsonResult<T> = {
  data: T | null;
  message: string;
  diagnosticId?: string;
  rawBody?: string;
};

export async function readSafeJson<T>(response: Response): Promise<SafeJsonResult<T>> {
  const rawBody = await response.text();
  if (!rawBody.trim()) {
    return {
      data: null,
      message: `Server returned an empty response (${response.status}).`,
      rawBody,
    };
  }

  try {
    const data = JSON.parse(rawBody) as T & { message?: string; error?: string; diagnosticId?: string };
    return {
      data,
      message: data.message || data.error || "",
      diagnosticId: data.diagnosticId,
      rawBody,
    };
  } catch {
    return {
      data: null,
      message: `Server returned a non-JSON response (${response.status}). ${rawBody.slice(0, 240)}`,
      rawBody,
    };
  }
}
