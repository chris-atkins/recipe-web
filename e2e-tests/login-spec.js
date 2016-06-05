'use strict';

describe('Login functionality from the home page', function() {
	
	var userSection = element(by.className('user-section'));
	var loginLink = userSection.element(by.className('login-link'));
	
	var userLoginMessage = userSection.element(by.className('user-login-message'));
	var signupNameField = element(by.id('sign-up-user-name'));
	var signupEmailField = element(by.id('sign-up-user-email'));
	var signupButton = element(by.id('sign-up-user-button'));
	
	var loggedInUserMessage = element(by.id('logged-in-user-message'));
	
	beforeAll(function() {
		browser.get('');
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
					expect(signupButton.isDisplayed()).toBe(true);
					expect(signupButton.getText()).toBe('Sign Up');
				});
				
				it('includes a message that no user is found', function() {
					expect(userLoginMessage.isDisplayed()).toBe(true);
					expect(userLoginMessage.getText()).toBe("We don't recognize a user from here. Please register or sign in.");
				});
			});
			
			it('dismisses the login fields when the login link is selected again', function() {
				loginLink.click();
				expect(signupNameField.isDisplayed()).toBe(false);
				expect(signupEmailField.isDisplayed()).toBe(false);
				expect(userLoginMessage.isDisplayed()).toBe(false);
			});
		});
		
		describe('the user can register', function() {
			
			it('and their name is displayed instead of the Log In link', function() {
				loginLink.click();
				
				signupNameField.sendKeys('Ohai');
				signupEmailField.sendKeys('its@me.com');
				signupButton.click();
				
				expect(loggedInUserMessage.getText()).toBe('Welcome, Ohai');
				expect(signupNameField.isDisplayed()).toBe(false);
				expect(signupEmailField.isDisplayed()).toBe(false);
				expect(signupButton.isDisplayed()).toBe(false);
				expect(userLoginMessage.isDisplayed()).toBe(false);
			});
			
			it('when registering with an existing email', function() {
				
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
	
	describe('when a user is logged in', function() {
		
		it('they stay logged in when navigating between pages', function() {
			browser.get('');
			loginLink.click();
			
			signupNameField.sendKeys('OhaiAgain');
			signupEmailField.sendKeys('its@meagain.com');
			signupButton.click();			
			expect(loggedInUserMessage.getText()).toBe('Welcome, OhaiAgain');
			
			element(by.id('browse-all-button')).click();
			expect(loggedInUserMessage.getText()).toBe('Welcome, OhaiAgain');
		});
	});
});