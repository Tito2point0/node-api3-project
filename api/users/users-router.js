const express = require("express");
const {
  validateUserId,
  validateUser,
  validatePost,
} = require("../middleware/middleware");
const User = require("./users-model");
const Posts = require("../posts/posts-model");

// You will need `users-model.js` and `posts-model.js` both
// The middleware functions also need to be required

const router = express.Router();

router.get("/", (req, res, next) => {
  User.get()
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/:id", validateUserId, (req, res) => {
  res.json(req.user);
});

router.post("/", validateUser, (req, res, next) => {
  User.insert({ name: req.name })
    .then((newUser) => {
      res.status(201).json(newUser);
    })
    .catch(next);
});

router.put("/:id", validateUserId, validateUser, (req, res, next) => {
  User.update(req.params.id, { name: req.name })
    .then(() => {
      return User.getById(req.params.id);
    })
    .then((updateUser) => {
      res.json(updateUser);
    })
    .catch(next);
});

router.delete("/:id", validateUserId, (req, res, next) => {
  // RETURN THE FRESHLY DELETED USER OBJECT
  // this needs a middleware to verify user id
  User.remove(req.params.id)
    .then(() => {
      res.json(req.user);
    })
    .catch(next);
});

router.get("/:id/posts", validateUserId, (req, res, next) => {
  User.getUserPosts(req.params.id)
    .then((result) => {
      res.json(result);
    })
    .catch(next);
});

router.post(
  "/:id/posts",
  validateUserId,
  validatePost,
  async (req, res, next) => {
    try {
      const newPost = await Posts.insert({
        user_id: req.params.id,
        text: req.text,
      });
      res.status(201).json(newPost)
    } catch (err) {
      next(err);
    }
  }
);

router.use((err, req, res, next) => {// eslint-disable-line
  res.status(err.status || 500).json({
    customMessage: "something tragic inside router",
    message: err.message,
    stack: err.stack,
  });
});
// do not forget to export the router

module.exports = router;