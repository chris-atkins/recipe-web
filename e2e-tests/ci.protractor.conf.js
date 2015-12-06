exports.config = {
  allScriptsTimeout: 11000,

  seleniumAddress: 'http://159.203.127.94:4444/wd/hub',
  
  specs: [
    '*.js'
  ],

  capabilities: {
    'browserName': process.env.SELENIUM_BROWSER
  },

  baseUrl: 'http://159.203.127.94:8000/app/',

  params: {
	  apiHostname: '45.55.142.115',
	  apiBasePath: '/recipe/api',
	  apiPort: 8080,
	  apiBaseUrl: 'http://45.55.142.115:8080/recipe/api'
  },

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
