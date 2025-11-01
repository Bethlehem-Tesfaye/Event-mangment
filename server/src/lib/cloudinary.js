import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  logger.warn(
    "Cloudinary credentials not set (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET)."
  );
} else {
  (async () => {
    try {
      if (cloudinary.api && typeof cloudinary.api.ping === "function") {
        await cloudinary.api.ping();
      } else if (
        cloudinary.api &&
        typeof cloudinary.api.resources === "function"
      ) {
        await cloudinary.api.resources({ max_results: 1 });
      }
      logger.info("Cloudinary connected and reachable");
    } catch (err) {
      logger.error("Cloudinary connection failed", {
        message: err?.message || String(err),
        stack: err?.stack
      });
    }
  })();
}

export default cloudinary;
