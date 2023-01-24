const bcrypt = require("bcryptjs");
const utils = require("../utils");
const prisma = require("../prisma");
const pubSub = require("../pub-sub");

async function signup(parent, args, context, info) {
  const salt = await bcrypt.genSalt(Number(process.env.SALT_LENGTH));
  const password = await bcrypt.hash(args.password, salt);
  const user = await prisma.user.create({
    data: {
      ...args,
      password,
    },
  });

  return {
    token: utils.createToken(user.id),
    user,
  };
}

async function login(parent, args, context, info) {
  const throwLoginError = () => {
    throw new Error("Invalid email or password");
  };

  const user = await prisma.user.findUnique({
    where: {
      email: args.email,
    },
  });

  if (!user) throwLoginError();

  const valid = await bcrypt.compare(args.password, user.password);

  if (!valid) throwLoginError();

  return {
    token: utils.createToken(user.id),
    user,
  };
}

async function createPost(parent, args, context, info) {
  const userId = utils.getUserId(context.req);

  const post = await prisma.post.create({
    data: {
      url: args.url,
      title: args.title,
      postedBy: {
        connect: {
          id: userId,
        },
      },
    },
  });

  pubSub.publish("POST_CREATED", post);

  return post;
}

module.exports = {
  signup,
  login,
  createPost,
};
