export const MEDIA_PREFIX = '/api/media/';

export function isOwnMedia(path, folder) {
  return typeof path === 'string' && path.startsWith(`${MEDIA_PREFIX}${folder}/`) && !path.includes('..');
}

export function mediaUrl(c, path) {
  if (!path) return '';
  return path.startsWith(MEDIA_PREFIX) ? new URL(c.req.url).origin + path : path;
}

export function mediaKey(path) {
  return path && path.startsWith(MEDIA_PREFIX) ? path.slice(MEDIA_PREFIX.length) : null;
}
