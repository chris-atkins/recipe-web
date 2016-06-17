'use strict';

var dataUtils = require('./data-utils');

describe('Login functionality from the home page', function() {
	
	var userSection = element(by.className('user-section'));
	var loginLink = userSection.element(by.className('login-link'));
	var userLoginMessage = userSection.element(by.className('user-login-message'));
	var loginButton = element(by.id('log-in-user-button'));
	var userSignUpMessage = userSection.element(by.className('user-sign-up-message'));
	var signupButton = element(by.id('sign-up-user-button'));
	var signupNameField = element(by.id('sign-up-user-name'));
	var signupEmailField = element(by.id('sign-up-user-email'));
	var loggedInUserLink = element(by.id('logged-in-user-message'));
	var logoutButton = element(by.id('log-out-button'));
	
	afterEach(function() {
		browser.manage().deleteCookie('myrecipeconnection.com.usersLoggedInFromThisBrowser');
	});
	
	describe('with NO existing user associated with the current client machine', function() {

		beforeAll(function() {
			browser.get('');
		});
		
		it('starts off with the "Log In" link visisble', function() {
			expect(loginLink.isPresent()).toBe(true);
			expect(loginLink.getText()).toBe("Log In");
			
			expectNoUserFieldsAreDisplayed()
		});
		
		describe('when selecting "Log In" in the user section', function() {
			
			it('toggles login fields when the login link is selected', function() {
				browser.get('');
				
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

			var email = dataUtils.randomEmail();
			
			it('and their name is displayed instead of the Log In link, and is persisted when refreshed', function() {
				browser.get('');
				
				loginLink.click();
				expectLoginFieldsAreDisplayed();
				signupEmailField.sendKeys(email);
				
				loginButton.click();
				expectSignupFieldsAreDisplayed();
				signupNameField.sendKeys('Ohai');
				
				signupButton.click();
				expectNoUserFieldsAreDisplayed();
				expectLoggedInUserLinkToBe('Welcome, Ohai');

				browser.refresh();
				expectLoggedInUserLinkToBe('Welcome, Ohai');
			});
			
			it('when registering with an existing email, and is persisted when refreshed', function() {
				browser.get('');
				
				loginLink.click();
				expectLoginFieldsAreDisplayed();
				signupEmailField.sendKeys(email);
				
				loginButton.click();
				expectNoUserFieldsAreDisplayed();
				expectLoggedInUserLinkToBe('Welcome, Ohai');
				
				browser.refresh();
				expectLoggedInUserLinkToBe('Welcome, Ohai');
			});

		});
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
	
	describe('with a single existing user associated with the current client machine', function() {
		
		beforeAll(function() {
			browser.get('');
			loginLink.click();
			signupEmailField.sendKeys(dataUtils.randomEmail());
			
			loginButton.click();
			signupNameField.sendKeys('UserAlreadySignedInFromThisBrowser');
			
			signupButton.click();
			expectLoggedInUserLinkToBe('Welcome, UserAlreadySignedInFromThisBrowser');
		});
		
		it('automatically logs the user in', function() {
			browser.refresh();
			expectLoggedInUserLinkToBe('Welcome, UserAlreadySignedInFromThisBrowser');
		});
		
		it('the user can sign in as a different user', function() {
			
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
			
			signupEmailField.sendKeys(dataUtils.randomEmail());
			loginButton.click();
			
			signupNameField.sendKeys('OhaiAgain');
			signupButton.click();			
			expectLoggedInUserLinkToBe('Welcome, OhaiAgain');
			
			element(by.id('browse-all-button')).click();
			expectLoggedInUserLinkToBe('Welcome, OhaiAgain');
		});
		
		it('they can log out', function() {
			browser.get('');
			loginLink.click();
			
			signupEmailField.sendKeys(dataUtils.randomEmail());
			loginButton.click();
			
			signupNameField.sendKeys('OhaiOneMoreTime');
			signupButton.click();			
			expectLoggedInUserLinkToBe('Welcome, OhaiOneMoreTime');
			
			loggedInUserLink.click();
			expect(logoutButton.isDisplayed()).toBe(true);
			expect(logoutButton.getText()).toBe('Log Out');
			
			logoutButton.click();
			expect(loginLink.isDisplayed()).toBe(true);
			expect(logoutButton.isDisplayed()).toBe(false);
			
			browser.refresh();
			expect(loginLink.isDisplayed()).toBe(true);
		});
	});
	
	function expectLoggedInUserLinkToBe(expectedText) {
		expect(loggedInUserLink.getText()).toBe(expectedText);
	}
});