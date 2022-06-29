const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient;

let pass = 't80rQQFSpbZeUg7b'
let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(`mongodb+srv://sonu:${pass}@cluster0.pizod.mongodb.net/shop?retryWrites=true&w=majority`)
    .then(client => {
      console.log("DB Connected!!")
      _db = client.db()
      callback();
    })
    .catch(err => {
      console.log(err,"22222222222222222222222")
      throw err
    })
}

const getDb = () => {
  if(_db){
    return _db;
  }
  throw "No dababase Found!!"
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

