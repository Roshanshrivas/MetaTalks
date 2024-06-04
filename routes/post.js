const mongoose = require('mongoose');

var postSchema = mongoose.Schema({

    image: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    likes: [ { type: mongoose.Schema.Types.ObjectId, ref: 'user'} ],
    report: [ { type: mongoose.Schema.Types.ObjectId, ref: 'user'} ],
    Comment: [ {text: String, postedBy: String }],
})

module.exports = mongoose.model('post', postSchema);