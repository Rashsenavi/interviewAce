import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;

if (!CLOUDINARY_CLOUD_NAME) {
  throw new Error("FATAL: CLOUDINARY_CLOUD_NAME environment variable is not set");
}
if (!CLOUDINARY_API_KEY) {
  throw new Error("FATAL: CLOUDINARY_API_KEY environment variable is not set");
}
if (!CLOUDINARY_API_SECRET) {
  throw new Error("FATAL: CLOUDINARY_API_SECRET environment variable is not set");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
export { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET };
