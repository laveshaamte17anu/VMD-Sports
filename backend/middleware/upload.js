const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !process.env.CLOUDINARY_CLOUD_NAME.includes('your_')
);

let productStorage, galleryStorage, logoStorage;

if (hasCloudinary) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'vmd-sports/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
    }
  });

  galleryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'vmd-sports/gallery',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 2000, height: 2000, crop: 'limit', quality: 'auto' }]
    }
  });

  logoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'vmd-sports/brand',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      transformation: [{ quality: 'auto' }]
    }
  });
} else {
  // Local fallback disk storage
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const disk = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    }
  });

  productStorage = disk;
  galleryStorage = disk;
  logoStorage = disk;
}

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, svg)'), false);
  }
};

const uploadProduct = multer({ storage: productStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadGallery = multer({ storage: galleryStorage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });
const uploadLogo = multer({ storage: logoStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { cloudinary, uploadProduct, uploadGallery, uploadLogo, hasCloudinary };
