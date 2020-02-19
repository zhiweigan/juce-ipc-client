const IpcClient = require("./client.js")

const options = {
  targetPort: 9999,
  targetHost: '127.0.0.1',
  // header: 0xf2b49e2c, //default value
  timeout: 3000,
}

const client = new IpcClient(options);

oscObject = {
  address: '/recieve',
  args: [
    { type: 'string', value: "This is an osc message from IpcClient"}
  ],
}

client.on("res", (data, address)=>{
  console.log(data, 'from', address);
});

client.on("connect", ()=>{
  client.sendOsc([oscObject, oscObject]).then(
    client.sendOsc(oscObject).then(()=>{
    //   client.close();
    })
  );
});


