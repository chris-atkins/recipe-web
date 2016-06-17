'use strict';
exports.config = {
  allScriptsTimeout: 11000,

  seleniumAddress: 'http://' + process.env.WEB_IP + ':4444/wd/hub',
  
  specs: [
    '*.js'
  ],

  capabilities: {
    'browserName': process.env.SELENIUM_BROWSER
  },
  
  baseUrl: 'http://' + process.env.WEB_IP + ':8000/',

  params: {
	  apiHostname: process.env.SERVICE_IP,
	  apiBasePath: '/api',
	  apiPort: 5555,
	  apiBaseUrl: 'http://' + process.env.SERVICE_IP + ':5555/api'
  },

  framework: 'jasmine2',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 15000
  }
};
