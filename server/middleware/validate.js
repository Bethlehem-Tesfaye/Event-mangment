import CustomError from "../utils/customError.js";

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    return next();
  } catch (error) {
    if (error.issues) {
      const message = error.issues.map((e) => e.message).join(", ");
      return next(new CustomError(message, 400));
    }
    return next(new CustomError("Invalid request data", 400));
  }
};
