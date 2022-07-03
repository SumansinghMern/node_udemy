const { ObjectId } = require('mongodb');
const { getDb } = require('../util/database')

class User {
  constructor(username, email,cart,id){
    this.name = username;
    this.email = email;
    this._id = id ? new ObjectId(id) : null;
    this.cart = cart; // {items : [{product}]}
  }

  save(){
    let db = getDb();
    let myCol
    if(this._id){
      myCol = db.collection('users').updateOne({_id: this._id},{$set: this})
    }else{
      myCol = db.collection('users').insertOne(this)
    }
    return myCol.then((result) => {
      console.log(result);
    }).catch((err) => console.log(err))
  }

  addToCart(product){
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString()
    })

    let newQuantity = 1;
    let updatedCartItems = [...this.cart.items]

    if (cartProductIndex >= 0){
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }else{
      updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity })
    }

    const updatedProduct = { items: updatedCartItems }
    const db = getDb();

    return db.collection('users').updateOne(
      {_id:this._id},
      {$set: {cart: updatedProduct}}
    )
  }

  getCart(){
    const db = getDb();
    const productIds = this.cart.items.map(i => {
      return i.productId
    })
    return db.collection('products').find({_id: {$in: productIds}}).toArray()
                  .then((products) => {
                    return products.map(p => {
                      return {
                        ...p,
                        quantity: this.cart.items.find(i => {
                          return i.productId.toString() === p._id.toString()
                        }).quantity
                      }
                    })
                  })
  }

  static findUserById(userId){
    return new Promise((resolve,reject) => {
      let db = getDb();
      let query = { _id: new ObjectId(userId) }
      db.collection('users').findOne(query)
        .then((result) => {
          resolve(result) ;
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        })
    })
    
  }
}

module.exports = User;
