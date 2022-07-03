const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const User = require("./models/user")


const app = express();
const {mongoConnect} = require('./util/database')

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin'); 
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findUserById("62c1d48c15efdfed82e93c0c")
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      console.log("USER --->",user)
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000,() => {
    console.log(`Server is connect to PORT 3000`);
    // const user = new User('Sonu','example@gmail.com');
    // user.save()
    //   .then((result) => {
    //     console.log(result);
    //   })
  })
})

