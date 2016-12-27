// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('General', new Schema({
    site_name: String,
    site_logo: Object,
    site_description: String,

    intro_text: String, 
    intro_image: Object,

    social_facebook: String,
    social_twitter: String,
    social_github: String,

    owner_name: String,
    owner_bio: String,
    owner_email: String,
    owner_phone: String,
    owner_map_lat: String,
    owner_map_lon: String,
    owner_address: String,
    owner_image: Object
    
}));