/**
 * Centralized utility to resolve image URLs correctly across local dev and deployed production (Vercel/Render).
 */
export const getProductImageUrl = (imageName, fallbackId = 'item') => {
  if (!imageName || imageName === 'default.png') {
    return `https://picsum.photos/seed/${fallbackId}/400/300`;
  }

  // Already a full absolute URL (e.g. Cloudinary, AWS S3, Picsum, external)
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }

  // Base backend URL resolution (strip any trailing /api or slash)
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl && envApiUrl.trim()) {
    const cleanBase = envApiUrl.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '');
    return `${cleanBase}/images/${imageName}`;
  }

  // Relative path (proxied by Vite in dev or vercel.json in deployment)
  return `/images/${imageName}`;
};
