# node-decorate

A proxy server to decorate a html/xml document with jQuery.

## Use case

### Case 1.Inside web server
* Install to server(s) web server running.
* Route HTTP requests to this proxy.

### Case 2. Independent proxy
* Install to any server(s).
* Access this proxy by formatted URL.(see below)

## Install
```bash
npm install node-decorate
```

## Usage

### Hello, world
1. Edit /src/custom.js
```javascript
module.exports = {
  append_manipulate : ['hello']
}

module.exports.proc_for_elements = {
  hello : function($) {
    $('body').attr('onload', 'alert("Hello, world !")');
  }
};
```

2. Start a proxy.
```bash
node index.js
```

3. Access any site through this proxy.
ex.
http://127.0.0.1:8124/http/nodejs.org/

### URL format
* Host is this proxy.
http://**127.0.0.1:8124**/http/nodejs.org/api/

* Protocol of target URL (now, http only)
http://127.0.0.1:8124**/http**/nodejs.org/api/

* Host and path of target URL
http://127.0.0.1:8124/http**/nodejs.org/api/**

## Tips

### Start a proxy on production mode
```
npm start
```

### Load jQuery from local file
TODO: later

### Start on port 80
TODO: later
