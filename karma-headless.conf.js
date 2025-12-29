"use strict";

module.exports = function (config) {
	var baseProjectConfig = require('./karma.conf.js');

	baseProjectConfig(config);

	config.set({
		concurrency: 1,
		autoWatch: false,

		browsers: ['ChromeHeadless'],

		plugins: [
			'karma-chrome-launcher',
			'karma-jasmine',
			'karma-junit-reporter',
			'karma-ng-html2js-preprocessor'
		]
	});
};
