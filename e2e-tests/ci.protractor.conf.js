exports.config = {
  allScriptsTimeout: 11000,

  seleniumAddress: 'http://' + process.env.WEB_IP + ':4444/wd/hub',
  
  specs: [
    '*.js'
  ],

  capabilities: {
    'browserName': process.env.SELENIUM_BROWSER
  },
  
  baseUrl: 'http://' + process.env.WEB_IP + ':8000/app/',

  params: {
	  apiHostname: process.env.SERVICE_IP,
	  apiBasePath: '/recipe/api',
	  apiPort: 8080,
	  apiBaseUrl: 'http://' + process.env.SERVICE_IP + ':8080/recipe/api'
  },

  framework: 'jasmine2',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 5000
  }
};
