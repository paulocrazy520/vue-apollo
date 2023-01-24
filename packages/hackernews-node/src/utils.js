const jwt = require("jsonwebtoken");

function createToken(userId) {
  return jwt.sign({ userId }, process.env.APP_SECRET);
}

function verifyToken(token) {
  return jwt.verify(token, process.env.APP_SECRET);
}

function getTokenFromReq(req) {
  if (!req) return;

  const authHeader = req.headers.authorization;

  if (!authHeader) return;

  return authHeader.replace("Bearer ", "");
}

function getUserId(req, authToken) {
  const throwNotAuthenticatedError = () => {
    throw new Error("Not authenticated");
  };

  const token = authToken ? authToken : getTokenFromReq(req);

  if (!token) throwNotAuthenticatedError();

  const { userId } = verifyToken(token);

  if (!userId) throwNotAuthenticatedError();

  return userId;
}

module.exports = {
  createToken,
  getUserId,
};
