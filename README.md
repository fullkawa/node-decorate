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
$ npm install node-decorate
```

## Usage

### Hello, world
Step1. Edit ``/src/custom.js``

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

Step2. Start a proxy.
```bash
$ node index.js
```
on develop mode.
```bash
$ npm start
```
on production mode.

Step3. Access any site through this proxy.  
ex) http://127.0.0.1:8124/http/nodejs.org/

### URL format
http://HOST/TAG_PROTOCOL/TAG_HOST_AND_PATH  
- HOST is this proxy.  
ex) ``127.0.0.1:8124`` or ``example.com``
- TAG_PROTOCOL of target URL (now, ``http`` only)  
- TAG_HOST_AND_PATH of target URL  
ex) ``nodejs.org/api/`` or ``target.com/path/to/somewhere?param1=value1``

## Tips

### Load jQuery from local file
Step1. Make ``lib`` directory.  
```
node-decorate/
  lib/
```

Step2. Put ``jquery.min.js`` that paste jquery codes.
```
node-decorate/
  lib/
    jquery.min.js
```

Step3. Change config file ``config.js``.
```
  useLocalJquery : true,
```

### Start on port 80
Step1. Change config file ``config.js``.
```
  port : 80,
```

Step2. Start with "sudo"
```
$ sudo node index.js
```
or
```
$ sudo npm start
```
