import { clearSession } from './session';

const BASE = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  const data = await res.json().catch(() => null);
  if (res.status === 401 && token) clearSession();
  if (!res.ok || !data?.success) {
    throw new ApiError(data?.error || 'Something went wrong. Try again.', res.status);
  }
  return data;
}

// Uploads one file to the API and resolves with its media path.
export function uploadFile(kind, file, token, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/api/upload?kind=${kind}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.timeout = 10 * 60 * 1000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status === 401) clearSession();
      if (xhr.status >= 200 && xhr.status < 300 && data?.url) resolve(data.url);
      else reject(new ApiError(data?.error || 'Upload failed. Try again.', xhr.status));
    };
    xhr.onerror = () => reject(new ApiError('Upload failed. Check your connection and try again.', 0));
    xhr.ontimeout = () => reject(new ApiError('Upload timed out. Try a smaller file or a better connection.', 0));
    xhr.send(file);
  });
}

export async function downloadTrack(track) {
  const res = await fetch(track.audioUrl);
  if (!res.ok) throw new ApiError('Download failed. Try again.', res.status);
  const blob = await res.blob();
  const ext = new URL(track.audioUrl).pathname.split('.').pop() || 'mp3';

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${track.artist} - ${track.title}.${ext}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);

  api(`/api/tracks/${track.id}/download`, { method: 'POST' }).catch(() => {});
}
