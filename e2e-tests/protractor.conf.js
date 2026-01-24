'use strict';

var browserName = process.env.SELENIUM_BROWSER ? process.env.SELENIUM_BROWSER : 'chrome';

exports.config = {
	allScriptsTimeout: 11000,

	chromeDriver: '../node_modules/chromedriver/lib/chromedriver/chromedriver',

	specs: [
		'*spec.js','endpoint-tests/*spec.js'
	],

	capabilities: {
		'browserName': browserName,
		'chromeOptions': {
			'args': ['--window-size=1280,1024']
		}
	},

	baseUrl: 'http://localhost:8000/',

	params: {
		apiHostname: '127.0.0.1',
		apiPort: 5555,
		apiBasePath: '/api',
		apiBaseUrl: 'http://127.0.0.1:5555/api'
	},

	framework: 'jasmine2',

	jasmineNodeOpts: {
		defaultTimeoutInterval: 15000
	},

	// Required for hybrid Angular/AngularJS apps using @angular/upgrade
	// Tells Protractor to look for multiple Angular roots
	useAllAngular2AppRoots: true,

	onPrepare: function() {
		// Disable Angular synchronization for hybrid apps
		// This is necessary because @angular/upgrade manually bootstraps AngularJS
		// and Protractor can't properly detect both frameworks
		browser.waitForAngularEnabled(false);
	}
};
