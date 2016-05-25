'use strict';

describe('Login functionality from the home page', function() {
	
	var userSection = element(by.className('user-section'));
	var loginLink = userSection.element(by.className('login-link'));
	
	beforeAll(function() {
		browser.get('');
	});
	
	it('has a user section on the page', function() {
		expect(userSection.isPresent()).toBe(true);
	});
	
	describe('when the user has not yet been authenticated', function() {
		
		it('the user section has a link to "Log In"', function() {
			expect(loginLink.isPresent()).toBe(true);
			expect(loginLink.getText()).toBe("Log In");
		});
	});
	
	describe('when selecting "Log In" in the user section', function() {
		
		var userLoginMessage = userSection.element(by.className('user-login-message'));
		
		describe('with NO existing user associated with the current client machine, and a new user', function() {
			
			it('includes a message that no user is found', function() {
				loginLink.click();
				expect(userLoginMessage.isPresent()).toBe(true);
				expect(userLoginMessage.getText()).toBe("We don't recognize a user from here. Please register or sign in.");
			});
			
			it('has fields for a new user to sign up', function() {
				expect(element(by.className('sign-up-user-name')).isDisplayed()).toBe(true);
				expect(element(by.className('sign-up-user-email')).isDisplayed()).toBe(true);
			});
		});
		
		describe('with a single existing user associated with the current client machine', function() {
			
			it('displays a list of users associated with the current machine identifier for selection', function() {
				
			});
			
			it('has fields for a new user to sign up', function() {
				
			});
		});
	});
});