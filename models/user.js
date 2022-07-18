const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId:{type: Schema.Types.ObjectId, ref:'Product', required: true},
            quantity: { type: Number, required:true}
        }]
    }
})

userSchema.methods.addToCart = function(product){
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString()
    });

    let newQuantity = 1;
    let updatedCartItems = this.cart && this.cart.items && this.cart.items.length && [...this.cart.items] || []

    if (cartProductIndex >= 0){
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }else{
      updatedCartItems.push({ productId: product._id, quantity: newQuantity })
    }

    const updatedCart = { items: updatedCartItems }

    this.cart = updatedCart;

    return this.save();
}

userSchema.methods.deleteCartItem = function (prodId){
    let updatedCart = this.cart.items.filter(i => {
      return i.productId.toString() !== prodId.toString()
    })

    this.cart = {items: updatedCart}

    return this.save()

}

userSchema.methods.clearCart = function (){
  this.cart = {items: []};
  return this.save();
}

// userSchema.methods.getCartData = function(){
//     // const db = getDb();
//     const productIds = this.cart.items.map(i => {
//       return i.productId
//     })

//     return 
//     // return db.collection('products').find({_id: {$in: productIds}}).toArray()
//     //               .then((products) => {
//     //                 return products.map(p => {
//     //                   return {
//     //                     ...p,
//     //                     quantity: this.cart.items.find(i => {
//     //                       return i.productId.toString() === p._id.toString()
//     //                     }).quantity
//     //                   }
//     //                 })
//     //               })
// }

module.exports = mongoose.model('User', userSchema);
// const { ObjectId } = require('mongodb');
// const { getDb } = require('../util/database')

// class User {
//   constructor(username, email,cart,id){
//     this.name = username;
//     this.email = email;
//     this._id = id ? new ObjectId(id) : null;
//     this.cart = cart; // {items : [{product}]}
//   }

//   save(){
//     let db = getDb();
//     let myCol
//     if(this._id){
//       myCol = db.collection('users').updateOne({_id: this._id},{$set: this})
//     }else{
//       myCol = db.collection('users').insertOne(this)
//     }
//     return myCol.then((result) => {
//       console.log(result);
//     }).catch((err) => console.log(err))
//   }

//   addToCart(product){
//     const cartProductIndex = this.cart && this.cart.items && this.cart.items.length ? this.cart.items.findIndex(cp => {
//       return cp.productId.toString() === product._id.toString()
//     }) : -1

//     let newQuantity = 1;
//     let updatedCartItems = this.cart && this.cart.items && this.cart.items.length && [...this.cart.items] || []

//     console.log(cartProductIndex, " DDDDDDDDDDDDDDDDd", this.cart.items, product)

//     if (cartProductIndex >= 0){
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     }else{
//       updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity })
//     }

//     const updatedProduct = { items: updatedCartItems }
//     const db = getDb();

//     return db.collection('users').updateOne(
//       {_id:this._id},
//       {$set: {cart: updatedProduct}}
//     )
//   }

//   getCartData(){
//     const db = getDb();
//     const productIds = this.cart.items.map(i => {
//       return i.productId
//     })
//     return db.collection('products').find({_id: {$in: productIds}}).toArray()
//                   .then((products) => {
//                     return products.map(p => {
//                       return {
//                         ...p,
//                         quantity: this.cart.items.find(i => {
//                           return i.productId.toString() === p._id.toString()
//                         }).quantity
//                       }
//                     })
//                   })
//   }

//   deleteCartItem(prodId){
//     const db = getDb();
//     let updatedCart = this.cart.items.filter(i => {
//       return i.productId.toString() !== prodId.toString()
//     })

//     return db.collection('users').updateOne(
//       { _id: this._id },
//       { $set: { cart: {items: updatedCart} } }
//     )
//   }

//   addOrder() {
//     return new Promise((resolve, reject) => {
//       const db = getDb();
//       this.getCartData().then(products => {
//         const order = {
//           items : products,
//           user: {
//             _id: new ObjectId(this._id),
//             name: this.name,
//             email: this.email
//           }
//         }
//         return db.collection('orders').insertOne(order)
//       })
//         .then((result) => {
//           console.log(result, " Order Added..");
//           db.collection('users').updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           ).then((resive) => {
//             resolve(resive)
//           })
//           .catch((err) => reject(err))
//         })
//         .catch((err) => console.log(err))
//     })
    
//   }

//   getOrders() {
//     const db = getDb();
//     return db.collection('orders').find({"user._id": this._id}).toArray()
//   }

//   static findUserById(userId){
//     return new Promise((resolve,reject) => {
//       let db = getDb();
//       let query = { _id: new ObjectId(userId) }
//       db.collection('users').findOne(query)
//         .then((result) => {
//           resolve(result) ;
//         })
//         .catch((err) => {
//           console.log(err);
//           reject(err);
//         })
//     })
    
//   }
// }

// module.exports = User;
