'use strict';

describe('Login functionality from the home page', function() {
	
	var userSection = element(by.className('user-section'));
	var loginLink = userSection.element(by.className('login-link'));
	var userLoginMessage = userSection.element(by.className('user-login-message'));
	var signupNameField = element(by.className('sign-up-user-name'));
	var signupEmailField = element(by.className('sign-up-user-email'));
	
	beforeAll(function() {
		browser.get('');
	});
	
	it('has a user section on the page', function() {
		expect(userSection.isPresent()).toBe(true);
	});
	
	describe('with NO existing user associated with the current client machine', function() {
		
		it('the user section has a link to "Log In"', function() {
			expect(loginLink.isPresent()).toBe(true);
			expect(loginLink.getText()).toBe("Log In");
		});
		
		it('does not display user sign up elements without having clicked the login link', function() {
			expect(signupNameField.isDisplayed()).toBe(false);
			expect(signupEmailField.isDisplayed()).toBe(false);
			expect(userLoginMessage.isDisplayed()).toBe(false);
		});
		
		describe('when selecting "Log In" in the user section', function() {
			
			beforeAll(function() {
				loginLink.click();
			});
			
			describe('with NO existing user associated with the current client machine, and a new user', function() {
				
				it('has fields for a new user to sign up', function() {
					expect(signupNameField.isDisplayed()).toBe(true);
					expect(signupEmailField.isDisplayed()).toBe(true);
				});
				
				it('includes a message that no user is found', function() {
					expect(userLoginMessage.isPresent()).toBe(true);
					expect(userLoginMessage.getText()).toBe("We don't recognize a user from here. Please register or sign in.");
				});
			});
		});
	});
	
	describe('with a single existing user associated with the current client machine', function() {
		
		it('automatically logs the user in', function() {
			
		});
		
		it('has fields for a new user to sign up', function() {
			
		});
	});
	
	describe('with multiple existing users associated with the current client machine', function() {
		
		it('displays a list of users associated with the current machine identifier for selection', function() {
		
		});
		
		it('when one of the users is selected, they are logged in', function() {
			
		});
	
		it('has fields for a new user to sign up', function() {
			
		});
	});
});