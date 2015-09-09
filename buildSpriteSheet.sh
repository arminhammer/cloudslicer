#!/bin/sh

targetDir="app/resources/icons"
spriteDir="app/resources/sprites"
sourceDir="app/resources/AWS_Simple_Icons_svg_eps"
echo "Making $targetDir"
mkdir $targetDir
echo "Copying files to $targetDir"
find $sourceDir -type f -name '*.svg' -print0 | xargs -0 -I file cp file $targetDir
echo "Getting rid of whitespaces in the file names"
find $targetDir -type f -name '*.svg' -print0 | xargs -0 -I file rename 's/ /_/g' file
echo "Generating PNGs"
find $targetDir -type f -name '*.svg' -print0 | xargs -0 -I file convert -density 500 -transparent white -trim file file.png
echo "Renaming PNG file names"
find $targetDir -type f -name '*.png' -print0 | xargs -0 -I file rename 's/.svg.png/.png/g' file
echo "Removing SVG files"
find $targetDir -type f -name '*.svg' -print0 | xargs -0 -I file rm file
echo "Building spritesheet"
glue $targetDir $spriteDir
