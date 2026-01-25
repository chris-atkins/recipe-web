'use strict';
/* global localStorage */
var dataUtils = require('./utils/data-utils');

// Expected conditions for explicit waits
var EC = protractor.ExpectedConditions;

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

	// Helper function to wait for page to load
	function waitForPageLoad() {
		return browser.wait(EC.presenceOf(navbarSection), 5000);
	}

	// Helper function to wait for dropdown to open
	function waitForDropdownOpen() {
		return browser.wait(EC.visibilityOf(loginEmailField), 5000);
	}

	// Helper function to wait for login dropdown to be clickable
	function waitForLoginDropdown() {
		return browser.wait(EC.elementToBeClickable(loginDropdown), 5000);
	}

	// Helper to delete just the login cookie (can be called before navigation)
	function deleteCookie() {
		return browser.manage().deleteCookie('myrecipeconnection.com.usersLoggedInFromThisBrowser');
	}

	// Helper to fully clear login state - clears all cookies and localStorage via JavaScript
	function clearLoginState() {
		return browser.get('')
			.then(function() {
				return browser.executeScript(function() {
					document.cookie.split(';').forEach(function(c) {
						document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
					});
					localStorage.clear();
				});
			})
			.then(function() {
				return browser.refresh();
			})
			.then(function() {
				return waitForPageLoad();
			});
	}

	// Helper to wait for login dropdown to show "Welcome" (user logged in)
	function waitForWelcomeMessage() {
		return browser.wait(EC.textToBePresentInElement(loginDropdown, 'Welcome'), 5000);
	}

	beforeAll(function() {
		return deleteCookie();
	});

	beforeEach(function() {
		return deleteCookie();
	});

	afterEach(function() {
		return deleteCookie();
	});

	describe('with NO existing user associated with the current client machine', function() {

		beforeAll(function() {
			return deleteCookie()
				.then(function() {
					return browser.get('');
				})
				.then(function() {
					return waitForPageLoad();
				});
		});

		it('starts off with the "Log In" link visisble', function() {
			expect(loginDropdown.isPresent()).toBe(true);
			expect(loginDropdown.getText()).toBe("Log In");

			expectNoUserFieldsAreDisplayed();
		});

		describe('when selecting "Log In" in the user section', function() {

			it('toggles login fields when the login link is selected', function() {
				browser.get('');
				waitForPageLoad();

				loginDropdown.click();
				waitForDropdownOpen();
				expect(userLoginMessage.isDisplayed()).toBe(true);
				expect(loginEmailField.isDisplayed()).toBe(true);
				expect(loginButton.isDisplayed()).toBe(true);
				expect(googleSignIn.isDisplayed()).toBe(true);

				loginDropdown.click();
				browser.wait(EC.invisibilityOf(loginEmailField), 5000);
				expect(signupNameField.isDisplayed()).toBe(false);
				expect(loginEmailField.isDisplayed()).toBe(false);
				expect(userLoginMessage.isDisplayed()).toBe(false);
				expect(googleSignIn.isDisplayed()).toBe(false);
			});
		});

		describe('the user can register', function() {

			var email = dataUtils.randomEmail();

			it('and their name is displayed instead of the Log In link, and is persisted when refreshed', function() {
				return deleteCookie()
					.then(function() { return browser.get(''); })
					.then(function() { return waitForPageLoad(); })
					.then(function() { return waitForLoginDropdown(); })
					.then(function() { return loginDropdown.click(); })
					.then(function() { return waitForDropdownOpen(); })
					.then(function() {
						expectLoginFieldsAreDisplayed();
						return loginEmailField.sendKeys(email);
					})
					.then(function() { return loginButton.click(); })
					.then(function() { return browser.wait(EC.visibilityOf(signupNameField), 5000); })
					.then(function() {
						expectSignupFieldsAreDisplayed();
						return signupNameField.sendKeys('Ohai');
					})
					.then(function() { return signupButton.click(); })
					.then(function() { return browser.wait(EC.invisibilityOf(signupNameField), 5000); })
					.then(function() {
						expectNoUserFieldsAreDisplayed();
						expectLoggedInUserLinkToBe('Welcome, Ohai');
						return browser.refresh();
					})
					.then(function() { return waitForPageLoad(); })
					.then(function() {
						expectLoggedInUserLinkToBe('Welcome, Ohai');
					});
			});

			it('when registering with an existing email, and is persisted when refreshed', function() {
				return clearLoginState()
					.then(function() { return waitForLoginDropdown(); })
					.then(function() { return loginDropdown.click(); })
					.then(function() { return waitForDropdownOpen(); })
					.then(function() {
						expectLoginFieldsAreDisplayed();
						return loginEmailField.sendKeys(email);
					})
					.then(function() { return loginButton.click(); })
					.then(function() { return browser.wait(EC.invisibilityOf(loginEmailField), 5000); })
					.then(function() {
						expectNoUserFieldsAreDisplayed();
						expectLoggedInUserLinkToBe('Welcome, Ohai');
						return browser.refresh();
					})
					.then(function() { return waitForPageLoad(); })
					.then(function() {
						expectLoggedInUserLinkToBe('Welcome, Ohai');
					});
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

		var testEmail;

		beforeAll(function() {
			testEmail = dataUtils.randomEmail();
			return clearLoginState()
				.then(function() { return waitForLoginDropdown(); })
				.then(function() { return loginDropdown.click(); })
				.then(function() { return waitForDropdownOpen(); })
				.then(function() { return loginEmailField.sendKeys(testEmail); })
				.then(function() { return loginButton.click(); })
				.then(function() { return browser.wait(EC.visibilityOf(signupNameField), 5000); })
				.then(function() { return signupNameField.sendKeys('UserAlreadySignedInFromThisBrowser'); })
				.then(function() { return signupButton.click(); })
				.then(function() { return browser.wait(EC.invisibilityOf(signupNameField), 5000); })
				.then(function() {
					expectLoggedInUserLinkToBe('Welcome, UserAlreadySignedInFromThisBrowser');
				});
		});

		it('automatically logs the user in', function() {
			// First, re-login since beforeEach deleted the cookie
			return browser.get('')
				.then(function() { return waitForPageLoad(); })
				.then(function() { return waitForLoginDropdown(); })
				.then(function() { return loginDropdown.click(); })
				.then(function() { return waitForDropdownOpen(); })
				.then(function() { return loginEmailField.sendKeys(testEmail); })
				.then(function() { return loginButton.click(); })
				.then(function() { return waitForWelcomeMessage(); })
				.then(function() {
					expectLoggedInUserLinkToBe('Welcome, UserAlreadySignedInFromThisBrowser');
					// Now refresh and verify the cookie persists
					return browser.refresh();
				})
				.then(function() { return waitForPageLoad(); })
				.then(function() {
					// Wait for Angular/AngularJS to finish loading and reading the cookie
					return browser.sleep(500);
				})
				.then(function() {
					expectLoggedInUserLinkToBe('Welcome, UserAlreadySignedInFromThisBrowser');
				});
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
			return clearLoginState()
				.then(function() { return waitForLoginDropdown(); })
				.then(function() { return loginDropdown.click(); })
				.then(function() { return waitForDropdownOpen(); })
				.then(function() { return loginEmailField.sendKeys(dataUtils.randomEmail()); })
				.then(function() { return loginButton.click(); })
				.then(function() { return browser.wait(EC.visibilityOf(signupNameField), 5000); })
				.then(function() { return signupNameField.sendKeys('OhaiAgain'); })
				.then(function() { return signupButton.click(); })
				.then(function() { return browser.wait(EC.invisibilityOf(signupNameField), 5000); })
				.then(function() { return waitForWelcomeMessage(); })
				.then(function() {
					expectLoggedInUserLinkToBe('Welcome, OhaiAgain');
					return element(by.id('search-button')).click();
				})
				.then(function() { return waitForPageLoad(); })
				.then(function() {
					expectLoggedInUserLinkToBe('Welcome, OhaiAgain');
				});
		});

		it('they can log out', function() {
			var email = dataUtils.randomEmail();

			return clearLoginState()
				.then(function() { return waitForLoginDropdown(); })
				.then(function() { return loginDropdown.click(); })
				.then(function() { return waitForDropdownOpen(); })
				.then(function() { return loginEmailField.sendKeys(email); })
				.then(function() { return loginButton.click(); })
				.then(function() { return browser.wait(EC.visibilityOf(signupNameField), 5000); })
				.then(function() { return signupNameField.sendKeys('OhaiOneMoreTime'); })
				.then(function() { return signupButton.click(); })
				.then(function() { return browser.wait(EC.invisibilityOf(signupNameField), 5000); })
				.then(function() { return waitForWelcomeMessage(); })
				.then(function() {
					expectLoggedInUserLinkToBe('Welcome, OhaiOneMoreTime');
					return loggedInUserDropdown.click();
				})
				.then(function() { return browser.wait(EC.visibilityOf(logoutButton), 5000); })
				.then(function() {
					expect(logoutButton.isDisplayed()).toBe(true);
					expect(logoutButton.getText()).toBe('Log Out');
					expect(googleSignIn.isDisplayed()).toBe(false);
					return logoutButton.click();
				})
				.then(function() { return browser.wait(EC.invisibilityOf(logoutButton), 5000); })
				.then(function() {
					expect(loginDropdown.isDisplayed()).toBe(true);
					expect(logoutButton.isDisplayed()).toBe(false);
					expectNoUserFieldsAreDisplayed();
					return waitForLoginDropdown();
				})
				.then(function() { return loginDropdown.click(); })
				.then(function() { return waitForDropdownOpen(); })
				.then(function() {
					expectLoginFieldsAreDisplayed();
					return loginEmailField.clear();
				})
				.then(function() { return loginEmailField.sendKeys(email); })
				.then(function() { return loginButton.click(); })
				.then(function() { return browser.wait(EC.invisibilityOf(loginEmailField), 5000); })
				.then(function() { return waitForWelcomeMessage(); })
				.then(function() {
					expect(logoutButton.isDisplayed()).toBe(false);
					expectLoggedInUserLinkToBe('Welcome, OhaiOneMoreTime');
					return loggedInUserDropdown.click();
				})
				.then(function() { return browser.wait(EC.visibilityOf(logoutButton), 5000); })
				.then(function() { return logoutButton.click(); })
				.then(function() { return browser.refresh(); })
				.then(function() { return waitForPageLoad(); })
				.then(function() {
					expect(loginDropdown.isDisplayed()).toBe(true);
				});
		});
	});
	
	function expectLoggedInUserLinkToBe(expectedText) {
		expect(loggedInUserDropdown.getText()).toBe(expectedText);
	}
});