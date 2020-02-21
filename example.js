const IpcClient = require("osc-ipc-client")

// header has a default value of 0xf2b49e2c, 
// which is the default header which JUCE uses for its IPC implementation.
const options = {
  targetPort: 9999,
  targetHost: '127.0.0.1',
  header: 0xf2b49e2c, 
  timeout: 3000, 
  isUnixDomainSocket: false,
};

const client = new IpcClient(options);

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
  client.sendOsc([oscObject, oscObject])
  .then(client.sendOsc(oscObject)
  .then(client.sendString("hello")
  .then(()=>{
      client.close();
  })));
});


