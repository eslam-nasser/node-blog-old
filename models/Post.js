// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Post', new Schema({ 
    title: String,
    content: String,
    short_description: String,
    by: String, 
    date: { type: Date, default: Date.now },
    imageUrl: Object
}));