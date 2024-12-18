const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class UploadService {
  // Upload file to Cloudinary
  static async uploadFile(file, folder = 'chat') {
    return new Promise((resolve, reject) => {
      // Create a write stream to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: folder,
          resource_type: 'auto' // Automatically detect file type
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result.secure_url);
        }
      );

      // Convert buffer to stream
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  // Determine file type
  static getFileType(mimetype) {
    if (mimetype.startsWith('image/')) return 'file';
    if (mimetype.startsWith('video/')) return 'video';
    return 'file';
  }
}

module.exports = UploadService;
