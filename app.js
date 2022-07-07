const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const errorController = require('./controllers/error');
const User = require("./models/user")


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { log } = require('console');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById("62c7244240cc944e33ef289e")
    // .populate('cart.items.productId')
    .then(user => {
      req.user = user;
      console.log("USER --->", user)
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// mongoConnect(() => {
//   app.listen(3000,() => {
//     console.log(`Server is connect to PORT 3000`);
//     const user = new User('Sonu','example@gmail.com');
//     user.save()
//       .then((result) => {
//         console.log(result);
//       })
//   })
// })

mongoose.connect('mongodb+srv://sonu:t80rQQFSpbZeUg7b@cluster0.pizod.mongodb.net/shop?retryWrites=true&w=majority')
  .then((result) => {
    app.listen(3000, () => {
      User.findOne().then(user => {
        if (!user) {
          let user = new User({
            name: "Sonu Singh",
            email: "example@gmail.com",
            cart: {
              items: []
            }
          })
          user.save()

        }
      })
      console.log("App is listning On 3000")
    })
  })
  .catch(err => {
    console.log(err);
  })

