const pubSub = require("../pub-sub");

const postCreated = {
  subscribe(parent, args, context, info) {
    return pubSub.asyncIterator(["POST_CREATED"]);
  },
  resolve(payload) {
    return payload;
  },
};

module.exports = {
  postCreated,
};
