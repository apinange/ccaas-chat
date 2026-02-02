import multer from 'multer';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size exceeds the limit (10MB)'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  
  // Validation errors
  if (err.message && err.message.includes('must be')) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  
  // Default error
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

