/* eslint-disable no-unused-vars */

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";

export const makeUploader = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      format: async (req, file) => "png",
      public_id: (req, file) => `${Date.now()}-${req.userId}`
    }
  });
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  };

  return multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });
};

export const profileUpload = makeUploader("profiles");
