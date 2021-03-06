require('dotenv').config()
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
// for level 1 -//
const mongoose = require("mongoose");

// level - 2 //
// const encrypt = require("mongoose-encryption")

// level - 3 //
// const md5 = require("md5")
// level - 4 //

// const bcrypt = require("bcrypt")
// const saltRounds = 10

// level - 5 //

const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

// level - 6 //

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate")

const FacebookStrategy = require("passport-facebook").Strategy;
 

const app = express();

// console.log(process.env.API_KEY)

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
  secret: "this is our little secret child.",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})




const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  facebookId: String
})   

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] })

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy())

// use for all strategies or globally
passport.serializeUser(function(user, done) {
    done(null, user.id );
  
});

passport.deserializeUser(function(user, done) {
  // User.findById(id, function(err, user){
    done(null, user);
  
    
  
});


// not use globally
// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())

// console.log(md5(12345))

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRETS,
    callbackURL: "http://localhost:3000/auth/facebook/secrets",
    // profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(public_profile)
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// , { scope: 'profile'})
app.get("/", function(req, res){
  res.render("home") 
})

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
)

app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect("/secrets");
  });

  app.get('/auth/facebook',
  passport.authenticate('facebook'))

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });
  

app.get("/login", function(req, res){
  res.render("login")
})
app.get("/register", function(req, res){
  res.render("register")
})

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets")
  } else {
    res.redirect("/login")
  }
})

app.get("/logout", function(req, res){
  req.logout(function(err){
    if (err) {
      console.log(err)
    } else {
      res.redirect("/")
    }
  })
  
})

app.post("/register", function(req, res){


User.register({username: req.body.username}, req.body.password, function(err, user){
  if (err) {
    console.log(err);
    res.redirect("/register")
  } else {
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets")
    })
  }
})




  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    

  //   const newUser = new User({
  //   email: req.body.username,
  //   password: hash
  // })

  // newUser.save(function(err){
  //   if (err) {
  //     console.log(err)
  //   } else {
  //     res.render("secrets")
  //   }
  // })

// });

  
})

app.post("/login", function(req, res){

const user = new User({
   username: req.body.username,
   password: req.body.password
})



req.login(user, function(err){
  if (err) { 
    console.log(err)
  } else {
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets")
    })
  }
})





      //  for level 4
  //   const username = req.body.username
//   const password = req.body.password

//   User.findOne({email: username}, function(err, foundUser){
//     if (err) {
//       console.log(err)
//     } else {
//       if (foundUser) {
//         bcrypt.compare(password, foundUser.password, function(err, result) {
//     if (result === true) {
//       res.render("secrets")
//     }
// });
//         // for level 1 - 3 password
//         // if (foundUser.password === password) {
//         //   res.render("secrets")
//         // }
//       }
//     }
//   })
})







app.listen(3000, function(req, res){
  console.log("SERVER....STARTED.")
})