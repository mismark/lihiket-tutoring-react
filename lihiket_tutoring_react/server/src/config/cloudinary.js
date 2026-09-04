const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload a buffer to Cloudinary with auto resource_type detection.
 *
 * For PDF/doc files:  resource_type = 'raw'  → stored at /raw/upload/
 * For images:         resource_type = 'image' → stored at /image/upload/
 * For videos:         resource_type = 'video' → stored at /video/upload/
 * For auto-detect:    resource_type = 'auto'  → Cloudinary decides
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        type:        'upload',   // always public delivery
        access_mode: 'public',   // explicitly public
        timeout:     600000,     // 10 min timeout for large video uploads
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by its URL.
 * Extracts the public_id from the URL automatically.
 */
const deleteFromCloudinary = async (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return;
  try {
    // Extract public_id: everything between /upload/vXXXXX/ and the extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.\w+)?$/);
    if (!match) return;
    const publicId = match[1];
    // Detect resource_type from URL
    const resourceType = url.includes('/raw/') ? 'raw' : url.includes('/video/') ? 'video' : 'image';
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
