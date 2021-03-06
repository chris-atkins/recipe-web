'use strict';

var dataUtils = require('./utils/data-utils');

describe('Login functionality from the home page', function() {
	
	var navbarSection = element(by.className('navbar-section'));
	var loginDropdown = navbarSection.element(by.className('login-dropdown'));
	var userLoginMessage = navbarSection.element(by.className('user-login-message'));
	var loginButton = element(by.id('log-in-user-button'));
	var userSignUpMessage = navbarSection.element(by.className('user-sign-up-message'));
	var signupButton = element(by.id('sign-up-user-button'));
	var signupNameField = element(by.id('sign-up-user-name'));
	var googleSignIn = element(by.className('google-auth'));
	var loginEmailField = element(by.id('sign-up-user-email'));
	var loggedInUserDropdown = navbarSection.element(by.className('login-dropdown'));
	var logoutButton = element(by.id('log-out-button'));

	beforeAll(function() {
		browser.manage().deleteCookie('myrecipeconnection.com.usersLoggedInFromThisBrowser');
	});
	
	afterEach(function() {
		browser.manage().deleteCookie('myrecipeconnection.com.usersLoggedInFromThisBrowser');
	});
	
	describe('with NO existing user associated with the current client machine', function() {

		beforeAll(function() {
			browser.get('');
		});
		
		it('starts off with the "Log In" link visisble', function() {
			expect(loginDropdown.isPresent()).toBe(true);
			expect(loginDropdown.getText()).toBe("Log In");
			
			expectNoUserFieldsAreDisplayed();
		});
		
		describe('when selecting "Log In" in the user section', function() {
			
			it('toggles login fields when the login link is selected', function() {
				browser.get('');
				
				loginDropdown.click();
				expect(userLoginMessage.isDisplayed()).toBe(true);
				expect(loginEmailField.isDisplayed()).toBe(true);
				expect(loginButton.isDisplayed()).toBe(true);
				expect(googleSignIn.isDisplayed()).toBe(true);

				loginDropdown.click();
				expect(signupNameField.isDisplayed()).toBe(false);
				expect(loginEmailField.isDisplayed()).toBe(false);
				expect(userLoginMessage.isDisplayed()).toBe(false);
				expect(googleSignIn.isDisplayed()).toBe(false);
			});
		});
		
		describe('the user can register', function() {

			var email = dataUtils.randomEmail();
			
			it('and their name is displayed instead of the Log In link, and is persisted when refreshed', function() {
				browser.get('');
				
				loginDropdown.click();
				expectLoginFieldsAreDisplayed();
				loginEmailField.sendKeys(email);
				
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
				
				loginDropdown.click();
				expectLoginFieldsAreDisplayed();
				loginEmailField.sendKeys(email);
				
				loginButton.click();
				expectNoUserFieldsAreDisplayed();
				expectLoggedInUserLinkToBe('Welcome, Ohai');
				
				browser.refresh();
				expectLoggedInUserLinkToBe('Welcome, Ohai');
			});

		});
	});

	function expectLoginFieldsAreDisplayed() {
		expect(googleSignIn.isDisplayed()).toBe(true);
		expect(userSignUpMessage.isDisplayed()).toBe(false);
		expect(userLoginMessage.isDisplayed()).toBe(true);
		expect(userLoginMessage.getText()).toBe("Enter your email address to log in or sign up.");
		expect(signupNameField.isDisplayed()).toBe(false);
		expect(loginEmailField.isDisplayed()).toBe(true);
		expect(loginButton.isDisplayed()).toBe(true);
		expect(signupButton.isDisplayed()).toBe(false);
		expect(loginButton.getText()).toBe('Log In');
	}
	
	function expectSignupFieldsAreDisplayed() {
		expect(googleSignIn.isDisplayed()).toBe(false);
		expect(userSignUpMessage.isDisplayed()).toBe(true);
		expect(userSignUpMessage.getText()).toBe("What name would you like to use?");
		expect(userLoginMessage.isDisplayed()).toBe(false);
		expect(signupNameField.isDisplayed()).toBe(true);
		expect(loginEmailField.isDisplayed()).toBe(false);
		expect(loginButton.isDisplayed()).toBe(false);
		expect(signupButton.isDisplayed()).toBe(true);
		expect(signupButton.getText()).toBe('Sign Up');
	}
	
	function expectNoUserFieldsAreDisplayed() {
		expect(googleSignIn.isDisplayed()).toBe(false);
		expect(userSignUpMessage.isDisplayed()).toBe(false);
		expect(userLoginMessage.isDisplayed()).toBe(false);
		expect(signupNameField.isDisplayed()).toBe(false);
		expect(loginEmailField.isDisplayed()).toBe(false);
		expect(signupButton.isDisplayed()).toBe(false);
		expect(loginButton.isDisplayed()).toBe(false);
		expect(userLoginMessage.isDisplayed()).toBe(false);
	}
	
	describe('with a single existing user associated with the current client machine', function() {
		
		beforeAll(function() {
			browser.get('');
			loginDropdown.click();
			loginEmailField.sendKeys(dataUtils.randomEmail());
			
			loginButton.click();
			signupNameField.sendKeys('UserAlreadySignedInFromThisBrowser');
			
			signupButton.click();
			expectLoggedInUserLinkToBe('Welcome, UserAlreadySignedInFromThisBrowser');
		});
		
		it('automatically logs the user in', function() {
			browser.refresh();
			expectLoggedInUserLinkToBe('Welcome, UserAlreadySignedInFromThisBrowser');
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
			loginDropdown.click();
			
			loginEmailField.sendKeys(dataUtils.randomEmail());
			loginButton.click();
			
			signupNameField.sendKeys('OhaiAgain');
			signupButton.click();			
			expectLoggedInUserLinkToBe('Welcome, OhaiAgain');
			
			element(by.id('search-button')).click();
			expectLoggedInUserLinkToBe('Welcome, OhaiAgain');
		});
		
		it('they can log out', function() {
			var email=dataUtils.randomEmail();
			
			browser.get('');
			loginDropdown.click();
			
			loginEmailField.sendKeys(email);
			loginButton.click();
			
			signupNameField.sendKeys('OhaiOneMoreTime');
			signupButton.click();			
			expectLoggedInUserLinkToBe('Welcome, OhaiOneMoreTime');

			loggedInUserDropdown.click();
			expect(logoutButton.isDisplayed()).toBe(true);
			expect(logoutButton.getText()).toBe('Log Out');
			expect(googleSignIn.isDisplayed()).toBe(false);

			logoutButton.click();
			expect(loginDropdown.isDisplayed()).toBe(true);
			expect(logoutButton.isDisplayed()).toBe(false);
			expectNoUserFieldsAreDisplayed();
			
			loginDropdown.click();
			expectLoginFieldsAreDisplayed();
			loginEmailField.clear();
			loginEmailField.sendKeys(email);
			loginButton.click();
			expect(logoutButton.isDisplayed()).toBe(false);
			expectLoggedInUserLinkToBe('Welcome, OhaiOneMoreTime');
			
			loggedInUserDropdown.click();
			logoutButton.click();
			browser.refresh();
			expect(loginDropdown.isDisplayed()).toBe(true);
		});
	});
	
	function expectLoggedInUserLinkToBe(expectedText) {
		expect(loggedInUserDropdown.getText()).toBe(expectedText);
	}
});