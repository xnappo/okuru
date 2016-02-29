# okuru
Okuru theme for Emby Theater

Installation
------------

Install into the app by installing a plugin from a url. 

The url is: http://xnappo.github.io/okuru/package.json

Local Testing
-------------
 
To test with your own local copy, first clone the repo to a directory. Install NodeJS, then open a command prompt to the root folder of the repository, and enter:

npm install http-server -g

This will install the http server module. To start the server, enter

http-server -p 8088 --cors

It will only be available using localhost. Then you can install the plugin using http://localhost:8088/package.json
