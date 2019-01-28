
# WebSockets

Current version: 0.1.0

## Installation

```
$ npm install @sadava/websockets
```

## Usage

```
const WebSockets = require("@sadava/websockets");
```

See more in ```demo/``` folder.

## WebSocket methods

### # new Server();

### # Server.constructor(properties);
```properties["host"] {string} IP address of the host```  
```properties["port"] {integer}```  
```properties["backlog"] {integer} Maximum allowed concurrent connections```

### # Server.listen(callback);

In case server was able to successfully listen on port - callback will take ```null``` as first argument. Otherwise will take an ```Error ```with error number of an error.

## Update log

v0.1.0:
 - Initial release
