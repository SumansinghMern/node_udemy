const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model("Product",productSchema);

// const { ObjectId } = require('mongodb');
// const { getDb } = require('../util/database')

// class Product{
//   constructor(title,price,imageUrl,description,id,userId){
//     this.title = title;
//     this.price = price;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this._id = id ? new ObjectId(id) : null
//     this.userId = new ObjectId(userId)
//   }
//   save() {
//     const db = getDb();
//     let mycol;
//     if(this._id){
//       mycol = db.collection('products').updateOne({_id: this._id},{$set: this})
//     }else{
//       mycol = db.collection('products').insertOne(this)
//     }
//     return mycol
//       .then((result) => {
//         console.log(result)
//       })
//       .catch(err => {
//       console.log(err);
//     });
//   }

//   static findAll() {
//     const db = getDb();
//     return db.collection('products')
//       .find()
//       .toArray()
//       .then((result) => {
//         console.log(result)
//         return result;
//       })
//       .catch(err => {
//         console.log(err);
//       })
//   }
  
//   static findById(id) {
//     const db = getDb();
//     const query = {"_id":ObjectId(`${id}`)}
//     return db.collection('products')
//       .findOne(query)
//       // .toArray()
//       .then((result) => {
//         return result;
//       })
//       .catch(err => console.log(err))
//   }

//   static deleteById(prodId){
//     return new Promise((resolve, reject) => {
//       const db = getDb();
//       db.collection('products')
//         .deleteOne({ _id: new ObjectId(prodId) })
//         .then((result) => {
//           console.log(result, "Product Deleted");
//           resolve(result)
//         })
//         .catch((err) => {
//           console.log(err)
//           reject(err)
//         })
//     })
    
//   }
// }



// module.exports = Product;
