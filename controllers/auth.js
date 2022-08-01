var bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator/check');

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
    if (message && message.length) {
        message = message[0]
    } else {
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
        errorMessage: message,
        oldInput: {
            email:"",
            password:"",
            confirmPassword:""
        }
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then((user) => {
            if (!user) {
                req.flash('error', 'Invalid Email or Password!!')
                return res.redirect('/login')
            }
            bcrypt.compare(password, user.password)
                .then((doMatch) => {
                    if (doMatch) {
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
            let error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

};

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array(), " DDDDDDDDDDDDDDDDDDD")
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email,
                password,
                confirmPassword
            }
        });
    }
    if (email && password) {
        bcrypt.hash(password, 12)
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

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(err, "Email Error!!!")
                    }
                    console.log(info, "Email Info !!!")
                })

            }).catch((err) => {
                let error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
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

exports.postReset = (req, res, next) => {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.error(err);
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex');
        User.findOne({ email })
            .then((user) => {
                if (!user) {
                    req.flash('error', `No Account Found With ${email}`);
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then((result) => {
                res.redirect('/');
                const mailOptions = {
                    from: 'sumansinghfire7870@gmail.com',
                    to: email,
                    subject: 'Reset Password!',
                    html: `
                      <p>You Have Requested For Password Update!!</p>
                      <P> Click This <a href="http://localhost:3000/reset/${token}"> Link </a>For PassWord Updated</p>
                    `
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(err, "Email Error!!!")
                    }
                    console.log(info, "Email Info !!!")
                })
            })
            .catch((err) => {
                let error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token/* , resetTokenExpiration :{ $gt: Date.now() } */ })
        .then((user) => {
            let message = req.flash('error');
            if (message && message.length) {
                message = message[0]
            } else {
                message = null
            }
            let view;
            if (user.resetTokenExpiration > Date.now()) {
                view = true
            } else {
                view = false
            }
            console.log(user.resetTokenExpiration > Date.now(), "USER-----------", view)
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'Set Password',
                errorMessage: message,
                userId: user._id.toString(),
                pageView: view
            });
        })
        .catch((err) => {
            let error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}

exports.postNewPassword = (req, res, next) => {
    const { userId, password } = req.body;
    User.findById(userId)
        .then((user) => {
            bcrypt.hash(password, 12)
                .then((encryptPassword) => {
                    user.password = encryptPassword;
                    user.resetTokenExpiration = Date.now();
                    return user.save();
                })
                .then((responce) => {
                    res.redirect('/login')
                })
                .catch((err) => {
                    console.log(err, ' DDDDDDDD')
                })
            // console.log(user,"UUUUUUUUU",password)
        })
        .catch((err) => {
            let error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}