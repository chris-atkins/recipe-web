'use strict';

var http = require('http');
var config = browser.params;

describe('the /recipe endpoint', function() {
	
	it('will save with a post and return the saved object with id populated', function(done) {
				
		var newRecipe = JSON.stringify({'recipeName':'hi', 'recipeContent':'it is me'});
		
		var options = {
				hostname: config.apiHostname, 
				port: config.apiPort,
				path: config.apiBasePath + '/recipe',
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
