const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer  - File buffer from multer memory storage
 * @param {Object} options - Cloudinary upload options (folder, resource_type, etc.)
 * @returns {Promise<string>} - Secure URL of the uploaded file
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
};

module.exports = { cloudinary, uploadToCloudinary };
