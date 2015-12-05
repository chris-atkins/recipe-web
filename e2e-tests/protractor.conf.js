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
	  apiBasePath: '/recipee7/api',
	  apiPort: 8080
  },
  
  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
