const osc = require('osc-min');
const TCPBase = require('tcp-base');

// Helper to allow arrays of arrays to convert to bundles
const prepareObjectForOsc = function(msgObject, timetag) {
  if (Array.isArray(msgObject))
    return {
      oscType: 'bundle',
      timetag: typeof timetag === 'number' ? timetag : 0,
      elements: msgObject.map((v) => prepareObjectForOsc(v, timetag))
    };
  else return msgObject;
}


module.exports = class IpcClient extends TCPBase {

  /**
   * Creates an IpcClient and connects to the specified server.
   * 
   * @param {Object} options - An object that looks like this:
   * {
   *  targetHost: '127.0.0.1',
   *  targetPort: 9999,
   *  timeout: 3000,
   *  header: 0xf2b49e2c,
   *  isUnixDomainSocket: false,
   * }
   * @constructor
   */

  constructor(options) {
    if (typeof options.targetHost !== 'string')
      throw new Error("targetHost must be a string");
    if (typeof options.targetPort !== 'number' && options.isUnixDomainSocket === false)
      throw new Error("targetPort must be a number");
    if (typeof options.timeout !== 'number')
      options.timeout = 3000;
    if (options.header === undefined)
      options.header = 0xf2b49e2c;
    if (options.isUnixDomainSocket === true)
      options.targetPort = "";
      
    super({
      host: options.targetHost, 
      port: options.targetPort, 
      connectTimeout: options.timeout,
      needHeartbeat: false
    });

    this.header = options.header;
    this.messageId = 0;
    this.messageSent = 0;
    this.connected = 0;

    this.on('request', (data, address)=>{
      this.emit('res', data.data, address)
    });
    
  }

  getHeader(){
    return this.read(8);
  }

  getBodyLength(header){
    return header.readInt32LE(4);
  }

  decode(body){
    return {
      data: body,
    };
  }


  /**
   * Sends a Buffer object to the IPC.
   * @param {Buffer} messageContent - A Buffer object to send to the server.
   */
  async sendBuffer(messageContent){
    if (Buffer.isBuffer(messageContent) === false)
      throw new Error("messageContent must be a valid buffer");
    
    const header = Buffer.alloc(4);
    header.writeUInt32LE(this.header);
    const size = Buffer.alloc(4);
    size.writeUInt32LE(messageContent.length);

    const message = [header, size, messageContent];
    const toSend = Buffer.concat(message);

    const sendPromise = (toSend) => {
      return new Promise((resolve, reject)=>{
          this._socket.write(toSend, (err)=> {
            if (err) reject(err);
            resolve("sent");
          });
      });
    }

    return await sendPromise(toSend);
  }

  /**
   * Sends a string to the IPC.
   * @param {string } msgObject - A string (or buffer) to be sent to the server.
   */
  sendString(msgObject){
    if (Buffer.isBuffer(msgObject) === false && typeof msgObject !== 'string')
      throw new Error("msgObject must be a valid string or buffer");
    
    const messageContent = (msgObject instanceof Buffer)
      ? msgObject
      : Buffer.from(msgObject);
    return this.sendBuffer(messageContent);
  }

  /**
   * Sends an OSC Message to the IPC.
   * @param {object | Buffer} msgObject - The OSC Message object (or buffer) to be sent to the server.
   */
  sendOsc(msgObject, timetag){
    if (Buffer.isBuffer(msgObject) === false && typeof msgObject !== 'object')
      throw new Error("msgObject must be a valid object or buffer");
    
    try{
      const messageContent = (msgObject instanceof Buffer)
        ? msgObject
        : osc.toBuffer(prepareObjectForOsc(msgObject, timetag));
      return this.sendBuffer(messageContent);
    }
    catch (err){
      return Promise.reject(err);
    }
  }
}