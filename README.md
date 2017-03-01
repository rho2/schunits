# schunits
Inoffizielle App für WebUntis


```
npm install
bower install
ionic platform add android
cp -R res platforms/android
ionic build android

chmod +x run
./run
```
---
iOS
```
git clone https://github.com/rho2/schunits.git
cd schunits/

npm install
bower install
ionic platform add ios
ionic resources --icon
ionic run ios

ionic platform remove ios
ionic platform add ios
ionic run ios
```
Updates werden &uuml;ber [Code-Push](http://microsoft.github.io/code-push/) installiert.
