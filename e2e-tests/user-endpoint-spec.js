'use strict';

var rs = require('request-promise')
var config = browser.params;

describe('The User endpoints', function() {
	
	function performUserPOST(userToPost, options) {
		var postOptions = {
			uri : config.apiBaseUrl + '/user',
			headers : {
				'Content-Type' : 'application/json',
				'Content-Length' : userToPost.length
			},
			json : true,
			body : userToPost,
			simple: false
		};
		
		if (options && options.fullResponse) {
			postOptions.resolveWithFullResponse = true;
		}
		
		return rs.post(postOptions);
	}

	function performUserGET(userId) {
		var getOptions = {
				uri : config.apiBaseUrl + '/user/' + userId,
				json : true,
				simple: false //https://github.com/request/request-promise
		}
		
		return rs.get(getOptions);
	}
	
	function performUserGETByEmail(email) {
		var getOptions = {
				uri : config.apiBaseUrl + '/user?email=' + email,
				json : true,
				simple: false //https://github.com/request/request-promise
		}
		
		return rs.get(getOptions);
	}
	
	function performUserGETByEmailFunction(email) {
		return function() {
			return performUserGETByEmail(email);
		}
	}
	
	it('saves a new user', function(done) {
		var user = {userName: 'ohai', userEmail: 'itsme'}
		
		performUserPOST(user).then(function(user) {
			expect(user.userId).not.toBeUndefined();
			expect(user.userId).not.toBeNull();
			expect(user.userName).toBe('ohai');
			expect(user.userEmail).toBe('itsme');
			done();
		});
	});
	
	it('gets a saved user', function(done) {
		var user = {userName: 'another', userEmail: 'user@a.com'}
		var newUserId;
		
		performUserPOST(user).then(function(user) {
			newUserId = user.userId;
			return user.userId;
		})
		.then(performUserGET)
		.then(function(user) {
			expect(user.userId).toBe(newUserId);
			expect(user.userName).toBe('another');
			expect(user.userEmail).toBe('user@a.com');
			done();
		});
	});

	it('gets a saved user by email', function(done) {
		var user = {userName: 'oneMore', userEmail: 'user@b.io'}
		var newUserId;
		
		performUserPOST(user).then(function(user) {
			newUserId = user.userId;
		})
		.then(performUserGETByEmailFunction('user@b.io'))
		.then(function(user) {
			expect(user.userId).toBe(newUserId);
			expect(user.userName).toBe('oneMore');
			expect(user.userEmail).toBe('user@b.io');
			done();
		});
	});
	
	it('returns 403 when trying to save a user with an existing email', function(done) {
		var user1 = {userName: 'firstOfTwo', userEmail: 'same@b.io'}
		var user2 = {userName: 'secondOfTwo', userEmail: 'same@b.io'}
		
		performUserPOST(user1).then(function() {
			return performUserPOST(user2, {fullResponse: true})
		})
		.then(function(response) {
			expect(response.statusCode).toBe(403);
			done();
		});
	});
});