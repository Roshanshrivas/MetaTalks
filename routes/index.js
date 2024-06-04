var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const multer  = require('multer')


const localStrategy = require('passport-local');

const passport = require('passport')

passport.use( new localStrategy (userModel.authenticate()));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + file.originalname )
  }
})

const upload = multer({ storage: storage })


router.get('/', function(req, res) {

  res.render('index');
});


router.post('/register', function(req, res) {

  res.render('register');
});


router.get('/login', function(req, res) {

res.render('login');

});



router.post('/login', passport.authenticate('local',{

  successRedirect: '/profile',
  failureRedirect: '/login'

}), function(req, res, next){});



router.post('/registerUser', function(req, res) {

  // console.log(req);

  var newUser = new userModel({

    
    name: req.body.name,
    username : req.body.username,

  })

  userModel.register( newUser, req.body.password )
  .then( function(u) {
    passport.authenticate('local')(req, res, function(){

      res.redirect('/profile')
    })
  })

  .catch( function(e){

    res.send('Details tune galat daal hai')

  })
  
});


router.get('/logout', function(req, res){

  req.logout(function(err){

    if(err) {
      return next(err);
    }

    res.redirect('/')
  });
});


function isLoggedIn (req, res, next){

  if(req.isAuthenticated()){
     return next();

  }else{

    res.redirect('/')
  }
}


router.get('/profile', isLoggedIn, function(req, res){

userModel.findOne({ username : req.session.passport.user })
.populate('postId')
.then(function(meraUser){
    
  res.render('profile', { data : meraUser })

  })

})



router.post('/upload', isLoggedIn, upload.single('image'), function (req, res) {

  userModel.findOne({ username : req.session.passport.user } )

  .then( function(userFound){

    postModel.create({

      image: req.file.filename,
      userId: userFound._id

    }).then( function(created){

      userFound.postId.push(created)
      userFound.save()
      .then( function(imageprint){

        res.redirect('/profile')
      })
    })
  })
  
})



router.post('/profilePic', isLoggedIn, upload.single('image'), function (req, res) {

  userModel.findOne({ username : req.session.passport.user })
  .then( function(UserMilgaya){

    UserMilgaya.profilePic.push(req.file.filename)
    UserMilgaya.save()

    .then( function(){

    res.redirect('./profile')

    })
  })
})


router.get('/likes/:id', function(req, res){

  userModel.findOne( { username: req.session.passport.user } )
  .then( function( userFound){

    postModel.findOne({ _id : req.params.id })
    .then( function ( postFound ){

      if( postFound.likes.indexOf(userFound._id) === -1 ){
         postFound.likes.push( userFound._id )

      }else{
        var index = postFound.likes.indexOf( userFound._id )
        postFound.likes.splice( index, 1 )
      }

      postFound.save()
      .then( function(){

        res.redirect( req.headers.referer )

      } )

    })
  })
})


router.post('/comment/:id', function(req, res){

  console.log(req.body.text);
  console.log(req.params.id);

  userModel.findOne({ username : req.session.passport.user })
  .then( function( logInUser){

    const UserComment = {

      text: req.body.text,
      postedBy: logInUser.username

    }

    postModel.findOne({ _id: req.params.id })
    .then( function( commentedPhoto){

      commentedPhoto.Comment.push(UserComment)
      commentedPhoto.save()

    })

    .then( function(){

      res.redirect(req.headers.referer)

    })

  })

})



router.get('/timeline', function(req, res) {

  userModel.findOne({ username : req.session.passport.user })
  .populate('postId')
  .then( (userFound) => {

    res.render('timeline', { foundUser : userFound })
  })

});


router.get('/home', function(req, res){
  
  postModel.find()
  .populate('userId')
  .then( function(post){

    res.render("home", { post } )

  })
})


module.exports = router;
