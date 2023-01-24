const prisma = require("../prisma");

function feed(parent, args, context, info) {
  return prisma.post.findMany();
}

module.exports = {
  feed,
};
