exports.config = {
  allScriptsTimeout: 11000,

  seleniumAddress: 'http://159.203.127.94:4444/wd/hub',
  
  specs: [
    '*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://159.203.127.94:8000/app/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
