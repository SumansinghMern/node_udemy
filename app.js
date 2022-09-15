const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan')

const errorController = require('./controllers/error');
const User = require("./models/user")
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSOWRD}@cluster0.pizod.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`

const app = express();


const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection:'sessions'
})

// Catch errors
store.on('error', function (error) {
  console.log(error);
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')
const { log } = require('console');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'mylog.log'),
  { flags:'a' }
)

app.use(helmet())
app.use(compression());
app.use(morgan('combined',{stream: accessLogStream}))

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null,'images')
  },
  filename: (req,file,cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
})

const fileFilter = (req,file,cb) => {
  if (
    file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg'
  ){
    cb(null, true)
  }else{
    cb(null, false)
  }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage:fileStorage,fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
}))
app.use(csrfProtection)

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLogedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error('sync Error')
  if (!req.session.userId){
    next();
  }else{
    User.findById(req.session.userId)
      .populate('cart.items.productId')
      .then(user => {
        // throw new Error('dummy');
        if(!user){
          return next();
        }
        req.user = user;
        // console.log("USER --->", user)
        next();
      })
      .catch(err => {
        // console.log(err)
        // throw new Error(err);
        next(new Error(err))
      });
  }
  
});


app.use(flash());

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500',errorController.get500)

app.use(errorController.get404);

// app.use((error, req, res, next) => {
//   // res.redirect('/500');
//   res.status(500).render('500', { pageTitle: 'Error!!', path: '/500' });

// })

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

mongoose.connect(MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 3000, () => {
      // User.findOne().then(user => {
      //   if (!user) {
      //     let user = new User({
      //       name: "Sonu Singh",
      //       email: "example@gmail.com",
      //       cart: {
      //         items: []
      //       }
      //     })
      //     user.save()

      //   }
      // })
      console.log("App is listning On 3000")
    })
  })
  .catch(err => {
    console.log(err);
  })

