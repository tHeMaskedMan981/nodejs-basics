const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length > 0) {
        res.status(409).json({
          message: "Email ID already exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User Created",
                  user: result
                });
              })
              .catch(error => {
                console.log(error);
                res.status(500).json({
                  error: error
                });
              });
          }
        });
      }
    })
    .catch();
});

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth Failed"
        });
      }

      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth Failed"
          });
        }
        if (result) {
          console.log("jwt private key", process.env.JWT_KEY);
          const token = jwt.sign(
            {
              email: user[0].email,
              _id: user[0]._id
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Auth Successful",
            token: token
          });
        }

        res.status(401).json({
          message: "Auth Failed"
        });
      });
    })
    .catch();
});

router.get("/", (req, res, next) => {
  User.find()
    .select("email _id password")
    .exec()
    .then(docs => {
      console.log("From the database ", docs);
      const response = {
        count: docs.length,
        users: docs.map(doc => {
          return {
            email: doc.email,
            password: doc.password,
            _id: doc._id
          };
        })
      };
      if (docs) {
        res.status(200).json(response);
      } else {
        res.status(404).json({
          message: "No entries found"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/:userId", (req, res, next) => {
  const id = req.params.userId;
  User
    .findById(id)
    .select("_id email password")
    .exec()
    .then(doc => {
      console.log("From the database ", doc);
      if (doc) {
        res.status(200).json({
          user: doc,
          request: {
            type: "GET",
            description: "Get the list of all the users available",
            url: "http://localhost:3000/user/"
          }
        });
      } else {
        res.status(404).json({
          message: "No entry found for the provided user ID"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:userId", (req, res, next) => {
  const id = req.params.userId;
  User
    .remove({ _id: id })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
