import cloudinary from 'cloudinary';

const Cloudinary = cloudinary.v2;
Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

export const fileUpload = async (file: string) => {
  return new Promise((resolve) => {
    Cloudinary.uploader.upload(
      file,
      { folder: '/insta-clone' },
      (error, res) => {
        if (error) {
          throw new Error(`${error.message}`);
        }
        resolve(res!.secure_url);
      }
    );
  });
};
