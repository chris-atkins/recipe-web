'use strict';

describe('Login functionality from the home page', function() {
	
	var userSection = element(by.className('user-section'));
	var loginLink = userSection.element(by.className('login-link'));
	
	var userLoginMessage = userSection.element(by.className('user-login-message'));
	var userSignUpMessage = userSection.element(by.className('user-sign-up-message'));
	var signupNameField = element(by.id('sign-up-user-name'));
	var signupEmailField = element(by.id('sign-up-user-email'));
	var loginButton = element(by.id('log-in-user-button'));
	var signupButton = element(by.id('sign-up-user-button'));
	
	var loggedInUserMessage = element(by.id('logged-in-user-message'));
	
	describe('with NO existing user associated with the current client machine', function() {

		beforeAll(function() {
			browser.get('');
		});
		
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
			
			beforeEach(function() {
				browser.get('');
			});
			
			it('toggles login fields when the login link is selected', function() {
				loginLink.click();
				expect(userLoginMessage.isDisplayed()).toBe(true);
				expect(signupEmailField.isDisplayed()).toBe(true);
				expect(loginButton.isDisplayed()).toBe(true);
				
				loginLink.click();
				expect(signupNameField.isDisplayed()).toBe(false);
				expect(signupEmailField.isDisplayed()).toBe(false);
				expect(userLoginMessage.isDisplayed()).toBe(false);
			});
		});
		
		describe('the user can register', function() {

			beforeEach(function() {
				browser.get('');
			});
			
			it('and their name is displayed instead of the Log In link', function() {
				loginLink.click();
				expectLoginFieldsAreDisplayed();
				signupEmailField.sendKeys('its@me.com');
				
				loginButton.click();
				expectSignupFieldsAreDisplayed();
				signupNameField.sendKeys('Ohai');
				
				signupButton.click();
				expectNoUserFieldsAreDisplayed();
				expect(loggedInUserMessage.getText()).toBe('Welcome, Ohai');
			});
			
			it('when registering with an existing email', function() {
				loginLink.click();
				expectLoginFieldsAreDisplayed();
				signupEmailField.sendKeys('its@me.com');
				
				loginButton.click();
				expectNoUserFieldsAreDisplayed();
				expect(loggedInUserMessage.getText()).toBe('Welcome, Ohai');
			});

			function expectLoginFieldsAreDisplayed() {
				expect(userSignUpMessage.isDisplayed()).toBe(false);
				expect(userLoginMessage.isDisplayed()).toBe(true);
				expect(userLoginMessage.getText()).toBe("Please enter your email address to log in, or to sign up if you are new to our site.");
				expect(signupNameField.isDisplayed()).toBe(false);
				expect(signupEmailField.isDisplayed()).toBe(true);
				expect(loginButton.isDisplayed()).toBe(true);
				expect(signupButton.isDisplayed()).toBe(false);
				expect(loginButton.getText()).toBe('Log In');
			}
			
			function expectSignupFieldsAreDisplayed() {
				expect(userSignUpMessage.isDisplayed()).toBe(true);
				expect(userSignUpMessage.getText()).toBe("What name would you like to use?");
				expect(userLoginMessage.isDisplayed()).toBe(false);
				expect(signupNameField.isDisplayed()).toBe(true);
				expect(signupEmailField.isDisplayed()).toBe(false);
				expect(loginButton.isDisplayed()).toBe(false);
				expect(signupButton.isDisplayed()).toBe(true);
				expect(signupButton.getText()).toBe('Sign Up');
			}
			
			function expectNoUserFieldsAreDisplayed() {
				expect(userSignUpMessage.isDisplayed()).toBe(false);
				expect(userLoginMessage.isDisplayed()).toBe(false);
				expect(signupNameField.isDisplayed()).toBe(false);
				expect(signupEmailField.isDisplayed()).toBe(false);
				expect(signupButton.isDisplayed()).toBe(false);
				expect(loginButton.isDisplayed()).toBe(false);
				expect(userLoginMessage.isDisplayed()).toBe(false);
			}
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
			
			signupEmailField.sendKeys('its@meagain.com');
			loginButton.click();
			
			signupNameField.sendKeys('OhaiAgain');
			signupButton.click();			
			expect(loggedInUserMessage.getText()).toBe('Welcome, OhaiAgain');
			
			element(by.id('browse-all-button')).click();
			expect(loggedInUserMessage.getText()).toBe('Welcome, OhaiAgain');
		});
	});
});