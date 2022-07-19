var bcrypt = require('bcryptjs');

const User = require('../models/user')


exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        editing: false,
        isAuthenticated: req.session.isLogedIn
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } =  req.body;
    User.findOne({email})
        .then((user) => {
            if(!user){
                return res.redirect('/login')
            }
            bcrypt.compare(password,user.password)
            .then((doMatch) => {
                if(doMatch){
                    req.session.userId = user._id;
                    req.session.isLogedIn = true;
                    return req.session.save((err) => {
                        if (err) console.error(err);
                        res.redirect('/');
                    })
                }
                res.redirect('/login')
            })
            .catch((err) => {
                console.log(err)
                return res.redirect('/login')
            })
        })
        .catch((err) => {
            console.log(err," XXX");
            res.redirect('/login')
        })
    
};

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    if (email && password) {
        User.findOne({ email })
            .then((userDoc) => {
                if (userDoc) {
                    return res.redirect('/signup')
                }

                return bcrypt.hash(password, 12)
                    .then((hashedPassword) => {
                        const user = new User({
                            email,
                            password: hashedPassword,
                            cart: { items: [] }
                        })
                        return user.save();
                    })
                    .then((result) => {
                        res.redirect('/')
                    }).catch((err) => {
                        console.log(err);
                    });

            })
            .catch((err) => {
                console.log(err);
            })
    } else {
        res.redirect('/signup')
    }
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};