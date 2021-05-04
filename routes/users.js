const express = require('express') ;
const router = express.Router();
const  bcrypt = require('bcryptjs');
const passport = require('passport');

//Model
const User = require('../models/Users');
//Login page
router.get('/login',(req, res )=> res.render('login'));
//Register Page
router.get('/register',(req, res )=> res.render('register'));

//Register handle
router.post('/register', (req, res) =>{
    const {name, email, password, password2} = req.body ; //Gathering password from register page
    let errors = [];
    //check 
    if(!name || !email || !password || !password2){
        errors.push({msg: 'Please fill the required feild'});

    }
    //Check password
    if(password !== password2){
        errors.push({msg: 'Password do not match'});
    }
    //Password length
    if(password.length < 6){
        errors.push({msg: 'Password should be atleast 6 char'});
    }
    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
        //After Validation
        User.findOne({ email: email })
         .then(user => {
             //Exsitng user
             errors.push({msg: 'Email is already registred'})
             if(user){
                res.render('register',{
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
             } else{
                const newUser = new User({
                    name,
                    email,
                    password

                });
                // Encrypted password
                bcrypt.genSalt(10, (err,salt)=>
                 bcrypt.hash(newUser.password,salt,(err,hash) => {
                     if(err) throw err;
                      // Set Encrypted password of New user
                     newUser.password = hash;
                     //Saving New user
                     newUser.save()
                     .then(user => {
                         req.flash('success_msg','You are now registered and can login');
                         res.redirect('/users/login');
                     })
                     .catch(err => console.log(err))

                 }))
             }
         });

    }
});

//Login handling

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });
  
  // Logout
  router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });

module.exports = router;