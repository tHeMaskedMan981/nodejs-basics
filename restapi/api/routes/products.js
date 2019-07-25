const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/product");
const checkAuth = require('../middleware/check-auth');

router.get("/", (req, res, next) => {
    Product.find()
    .select('name _id price')
    .exec()
    .then(docs => {
        console.log("From the database ", docs);
        const response = {
            count:docs.length,
            products:docs.map(doc => {
                return {
                    name:doc.name,
                    price:doc.price,
                    _id:doc._id,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/products/' + doc._id
                    }
                }
            })
        }
        if (docs){
            res.status(200).json(response);
        }
        else {
            res.status(404).json({
                message:"No entries found"
            });
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
});

router.post("/", checkAuth,  (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price
  });

  product
    .save()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "Product Created Successfully ",
        productCreated: {
            name:result.name,
            price:result.price,
            _id:result._id,
            request:{
                type:'GET',
                url:'http://localhost:3000/products/' + result._id
            }
        }
      });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error:error
        })
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select('_id name price')
    .exec()
    .then(doc => {
        console.log("From the database ", doc);
        if (doc){
            res.status(200).json({
                product:doc,
                request:{
                    type:'GET',
                    description:'Get the list of all the products available',
                    url:'http://localhost:3000/products/'
                }
            });
        }
        else {
            res.status(404).json({
                message:"No entry found for the provided product ID"
            });
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
});

router.delete("/:productId", (req, res, next) => {
    
    const id = req.params.productId;
    Product.remove({_id:id})
    .exec()
    .then(result => {
        console.log(result);    
        res.status(200).json(result)
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
});

router.patch("/:productId", (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};

    console.log("request body : ", req.body);

    for (const key in req.body){
        updateOps[key] = req.body[key];
    }
    Product.update({_id:id}, {$set:updateOps})
    .exec()
    .then(result => {
        console.log(result);    
        res.status(200).json(result)
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
});
module.exports = router;
