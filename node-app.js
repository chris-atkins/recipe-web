'use strict';
var express = require('express');
var expressJwt = require("express-jwt").expressjwt;

var http = require('http');
var path = require('path');
var multiparty = require('multiparty');
var FormData = require('form-data');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var rs = require('request-promise');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;	
var LocalStrategy = require('passport-local').Strategy;
// var jwt = require('jsonwebtoken');

var serviceIp = process.env.SERVICE_IP || '127.0.0.1';
// var webIp = process.env.WEB_IP || 'localhost';
var serviceRoot = 'http://' + serviceIp + ':5555/api';
var port = process.env.PORT || '8000';

var app = express();

app.set('port', port);
app.use(express.static(path.join(__dirname, 'app')));
app.use(bodyParser.urlencoded({extended: 'true'}));
app.use(bodyParser.json());
app.use(cookieParser());


passport.serializeUser(function(user, done) {
    done(null, user.userName); //not used but required for passport
});

passport.deserializeUser(function(userName, done) {
		done({userName: 'Chris :)'}); //not used but required for passport
});

// var auth = function(req, res, next) {
// 	if (!req.isAuthenticated()) {
// 		res.send(401);
// 	}
// 	else {
// 		next();
// 	}
// 	//- See more at: https://vickev.com/#!/article/authentication-in-single-page-applications-node-js-passportjs-angularjs
// };

