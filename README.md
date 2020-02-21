# osc-ipc-client
A client for sending and recieving messages to/from an Interprocess Connection. 

## Install:
```
npm install osc-ipc-client
```

## Constructor:
```javascript
const IpcClient = require("osc-ipc-client");
const client = new IpcClient(options);
```

## Options:

```javascript
const options = {
  targetPort: 9999,
  targetHost: '127.0.0.1',
  header: 0xf2b49e2c, // default for connecting to a JUCE IPC
  timeout: 3000, 
  isUnixDomainSocket: false,
};
```
| Key | Value |
|---------|-------------|
| `targetPort` | Target port |
| `targetHost` | Target host or Unix Domain Socket pathname |
| `header` | A 32 bit unsigned integer |
| `timeout` | Timeout, in milliseconds, for connecting to the server |
| `isUnixDomainSocket` | Boolean, indicating whether or not targetHost is a Unix Domain Socket |

## Usage:

```javascript
oscObject = {
  address: '/recieve',
  args: [
    { type: 'string', value: "This is an osc message from IpcClient"}
  ],
};

// event 'res' occurs when a response is recieved from the server.
client.on("res", (data, address)=>{
  console.log(data, 'from', address);
});

// event 'connect' occurs when the TCP connection is connected.
client.on("connect", ()=>{
  client.sendOsc([oscObject, oscObject]) // can send OSC bundles
  .then(client.sendOsc(oscObject) // can send OSC messages
  .then(client.sendString("hello") // can send strings
  .then(()=>{
      client.close();
  })));
});

```