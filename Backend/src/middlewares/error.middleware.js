
export const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
};
