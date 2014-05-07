#!/bin/bash

zip -r app.nw *.css *.js *.json *.html codemirror js html node_modules
cp Info.plist MoonPad.app/Contents/Info.plist
cp app.nw MoonPad.app/Contents/Resources/app.nw
rm app.nw

open MoonPad.app
