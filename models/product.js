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
      console.log("11111111111111111111",this._id)
      mycol = db.collection('products').updateOne({_id: new ObjectId(this._id)},{$set: this})
    }else{
      console.log("2222222222222222222")
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

  static deleteById(prodId){
    const db = getDb();
    db.collection('products')
      .deleteOne({_id:new ObjectId(prodId)})
      .then((result) => {
        console.log("Product Deleted");
        return result;
      })
      .catch((err) => console.log(err))
  }
}



module.exports = Product;
