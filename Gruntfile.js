module.exports = function(grunt) {
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),
		
		uglify: {
			target1: {
				options: {
					sourceMap: true,
					banner: '/*! <%= pkg.title %> v<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
				},
				src: 'markerAnimateUnobtrusive.js',
				dest: 'dist/markerAnimateUnobtrusive.min.js'
			}
		}
	});
	
	grunt.registerTask('default', ['uglify']);
};