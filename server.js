// =======================
// get the packages we need ============
// =======================
var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var morgan          = require('morgan');
var mongoose        = require('mongoose');
var passwordHash    = require('password-hash');
var path            = require('path');
var cookieParser    = require('cookie-parser');
var cookieSession   = require('cookie-session')
var multer          = require('multer')
var crypto          = require('crypto')
var methodOverride  = require('method-override');
var fs              = require('fs')
var url             = require('url')

// var flash           = require('express-flash')
var config          = require('./config'); // get our config file
var User            = require('./models/User'); // get mongoose model
var Post            = require('./models/Post'); // get mongoose model
var General         = require('./models/General'); // get mongoose model

app.locals.visitorsCounter = 0;
app.locals.siteUrl = 'http://localhost:8080';

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('views'))
app.use(express.static(__dirname + '/uploads'));
app.set('view engine', 'ejs');
app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['icEgv95GyU', 'r5oQr21nj5'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(methodOverride('_method'));


// =======================
// File Upload =========
// =======================
var storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err)
      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})
var upload = multer({ storage: storage })

// use morgan to log requests to the console
app.use(morgan('dev'));



// =======================
// routes ================
// =======================
// http://localhost:3000/
// http://localhost:3000/about
// http://localhost:3000/contact
// http://localhost:3000/admin
// http://localhost:3000/admin/dashboard

// CLIENT ROUTES
app.get('/', function(req, res) {
    Post.find({}, function(err, posts) {
      res.render('index', {posts: posts})
    });
    app.locals.visitorsCounter++
});
app.get('/about', function(req, res) {
    res.render('about');
    app.locals.visitorsCounter++
});
app.get('/contact', function(req, res) {
    res.render('contact');
    app.locals.visitorsCounter++
});
app.get('/single', function(req, res) {
    res.render('single');
    app.locals.visitorsCounter++
});
app.get('/api', function (req, res) { 
  Post.find({}, function(err, posts) {
    res.json(posts)
  });
})
// ADMIN ROUTES
var adminRoutes = express.Router(); 

// login
adminRoutes.get('/', function (req, res) { 
  if(req.session.name){
    Post.find({}, function(err, posts) {
      User.find({}, function(err, users) {
        res.render('admin/dashboard', {
          session: req.session,
          posts: posts,
          users: users
        })
      });
    });
  }else{
    res.render('admin/login')
  }
})
adminRoutes.post('/', function (req, res) {
    var inputUsername = req.body.inputUsername,
        inputPassword = req.body.inputPassword;    
  User.findOne({
    name: inputUsername
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // check if password matches
      if (!passwordHash.verify(req.body.inputPassword, user.password)) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        req.session.name = inputUsername;
        req.session.role = user.admin;
        req.session.image = user.avatarUrl.filename;
        req.session.userId = user._id
        // console.log(user)
        res.redirect('admin/dashboard');
      }   
    }
  });
})

// dashboard
adminRoutes.get('/dashboard', isAuthenticated, function (req, res) {
    Post.find({}, function(err, posts) {
      User.find({}, function(err, users) {
        res.render('admin/dashboard', {
          session: req.session,
          posts: posts,
          users: users
        })
      });
    });    
    console.log(`\n=========================\n `, req.session, ` \n=========================\n`)
})

// posts
adminRoutes.get('/add-post', isAuthenticated, function (req, res) { 
  var sessionName = req.session.name
  res.render('admin/add-post', {session: req.session})
})
adminRoutes.post('/add-post', upload.single('postImage'), function (req, res) { 
  var sessionName = req.session.name
  // create a user
  var newPost = new Post({ 
      title: req.body.postTitle,
      content: req.body.postContent,
      short_description: req.body.short_description,
      by: req.session.name,
      date: new Date(),
      imageUrl: req.file
  });
  // console.log(newPost)
  // save the post
  newPost.save(function(err) {
      if (err) throw err;
      console.log('Post saved successfully');
      // Post.find({}, function(err, posts) {
      //   res.render('admin/all-posts', {posts: posts, session: req.session})
      // });
      res.redirect('all-posts')
  });
})
adminRoutes.get('/edit-post', isAuthenticated, function (req, res) { 
  var sessionName = req.session.name,
      postId = req.query.postId
  // var editThisPost;
  Post.findById(postId)
    .exec(function(err, post) {
        if (err || !post) {
            res.statusCode = 404;
            res.send({message: '404'});
        } else {
          // editThisPost = post
          // console.log(editThisPost)
          res.render('admin/edit-post', {
            session: req.session,
            postId: postId,
            editThisPost: post
          })
        }
    });
  
})
adminRoutes.put('/edit-post', upload.single('postImage'), isAuthenticated, function (req, res) {
  var postId = req.query.postId
  Post.findById(postId)
    .exec(function(err, newEditedPost) {
        if (err || !newEditedPost) {
            res.statusCode = 404;
            res.send({message: '404'});
        } else {
            newEditedPost.title = req.body.postTitle
            newEditedPost.content = req.body.postContent
            fs.unlink(newEditedPost.imageUrl.path)
            newEditedPost.imageUrl = req.file
            newEditedPost.save(function(err) {
                if (err) throw err;
                // console.log('Post updated successfully');
                Post.find({}, function(err, posts) {
                  res.render('admin/all-posts', {posts: posts, session: req.session})
                });
            });
            // console.log(newEditedPost)
        }
    });
})



adminRoutes.get('/all-posts', isAuthenticated, function (req, res) { 
  Post.find({}, function(err, posts) {
    res.render('admin/all-posts', {posts: posts, session: req.session})
  });
})
adminRoutes.delete('/all-posts/:post_id', isAuthenticated, function (req, res) {
  var imagePath;
  Post.findById(req.params.post_id)
    .exec(function(err, item){
      if (err || !item) {
          res.statusCode = 404;
          res.send({message: '404'});
      } else {
          // fs.unlink(item.imageUrl.path)
          if(item.imageUrl.path){
            imagePath = item.imageUrl.path
          }
      }
    })
  Post.findById(req.params.post_id)
    .exec(function(err, entries) {
        if (err || !entries) {
            res.statusCode = 404;
            res.send({message: '404'});
        } else {
            entries.remove(function(err) {
                if (err) {
                    res.statusCode = 403;
                    res.send(err);
                } else {
                  if(imagePath){
                    fs.unlink(imagePath)
                  }
                  res.redirect('/admin/all-posts');
                }
            });
        }
    });
})

// create admin
adminRoutes.get('/add-admin', isAuthenticated, function (req, res) { 
  if(req.session.role == false){
    res.json({message: 'Your are NOT allowed here!'})
  }else{
    res.render('admin/add-admin', {session: req.session})
  }
})
adminRoutes.post('/add-admin', isAuthenticated, upload.single('newAvatar'), function (req, res) { 
  var newHashedPassword = passwordHash.generate(req.body.newPassword)
  var newRole = true;
  if(req.body.newRole == 'admin'){newRole = true}
  else if(req.body.newRole == 'writer'){newRole = false}
    // create a user
    var newUser = new User({ 
        name: req.body.newUsername,
        password: newHashedPassword,
        email: req.body.newEmail,
        avatarUrl: req.file,
        admin: newRole
    });
    // save the user
    newUser.save(function(err) {
        if (err) throw err;
        console.log('User saved successfully');
        User.find({}, function(err, users) {
          res.render('admin/all-admins', {users: users, session: req.session})
        });
    });
    
})
adminRoutes.get('/all-admins', isAuthenticated, function (req, res) {
  if(req.session.role == false){
    res.json({message: 'Your are NOT allowed here!'})
  }else{
    User.find({}, function(err, users) {
      res.render('admin/all-admins', {users: users, session: req.session})
    });
  }
})
adminRoutes.delete('/all-admins/:admin_id', isAuthenticated, function (req, res) {
  var imagePath;
  User.findById(req.params.admin_id)
    .exec(function(err, item){
      if (err || !item) {
          res.statusCode = 404;
          res.send({message: '404'});
      } else {
          if(item.avatarUrl.path){
            imagePath = item.avatarUrl.path
          }
      }
    })
  User.findById(req.params.admin_id)
    .exec(function(err, entries) {
        if (err || !entries) {
            res.statusCode = 404;
            res.send({message: '404'});
        } else {
            entries.remove(function(err) {
                if (err) {
                    res.statusCode = 403;
                    res.send(err);
                } else {
                  if(imagePath){
                    fs.unlink(imagePath)
                  }
                  res.redirect('back');
                }
            });
        }
    });
})

adminRoutes.get('/profile', isAuthenticated, function (req, res) { 
  User.findById(req.session.userId)
    .exec(function(err, user) {
        if (err || !user) {
            res.statusCode = 404;
            res.send({message: '404'});
        } else {
          res.render('admin/profile', {user: user, session: req.session})
        }
    });
})
adminRoutes.get('/edit-profile', isAuthenticated, function (req, res) { 
  User.findById(req.session.userId)
    .exec(function(err, user) {
        if (err || !user) {
            res.statusCode = 404;
            res.send({message: '404'});
        } else {
          res.render('admin/edit-profile', {user: user, session: req.session})
        }
    });
})

adminRoutes.put('/edit-profile', upload.single('editAvatar'), isAuthenticated, function (req, res) { 
  var userId = req.query.userId
  User.findById(userId)
    .exec(function(err, newEditedUser) {
        if (err || !newEditedUser) {
            res.statusCode = 404;
            res.send({message: '404'});
        } else {
            newEditedUser.name = req.body.editUsername
            newEditedUser.email = req.body.editEmail
            newEditedUser.password = passwordHash.generate(req.body.editPassword)
            fs.unlink(newEditedUser.avatarUrl.path)
            newEditedUser.avatarUrl = req.file

            console.log(newEditedUser)

            newEditedUser.save(function(err) {
                if (err) throw err;
                req.session = null;
                res.redirect('/admin')
            });
        }
    });
});


// General
adminRoutes.get('/general', isAuthenticated, function (req, res) { 
  res.render('admin/general', {session: req.session})
})


// About
adminRoutes.get('/about', isAuthenticated, function (req, res) { 
  res.render('admin/about', {session: req.session})
})


// Contact
adminRoutes.get('/contact', isAuthenticated, function (req, res) { 
  res.render('admin/contact', {session: req.session})
})

// logout
adminRoutes.get('/logout', function (req, res) { 
  req.session = null;
  res.redirect('/admin')
})

// apply the routes to our application with the prefix /api
app.use('/admin', adminRoutes);

function isAuthenticated(req, res, next) {
    var sess = req.session
    // console.log(sess)
    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    if (sess.name)
        return next();
    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/admin');
}

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);






