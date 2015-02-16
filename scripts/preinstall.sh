#!/bin/bash
mkdir public/
mkdir public/css
mkdir public/fonts
mkdir public/js
mkdir public/js/lib
npm run build-lib
npm run build-fonts
cp index.ejs public/index.ejs
cp css/*.css public/css/
