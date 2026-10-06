import { API_BASE } from './config';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Thin fetch wrapper. Absolute URLs (e.g. output_text_url) are passed through,
 * otherwise the path is resolved against the Murdock API base.
 */
export async function request(path, { method = 'GET', token, body, signal, headers } = {}) {
  const url = /^https?:\/\//.test(path) ? path : `${API_BASE}${path}`;

  const response = await fetch(url, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      // Murdock expects the raw GitHub OAuth token in the `authorization` header.
      ...(token ? { Authorization: token } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json())?.detail ?? '';
    } catch {
      /* not JSON */
    }
    throw new ApiError(detail || `${response.status} ${response.statusText}`, response.status);
  }

  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? response.json() : response.text();
}
