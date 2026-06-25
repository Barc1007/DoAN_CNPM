const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    result: data,
  });
};

const error = (res, message = 'Internal Server Error', statusCode = 500) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    result: null,
  });
};

module.exports = { success, error };
