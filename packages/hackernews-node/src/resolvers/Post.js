const prisma = require("../prisma");

function postedBy(parent, args, context, info) {
  return prisma.post
    .findUnique({
      where: {
        id: parent.id,
      },
    })
    .postedBy();
}

module.exports = {
  postedBy,
};
