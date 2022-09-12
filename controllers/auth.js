const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator/check');


exports.signup = (req, res, next) => {
  const errors = validationResult(req);

  if(!errors.isEmpty())
  {
    const error = new Error('validation failed, please check your data');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
 let  name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
   // -------
//   confirmPassword = req.body.confirmPassword;
    bcrypt.hash(password,12).then(hashedPassword => {
       const user = new User({
         name:name,
         email:email,
         password:hashedPassword
       });
       return user.save();
     }).then(result => {
       res.status(201).json({message : "User created succesfully"})
     }).catch(err =>{
       if(!err.statusCode) {
   			err.statusCode = 500;
   		}
   		next(err);
     });
 };

 exports.login = (req, res, next) => {
const email = req.body.email;
const password = req.body.password;
let loadedUser ;
User.findOne({email: email}).then(user => {
  if(!user) {
    const error = new Error('There is no such Email');
    error.statusCode = 401; //UnAuthiticated
    throw error;
  }
  loadedUser = user;
  return bcrypt.compare(password , user.password);
}).then(isEqual => {
if(!isEqual) {
  const error = new Error('Invalid password');
  error.statusCode = 401; //UnAuthiticated
  throw error;
}
const token = jwt.sign({
  email:loadedUser.email,
  userId: loadedUser._id.toString()
} , 'SuperSuperSecret' ,{
  expiresIn:'1h'
});
res.status(200).json({
  token: token ,
  userId : loadedUser._id.toString()
});
}).catch(err =>{
  if(!err.statusCode) {
   err.statusCode = 500;
 }
 next(err);
});
 };
