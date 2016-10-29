'use strict';
var searchPage = require('../e2e-tests/page-objects/search-page');

describe('the production environment', function() {

	it('can search and find at least one recipe on the search page', function() {
		browser.get("/#/search-recipes?searchFor=pumpkin");
		expect(element.all(by.className('recipe')).count()).toBeGreaterThan(0);
	});
});
