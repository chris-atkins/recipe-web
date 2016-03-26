'use strict';

describe('the home page', function() {

  it('should be redirected to when location hash/fragment is empty', function() {
    browser.get('');
//    browser.getCurrentUrl().then(function(url) {console.log(url);});
    expect(browser.getLocationAbsUrl()).toMatch('/home');
  });
  
  describe('has navigation buttons:', function() {
	  beforeEach(function() {
		  browser.get('/app/#/home');
	  })
	  
	  it('a browse all button that navigates to the browse all screen', function() {
		  var browseAllButton = element(by.id('browse-all-button'));
		  expect(browseAllButton.getText()).toBe('Browse All Recipes');
		  browseAllButton.click();
		  expect(browser.getLocationAbsUrl()).toMatch('/browse-all-recipes');
	  });
	  
	  
  });
  
});