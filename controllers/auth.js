var bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');
const crypto = require('crypto')

const User = require('../models/user');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sumansinghfire7870@gmail.com',
        pass: 'upqxivrpbufvysur'
    }
});


exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message && message.length){
        message = message[0]
    }else{
        message = null 
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        editing: false,
        errorMessage: message
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message && message.length) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } =  req.body;
    User.findOne({email})
        .then((user) => {
            if(!user){
                req.flash('error','Invalid Email or Password!!')
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
                req.flash('error', 'Invalid Password!!')
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
                    req.flash('error', 'Email All-ready Exist!!')
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
                        res.redirect('/');

                        const mailOptions = {
                            from: 'sumansinghfire7870@gmail.com',
                            to: email,
                            subject: 'My first Email!!!',
                            html: "<h1>You SignUp Successfully!!"
                        };

                        transporter.sendMail(mailOptions, (err,info) => {
                            if(err){
                                console.log(err,"Email Error!!!")
                            }
                            console.log(info, "Email Info !!!")
                        })

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

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message && message.length) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reser Password',
        errorMessage: message
    });
};

exports.postReset = (req,res, next) => {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.error(err);
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex');
        User.findOne({ email })
            .then((user) => {
                if(!user){
                    req.flash('error', `No Account Found With ${email}`);
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                user
            })
            .catch((err) => {
                console.log(err)
            })
    })
}