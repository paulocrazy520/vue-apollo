const prisma = require("../prisma");

function posts(parent, args, context, info) {
  return prisma.user
    .findUnique({
      where: {
        id: parent.id,
      },
    })
    .posts();
}

module.exports = {
  posts,
};
