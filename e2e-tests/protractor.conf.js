exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8000/app/',
  
  params: {
	  apiHostname: '127.0.0.1',
	  apiPort: 8080,
	  apiBasePath: '/recipee7/api',
	  apiBaseUrl: 'http://127.0.0.1:8080/recipee7/api'
  },
  
  framework: 'jasmine2',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 5000
  }
};
