// Turn a database failure into a JSON error. Leave a response that was already sent alone.
function errorHandler(error, req, res, next) {
    if (res.headersSent) {
      return next(error);
    }
    console.error(error);
    res.status(500).json({ error: "Database request failed." });
  }
  
  module.exports = errorHandler;