passport.use(new GoogleStrategy({
	//see https://console.developers.google.com to get the clientID and clientSecret
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: '/auth/google/callback'
		//add this to the html:  <a href="/auth/google" class="btn btn-info"><span class="fa fa-google-plus"></span> Google</a>
	},
	function(accessToken, refreshToken, profile, cb) {
		return cb(null, {userName: profile.name.givenName, userEmail: profile.emails[0].value});
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

function headersFromRequest(request) {
	var headers = {};
	if (request.headers['Content-Type']) {
		headers['Content-Type'] = request.headers['Content-Type'];
	}
	if (request.headers['Content-Length']) {
		headers['Content-Length'] = request.headers['Content-Length'];
	}
	if (request.headers.requestinguser) {
		headers.RequestingUser = request.headers.requestinguser;
	}
	return headers;
} 


function performRecipeListGET(searchString, recipeBookUserId) {
	var uri = serviceRoot + '/recipe';
	if (searchString) {
		uri += '?searchString=' + searchString;
	}
	if(searchString && recipeBookUserId) {
		uri += '&recipeBook=' + recipeBookUserId;
	}
	if(!searchString && recipeBookUserId) {
		uri += '?recipeBook=' + recipeBookUserId;
	}

	var getOptions = {
		uri : uri,
		json : true,
		simple: false,
		resolveWithFullResponse: true
	};
	return rs.get(getOptions);
}

function performRecipeGET(recipeId, request) {
	var getOptions = {
		uri : serviceRoot + '/recipe/' + recipeId,
		headers: headersFromRequest(request),
		json : true,
		simple: false,
		resolveWithFullResponse: true
	};
	return rs.get(getOptions);
}

function performRecipePOST(recipe, request) {
	var postOptions = {
		uri : serviceRoot + '/recipe',
		headers : headersFromRequest(request),
		json : true,
		body : recipe,
		simple: false,
		resolveWithFullResponse: true
	};
	return rs.post(postOptions);
}

function performRecipePUT(recipe, request) {
	var postOptions = {
		uri : serviceRoot + '/recipe/' + recipe.recipeId,
		headers : headersFromRequest(request),
		json : true,
		body : recipe,
		simple: false,
		resolveWithFullResponse: true
	};
	return rs.put(postOptions);
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
		simple: false,
		resolveWithFullResponse: true
	};
	return rs.post(postOptions);
}

function performUserGETByEmail(email) {
	var getOptions = {
			uri : serviceRoot + '/user?email=' + email,
			json : true,
			simple: false,
			resolveWithFullResponse: true
	};
	
	return rs.get(getOptions);
}

function performUserGET(userId) {
	var getOptions = {
			uri : serviceRoot + '/user/' + userId,
			json : true,
			simple: false,
			resolveWithFullResponse: true
	};

	return rs.get(getOptions);
}

function performRecipeBookGET(userId) {
	var getOptions = {
		uri : serviceRoot + '/user/' + userId + '/recipe-book',
		json : true,
		simple: false,
		resolveWithFullResponse: true
	};

	return rs.get(getOptions);
}

function performRecipeBookPOSTRecipe(recipeIdToPost, userId, request) {
	var postOptions = {
		uri : serviceRoot + '/user/' + userId + '/recipe-book',
		headers : headersFromRequest(request),
		json : true,
		body : recipeIdToPost,
		simple: false,
		resolveWithFullResponse: true
	};

	return rs.post(postOptions);
}

function performRecipeBookDELETERecipe(userId, recipeId, request) {
	var deleteOptions = {
		uri : serviceRoot + '/user/' + userId + '/recipe-book/' + recipeId,
		headers : headersFromRequest(request),
		json : true,
		simple: false,
		resolveWithFullResponse: true
	};

	return rs.del(deleteOptions);
}

function performDELETEImage(imageId, request) {
	var deleteOptions = {
		uri : serviceRoot + '/image/' + imageId,
		headers : headersFromRequest(request),
		json : true,
		simple: false,
		resolveWithFullResponse: true
	};

	return rs.del(deleteOptions);
}

app.get('/recipe/:recipeId', function(request, response) {
	var recipeId = request.params.recipeId;
	return performRecipeGET(recipeId, request).then(function(recipeResponse) {
		var recipe = recipeResponse.body;
		var html = '<html><head></head><body><div class="view-recipe-page">' +
			'<h2><span id="recipe-name" class="recipe-name">' + recipe.recipeName + '</span></h2>' +
			'<div id="recipe-content" class="recipe-ingredients">' + recipe.recipeContent + '</div>' +
			'</div></body></html>';
		response.send(html);
	});
});

app.get('/api/recipe', function(request, response) {
	performRecipeListGET(request.query.searchString, request.query.recipeBook).then(function(data) {
		response.statusCode = data.statusCode;	
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Error getting recipes: ', error);
	});
});

app.get('/api/recipe/:recipeId', function(request, response) {
	var recipeId = request.params.recipeId;
	performRecipeGET(recipeId, request).then(function(data) {
		response.statusCode = data.statusCode;	
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Error getting recipe with id ' + recipeId + ': ', error);
	});
});

app.post('/api/recipe', function(request, response) {
	var recipe = request.body;
	performRecipePOST(recipe, request).then(function(data) {
		response.statusCode = data.statusCode;	
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Error posting a new recipe:', recipe, 'Error:', error);
	});
});

app.put('/api/recipe/:recipeId', function(request, response) {
	var recipe = request.body;
	performRecipePUT(recipe, request).then(function(data) {
		response.statusCode = data.statusCode;
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Error putting a new recipe:', recipe, 'Error:', error);
	});
});

app.post('/api/image', function(request, response) {
	var form = new multiparty.Form();

	form.on("part", function(part){
		if(part.filename)
		{
			var form = new FormData();
			form.append("file", part, {filename: part.filename,contentType: part["content-type"]});

			var url = serviceRoot + '/image';
			var r = rs.post(
				url,
				{ "headers":
				{
					"transfer-encoding": "chunked",
					"RequestingUser": request.headers.requestinguser
				}
				},
				function(err, res){
					response.statusCode = res.statusCode;
					response.send(res);
				});

			r._form = form;
		}
	});

	form.on("error", function(error){
		console.log(error);
	});

	form.parse(request);
});

app.delete('/api/image/:imageId', function(request, response) {
	var imageId = request.params.imageId;
	performDELETEImage(imageId, request).then(function(data) {
		response.statusCode = data.statusCode;
	})
	.catch(function(error) {
		console.log('Error deleting an image. ImageId: ', imageId, 'Error:', error);
	});
});

app.post('/api/user', function(request, response) {
	var user = request.body;
	performUserPOST(user).then(function(data) {
		response.statusCode = data.statusCode;	
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Error posting a new user:', user, 'Error:', error);
	});
});

app.get('/api/user', function(request, response) {
	var email = request.query.email;
	performUserGETByEmail(email).then(function(data) {
		response.statusCode = data.statusCode;	
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Could not get a user with email:', email, 'Error:', error);
	});
});

app.get('/api/user/:userId', function(request, response) {
	var userId =  request.params.userId;
	performUserGET(userId).then(function(data) {
		response.statusCode = data.statusCode;
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Could not get a user with id:', userId, 'Error:', error);
	});
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

app.get('/api/user/:userId/recipe-book', function(request, response) {
	var userId = request.params.userId;
	performRecipeBookGET(userId).then(function(data) {
		response.statusCode = data.statusCode;
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Error getting recipe book for user with id ', userId, 'Error: ', error);
	});
});

app.post('/api/user/:userId/recipe-book', function(request, response) {
	var userId = request.params.userId;
	var recipeId = request.body;
	performRecipeBookPOSTRecipe(recipeId, userId, request).then(function(data) {
		response.statusCode = data.statusCode;
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Error posting a new recipeId to user recipe book.  RecipeId: ', recipeId, " UserId: ", userId, 'Error:', error);
	});
});

app.delete('/api/user/:userId/recipe-book/:recipeId', function(request, response) {
	var userId = request.params.userId;
	var recipeId = request.params.recipeId;
	performRecipeBookDELETERecipe(userId, recipeId, request).then(function(data) {
		response.statusCode = data.statusCode;
		response.json(data.body);
	})
	.catch(function(error) {
		console.log('Error deleting a recipeId from a user recipe book.  UserId: ', userId, " RecipeId: ", recipeId, 'Error:', error);
	});
});

app.get('/auth/google', function(request, response) {
	var callbackPath = request.query.callbackPath;
	response.cookie('RecipeConnectionGoogleAuthRedirectUrl', callbackPath, { maxAge: 1000000, httpOnly: false });
	passport.authenticate('google', { scope: ['profile','email'] })(request, response);
});

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: 'back'}),
	function(request, response) {
		var callbackPath = '/#' + request.cookies.RecipeConnectionGoogleAuthRedirectUrl;
		response.cookie('RecipeConnectionGoogleAuth', JSON.stringify(request.user), { maxAge: 10000, httpOnly: false });
		response.redirect(callbackPath);
	}
);

var authenticate = expressJwt({secret : 'server secret', algorithms: ['RS256']});
app.get('/test-auth', authenticate, function(request, response) {
	response.json({auth: 'success', user: request.user});
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});