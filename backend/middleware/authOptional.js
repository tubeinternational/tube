const jwt = require("jsonwebtoken");

module.exports = function authOptional(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};
