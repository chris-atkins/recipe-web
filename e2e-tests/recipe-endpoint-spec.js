'use strict';

var http = require('http');

describe('the /recipe endpoint', function() {
	
	xit('will save with a post and return the saved object with id populated', function(done) {
		
		var newRecipe = JSON.stringify({'recipeName':'hi', 'recipeContent':'it is me'});
		
		var options = {
				hostname: '127.0.0.1', 
				port: 8080,
				path: '/recipee7/api/recipe',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': newRecipe.length
				}
		};
		
		var request = http.request(options, function(response) {			
			response.on('data', function (chunk) {
			    var recipe = JSON.parse(chunk);
			    
			    expect(recipe.recipeName).toBe('hi');
			    expect(recipe.recipeContent).toBe('it is me');
			    expect(recipe.recipeId).not.toBe(null);
			    done();
			});
		});
		
		request.write(newRecipe);
	});
	
});
