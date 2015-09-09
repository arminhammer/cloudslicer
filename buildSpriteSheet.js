#!/usr/bin/node
/**
 * Created by arming on 9/8/15.
 */

//require('events').EventEmitter.prototype._maxListeners = 0;

var fs = require('fs-extra');
var path = require('path');
var filewalker = require('filewalker');
var im = require('imagemagick');
var execSync = require('child_process').execSync;

var targetDir = 'app/resources/sprites/';
var sourceDir = 'app/resources/AWS_Simple_Icons_svg_eps/';

fs.ensureDirSync(targetDir+'svg');
fs.ensureDirSync(targetDir+'png');
//filter: /.svg$/
//fs.copy(sourceDir, targetDir, {clobber: true}, function(err) {
//  if(err) {
//  console.log(err);
//}
//console.log('Copied file.')
//});

var Inkscape = require('inkscape');

var svgToPngConverter = new Inkscape(['-e']);

filewalker(sourceDir)
  //.on('dir', function(p) {
  //  console.log('dir:  %s', p);
  //})
  .on('file', function(rel, s, abs) {
    var parse = path.parse(abs);

    if(parse.ext === '.svg') {
      console.log('file: %s, %d bytes', abs, s.size);
      //fs.copySync(abs, targetDir);
      var filename = parse.base.replace(/\s/g, "");
      console.log('Filename: ' + filename);
      var svgFile = targetDir+'svg/'+filename;
      fs.createReadStream(abs).pipe(fs.createWriteStream(svgFile));
      /*
       fs.copy(abs, targetDir, function(err) {
       if(err) {
       console.log(err);
       }
       console.log('Copied file.')
       });
       */
      //fs.createReadStream(abs).pipe(fs.createWriteStream(targetDir));
    }
  })
  .on('error', function(err) {
    console.error(err);
  })
  .on('done', function() {
    console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
    fs.readdir(targetDir+'svg', function(err, fList) {

      /*
       fList.forEach(function(svgFile) {
       var targetFile = targetDir+'png/'+svgFile.replace('.svg', '.png');
       var cmd = 'inkscape -f ' + svgFile + ' -e ' + targetFile;
       console.log('Executing ', cmd);
       execSync(cmd, { cwd: targetDir+'svg/'});
       });
       */

      /*
       var Builder = require( 'node-spritesheet' ).Builder;

       var builder = new Builder({
       outputDirectory: targetDir,
       outputImage: 'sprite.png',
       outputCss: 'sprite.css',
       selector: '.sprite',
       images: fList
       });

       builder.build( function() {
       console.log( "Built from " + builder.files.length + " images" );
       });
       */

    });

  })
  .walk();



