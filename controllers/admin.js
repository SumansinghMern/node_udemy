const { ObjectId } = require('mongodb');
const Product = require('../models/product');
const { validationResult } = require('express-validator/check');
const path = require('path');
const rootPath = require('../util/path')

const { deleteFile } = require('../util/file')
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: ''
  });
};

exports.postAddProduct = (req, res, next) => {
  // const _id = new ObjectId('62d65330a222a1b89842868d');
  const title = req.body.title;
  const image = req.file;
  console.log(image," FFFFFFFFFFFFFFFFFFFFFF")
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if(!image){
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      editing: false,
      hasError: true,
      errorMessage: 'Attached File is Not an Image',
      product: {
        title,
        price,
        description
      }
    });
  }

  const imageUrl = `/${image.path}`;

  if (!errors.isEmpty()) {
    console.log(errors.array(), " DDDDDDDDDDDDDDDDDDD")
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      editing: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title,
        price,
        description
      }
    });
  }
  const product = new Product({ title, price, imageUrl, description, userId:req.user._id })
    product.save()
    .then(result => {
      console.log(product,'Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err," EEEEEEEEEEEE")
      // let error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      console.log(product, " EEEEEEEE")
      if (product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: ''
      });
    })
    .catch(err => {
      console.log(err," ERRRRRRRRRR")
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  console.log(image, " FFFFFFFFFFFFFFFFFFFFFF")
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
  // const product = new Product(updatedTitle, updatedPrice, updatedImageUrl, updatedDesc, prodId)

  if (!errors.isEmpty()) {
    console.log(errors.array(), " DDDDDDDDDDDDDDDDDDD")
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      editing: true,
      errorMessage: errors.array()[0].msg,
      product: {
        _id: prodId,
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc
      }
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      if(image){
        let imagePath = path.join(rootPath + product.imageUrl)
        deleteFile(imagePath)
        product.imageUrl = `/${image.path}`;
      }
      product.description = updatedDesc;
      product.save().then((product) => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      })
    })
    
    .catch(err => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId : req.user._id})
    // .select('name price imageUrl -_id')
    .populate('userId','name -_id')
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId, " RRRRRRRRRr")

  let result = await Product.findByIdAndRemove(prodId);
  console.log(result," bbbbbbbbbbbbbbbbbbbbbbbb")
  if(result){
    let imagePath = path.join(rootPath + result.imageUrl)
    deleteFile(imagePath)
    res.redirect('/admin/products');
  }
};
