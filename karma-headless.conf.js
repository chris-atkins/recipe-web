module.exports = function(config){
  var baseProjectConfig = require('./karma.conf.js');
  
  baseProjectConfig(config)
  
  config.set({

    autoWatch : false,

    browsers : ['PhantomJS'],

    plugins : [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],
  });
};
