const { ObjectId } = require('mongodb');
const { getDb } = require('../util/database')

class Product{
  constructor(title,price,imageUrl,description,id){
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this._id = id
  }
  save() {
    const db = getDb();
    let mycol;
    if(this._id){
      mycol = db.collection('products').updateOne({_id: this._id},{$set: this})
    }else{
      mycol = db.collection('products').insertOne(this)
    }
    return mycol
      .then((result) => {
        console.log(result)
      })
      .catch(err => {
      console.log(err);
    });
  }

  static findAll() {
    const db = getDb();
    return db.collection('products')
      .find()
      .toArray()
      .then((result) => {
        console.log(result)
        return result;
      })
      .catch(err => {
        console.log(err);
      })
  }
  
  static findById(id) {
    const db = getDb();
    const query = {"_id":ObjectId(`${id}`)}
    return db.collection('products')
      .findOne(query)
      // .toArray()
      .then((result) => {
        return result;
      })
      .catch(err => console.log(err))
  }
}



module.exports = Product;
