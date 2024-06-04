const mongoose = require('mongoose');

const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/metaTalks')

var userSchema = mongoose.Schema({

  name: String,
  username: String,
  password: String,
  postId: [ {type: mongoose.Schema.Types.ObjectId, ref: 'post'} ],
  profilePic: [ { type : String } ]
  
})

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema)