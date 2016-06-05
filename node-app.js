var express = require('express');

var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rs = require('request-promise');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;	
var LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

var serviceIp = process.env.SERVICE_IP || '127.0.0.1';
var webIp = process.env.WEB_IP || 'localhost';
var serviceRoot = 'http://' + serviceIp + ':5555/api';
var port = process.env.PORT || '8000';

var app = express();

app.set('port', port);
app.use(express.static(path.join(__dirname, 'app')));
app.use(bodyParser.urlencoded({extended: 'true'}));
app.use(bodyParser.json());


passport.serializeUser(function(user, done) {
    done(null, user.name);
});

passport.deserializeUser(function(userName, done) {
	if (userName === 'Chris') {
		done({name: 'Chris'})
	}
	done('error', null);
});

var auth = function(req, res, next) { 
	if (!req.isAuthenticated()) {
		res.send(401);
	}
	else {
		next(); 
	}
	//- See more at: https://vickev.com/#!/article/authentication-in-single-page-applications-node-js-passportjs-angularjs
}; 

passport.use(new GoogleStrategy({
	//see https://console.developers.google.com to get the clientID and clientSecret
		clientID: 'abc',//GOOGLE_CLIENT_ID,
		clientSecret: '123',//GOOGLE_CLIENT_SECRET,
		callbackURL: 'http://' + webIp + '/auth/google/callback'
		//add this to the html:  <a href="/auth/google" class="btn btn-info"><span class="fa fa-google-plus"></span> Google</a>
	},
	function(accessToken, refreshToken, profile, cb) {
//    User.findOrCreate({ googleId: profile.id }, function (err, user) {
//      return cb(err, user);
//    });
		console.log("INSIDE GOOGLE STRATEGY FUNCTION:", profile);
		return cb(null, profile); //?? not sure about this
	}
));


passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'ipAddress',
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, email, ipAddress, done) { // callback with email and ipAddress from our form

	console.log("INSIDE LOCAL STRATEGY FUNCTION:", {email: email, ipAddress: ipAddress});
	return done(null, {name:'Chris', email: email, ipAddress: ipAddress});
}));
app.use(passport.initialize());



function performRecipeListGET(searchString) {
	var uri = serviceRoot + '/recipe';
	if (searchString) {
		uri += '?searchString=' + searchString;
	}
	var getOptions = {
		uri : uri,
		json : true,
		simple: false
	}
	return rs.get(getOptions);
}

function performRecipeGET(recipeId) {
	var getOptions = {
		uri : serviceRoot + '/recipe/' + recipeId,
		json : true,
		simple: false
	}
	return rs.get(getOptions);
}

function performRecipePOST(recipe) {
	var postOptions = {
		uri : serviceRoot + '/recipe',
		headers : {
			'Content-Type' : 'application/json',
			'Content-Length' : recipe.length
		},
		json : true,
		body : recipe,
		simple: false
	};
	return rs.post(postOptions);
}

function performUserPOST(user) {
	var postOptions = {
		uri : serviceRoot + '/user',
		headers : {
			'Content-Type' : 'application/json',
			'Content-Length' : user.length
		},
		json : true,
		body : user,
		simple: false
	};
	return rs.post(postOptions);
}

app.get('/api/recipe', function(request, response, next) {
	performRecipeListGET(request.query.searchString).then(function(data) {
		response.json(data);
	})
	.caught(function(error) {
		console.log('Error getting recipes: ', error);
	});
});

app.get('/api/recipe/:recipeId', function(request, response, next) {
	var recipeId = request.params.recipeId;
	performRecipeGET(recipeId).then(function(data) {
		response.json(data);
	})
	.caught(function(error) {
		console.log('Error getting recipe with id ' + recipeId + ': ', error);
	});
});

app.post('/api/recipe', function(request, response, next) {
	var recipe = request.body;
	performRecipePOST(recipe).then(function(data) {
		response.json(data);
	})
	.caught(function(error) {
		console.log('Error posting a new recipe:', recipe, 'Error:', error);
	});
});

app.post('/api/user', function(request, response, next) {
	var user = request.body;
	performUserPOST(user).then(function(data) {
		response.json(data);
	})
	.caught(function(error) {
		console.log('Error posting a new user:', user, 'Error:', error);
	});
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
	function(req, res) {
		// Successful authentication, redirect home.
		res.redirect('/');
	}
);
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.post('/auth', passport.authenticate(  
  'local-login', {
    session: false
  }), serialize, generateToken, respond);

function serialize(req, res, next) {  
	  db.updateOrCreate(req.user, function(err, user){
	    if(err) {return next(err);}
	    // we store the updated information in req.user again
	    req.user = {
	      id: user.email, 
	      name: user.name, 
	      email: user.email, 
	      ipAddress: user.ipAddress
	    };
	    next();
	  });
	}

const db = {  
  updateOrCreate: function(user, cb){
    // db dummy, we just cb the user
    cb(null, user);
  }
};

function generateToken(req, res, next) {  
	req.token = jwt.sign(
			{
				id: req.user.id,
				email: req.user.email,
				ipAddress: req.user.ipAddress
			}
			,'server secret'
//			,{expiresInMinutes: 120}
	);
	next();
}

function respond(req, res) {  
	  res.status(200).json({
	    user: req.user,
	    token: req.token
	  });
}

const authenticate = expressJwt({secret : 'server secret'});
app.get('/test-auth', authenticate, function(request, response, next) {
	response.json({auth: 'success', user: request.user});
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});