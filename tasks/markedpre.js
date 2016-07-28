'use strict';

module.exports = function(grunt) {

    var async  = require('async'),
        fs     = require('fs'),
        os     = require('os'),
        util   = require('util'),
        _      = require('lodash');

    grunt.registerMultiTask("markedpre", "Runs markedpre plugin to prepare grunt-marked task", function() {
        var done    = this.async(),
            files = this.files;

        var list = []

        async.each(files, function(file, next) {
            var sources, destination;

            destination = file.dest;


            sources = file.src.filter(function(path) {
                if (!fs.existsSync(path)) {
                    grunt.log.warn(util.format('Source file "%s" is not found', path));
                    return false;
                }

                return true;
            });



            async.map(sources, fs.readFile, function(err, contents) {
                if (err) {
                    grunt.log.error(util.format('Could not read files "%s"', sources.join(', ')));
                    return next(err);
                }

                var filepath = destination.replace(file.orig.dest, '')
                var url = filepath.replace('.md', '.html')
                var ob = {path:filepath, url:url, header:{}}

                // thanks from   this source
                // https://github.com/testdouble/grunt-markdown-blog/blob/master/lib/markdown_splitter.coffee#L10-L16
                var inHeader = false
                var first = true
                contents.join(os.EOL).replace("\r\n", "\n").split("\n").forEach(function(line){
                    if (line.indexOf('---') > -1){
                        inHeader = !inHeader
                    }
                    if(inHeader && !first){
                        var v = line.split(':')
                        var o = {}
                        ob.header[_.trim(v[0])] = _.trim(v[1])
                    }
                    first=false
                })


                list.push(ob)

                next();
            });

        }, function() {
            
            var rev = _(list).reverse().value()
            grunt.config.set('filsys', rev);
            

          done();
        });

        

    });

};
