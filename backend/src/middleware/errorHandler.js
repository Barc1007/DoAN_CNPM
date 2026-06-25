const { error } = require('../utils/response');

const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return error(res, message, statusCode);
};

module.exports = errorHandler;
