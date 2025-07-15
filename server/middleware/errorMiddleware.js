/* eslint-disable no-unused-vars */
const errorMiddleware = async (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error"
  });
};

export default errorMiddleware;
