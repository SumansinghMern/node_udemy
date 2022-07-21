const { ObjectId } = require('mongodb');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({ title, price, imageUrl, description, userId:req.user._id })
    product.save()
    .then(result => {
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
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
      console.log(product.userId.toString(), " EEEEEEEE", req.user._id.toString())
      if (product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err))
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  // const product = new Product(updatedTitle, updatedPrice, updatedImageUrl, updatedDesc, prodId)

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      product.save().then((product) => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      })
    })
    
    .catch(err => console.log(err));
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
    .catch(err => console.log(err))
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId, " RRRRRRRRRr")

  let result = await Product.findByIdAndRemove(prodId)
  if(result){
    res.redirect('/admin/products');
  }
};
