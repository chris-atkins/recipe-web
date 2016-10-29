'use strict';
exports.config = {
	allScriptsTimeout: 11000,

	specs: [
		'prod.monitoring.spec.js'
	],

	seleniumAddress: 'http://' + process.env.BUILD_SERVER_IP + ':4444/wd/hub',

	capabilities: {
		'browserName': 'chrome'
	},

	baseUrl: 'http://www.myrecipeconnection.com/',

	framework: 'jasmine2',

	jasmineNodeOpts: {
		defaultTimeoutInterval: 10000
	}
};
