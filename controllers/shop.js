const Product = require('../models/product');
const Order = require('../models/order');
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(`${process.env.STRIPE_KEY}`)

const PDFKit = require("pdfkit");
const ITEM_PER_PAGE = 2

exports.getProducts = (req, res, next) => {
  // Product.find()
  //   .then(products => {
  //     res.render('shop/product-list', {
  //       prods: products,
  //       pageTitle: 'All Products',
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => {
  //     let error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
  let page = +req.query.page || 1;
  let totelItems;

  Product.find()
    .count()
    .then((count) => {
      totelItems = count;
      return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totelItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totelItems / ITEM_PER_PAGE)
      });
    })
    .catch(err => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log("🚀 ~ file: shop.js ~ line 19 ~ prodId", prodId)
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  let page = +req.query.page || 1;
  let totelItems;

  Product.find()
    .count()
    .then((count) => {
      totelItems = count;
      return Product.find()
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totelItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totelItems / ITEM_PER_PAGE)
      });
    })
    .catch(err => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  // console.log(req.user," FFFFFFFFF")
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId, " TTTTTTTTTTTTTTTTTTTT")
  Product.findById(prodId)
    .then((product) => {
      console.log(product, " VVVVVVVVVVVVVVVVVVVV")
      return req.user.addToCart(product)
    })
    .then((result) => {
      console.log(result, " RRRRRRRRRRRRR")
      console.log(result);
      res.redirect('/cart');
    })
    .catch(
      (err) => {
        console.log(err)
        //   let error = new Error(err);
        //   error.httpStatusCode = 500;
        //   return next(error);
      }
    )

};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId, " FFFFFFFFFFF")
  req.user
    .deleteCartItem(prodId)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })

};

exports.postOrder = (req, res, next) => {

  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } }
      });
      const order = new Order({
        user: {
          name: user.name,
          userId: user._id,
        },
        products: products
      })
      // req.user.cart.items = [];
      req.user.clearCart();
      return order.save();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

getLines = (products) => new Promise(async (resolve, reject) => {
  // let data = products.map(async (p) => {
  let data = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let product = await stripe.products.create({ name: p.productId.title, description: p.productId.description });

    let price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.productId.price * 100,
      currency: 'inr',
    });

    console.log(product, "productproductproduct", price)

    let line = {
      price: price.id,
      quantity: p.quantity
    }

    data.push(line)
  }

  resolve(data)
})


exports.getCheckout = (req, res, next) => {
  // res.render('shop/checkout',{
  //   path: '/checkout',
  //   pageTitle: 'checkout',
  // })
  let products;
  let totel = 0
  req.user
    .populate('cart.items.productId')
    .then(async (user) => {
      products = user.cart.items;
      products.forEach((p) => {
        totel += p.quantity * p.productId.price
      })

      let lines = await getLines(products)

      console.log(lines, " SSSSSSSSSSSSSSSSSSSSSSSSS")
        if (lines && lines.length) {
          return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lines,
            mode: 'payment',
            success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
            cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancle',

          })
        }

    })
    .then((session) => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: totel,
        sessionId: session.id
      });
    })
    .catch(err => {
      let error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getInvoice = (req, res, next) => {
  let orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        console.log("No Order Found!!")
        return
      }

      if (order.user.userId.toString() === req.user._id.toString()) {
        let invoiceName = 'invoice' + '-' + orderId + '.pdf'

        const invoicePath = path.join('data', 'invoice', invoiceName)

        let pdfDoc = new PDFKit();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

        pdfDoc.pipe(fs.createWriteStream(invoicePath));

        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', {
          underline: true,
        });

        pdfDoc.text('---------------------------------')

        let totelPrice = 0;

        order.products.forEach((prod) => {
          totelPrice += prod.quantity * prod.product.price;
          pdfDoc.text(`${prod.product.title} --> ${prod.quantity} x ${prod.product.price}`)
        });

        pdfDoc.text(`Totel = ${totelPrice}`)

        pdfDoc.end();

        // fs.readFile(invoicePath, (err, data) => {
        //   if (err) {
        //     return next(err)
        //   }
        //   res.setHeader('Content-Type', 'application/pdf');
        //   res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
        //   res.send(data)
        // })

        // let file = fs.createReadStream(invoicePath);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

        // file.pipe(res);// res is writebale Stream.

      }
    })
    .catch(err => console.log(err))

}
