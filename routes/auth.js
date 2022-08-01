const express = require('express');
const { check,body } = require('express-validator/check');
const { MinKey } = require('mongodb');

const authController = require('../controllers/auth');
const User = require('../models/user')

const router = express.Router();

router.get('/login', authController.getLogin)

router.get('/signup', authController.getSignup);

router.post('/login',[
    check('email')
        .isEmail()
        .withMessage('Please enter a valid Email.'),    
], authController.postLogin);

router.post('/signup',
    [
        check('email')
        .isEmail()
        .withMessage('Please enter a valid Email.')
        .custom((value,{req}) => {
            // if(value === 'test@test.com'){
            //     throw new Error('this Email id is forbiten')
            // }
            // return true
            return User.findOne({ email: value }) 
                .then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject(
                            "Email Exist allready, Please Try with another one!"
                        )
                    }
                })    
        }), 
        body('password', 'Please enter a valid Password.')
            .isLength({min:5})
            .isAlphanumeric(),
        body('confirmPassword') .custom((value,{req}) => {
            if(value !== req.body.password){
                throw new Error('Password has to match')
            }
            return true
        })   
    ],    
    authController.postSignup
 );

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password',authController.postNewPassword)

module.exports = router;