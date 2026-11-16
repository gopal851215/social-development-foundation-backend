const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.name === 'MulterError' ? 400 : (res.statusCode === 200 ? 500 : res.statusCode));

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
};

export { notFound, errorHandler };
