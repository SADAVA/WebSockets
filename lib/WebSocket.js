
// S.

"use strict";

const EventListener		= require("eventlistener");
const TCPWrapper		= process.binding("tcp_wrap");

const httpParser		= require("./httpParser");
const webSocketParser	= require("./webSocketParser");
const genKeypair		= require("./genKeypair");

class Client extends EventListener {
	constructor(socket) {
		super();

		this.CLOSEFRAME = Buffer.from([0x88, 0x80, 0x6d, 0x18, 0x4c, 0x14]);

		this.OPEN		= 1;
		this.CLOSING	= 2;
		this.CLOSED		= 3;

		this.status		= 1;

		this._socket = socket;
		this._socket.onread = this._onread.bind(this);
	}

	send(...args) {
		this.write(...args);
	}

	write(message) {
		if(typeof message !== "string" && typeof message !== "object") {
			self.emit("error", new TypeError(
				"[WebSocket:Client] write(\"message\"), expected type: \"string\" or \"object\", got: " + typeof message
			));

			return -1;
		}

		message = webSocketParser.out(message);

		return this.writeBuffer(message);
	}

	writeBuffer(buffer) {
		if(buffer.constructor.name !== "Buffer") {
			this.emit("error", new TypeError(
				"[WebSocket:Client] writeBuffer(\"buffer\"), expected type: \"Buffer\", got: " + buffer.constructor.name
			));

			return -1;
		}

		return this._socket.writeBuffer({}, buffer);
	}

	close(reason) {
		if(this.status !== this.OPEN) {
			this.emit("error", new Error(
				"client already closed"
			));

			return -1;
		}

		this.writeBuffer(this.CLOSEFRAME);

		this.status = this.CLOSED;
		this.emit("disconnect", reason);

		return this._socket.close();
	}

	_onread(length, buffer) {
		if(length === -4095) {
			this.close("connection lost");

			return;
		}

		let result = webSocketParser.in(buffer);

		if(result["opcode"] === 0x1) {
			this.emit("message", result.data);
		} else if(result["opcode"] === 0x8) {
			this.close("user-disconnect");

			return;
		} else {
			console.log("Unrecognized opcode: " + result["opcode"])
			console.log(result);
		}
	}
}

class Server extends EventListener {
	constructor(properties) {
		super({
			"client-error": [{
				"_fn": error => {
					this.emit("error", error);
				}
			}]
		});

		this.properties = Object.assign({
			"host": "127.0.0.1",
			"port": 8080,
			"backlog": 126
		}, properties || {});

		let self = this;

		this.clients = [];

		this.socket = new TCPWrapper.TCP(TCPWrapper.constants.SERVER);
		this.socket.onconnection = function(error, client) {
			if(error !== 0) throw error;

			client.onread = function(nbit, buffer) {
				if(nbit <= 0) {
					client.close();

					return;
				}

				let request = httpParser(buffer.toString());

				pairWithClient(self, client, request["Sec-WebSocket-Key"]);
			}

			client.readStart();
		}
	}

	broadcast(message) {
		this.clients.forEach(client => {
			client.send(message);
		});
	}

	listen(callback) {
		let error = -1;

		if((error = this.socket.bind(this.properties.host, this.properties.port)) !== 0) {
			let err = new Error(
				"WebSocket.listen: bind failure: " + error
			);

			err.code = error;

			callback(err);

			return;
		}

		if((error = this.socket.listen(this.properties.backlog)) !== 0) {
			let err = new Error(
				"WebSocket.listen: listen failure: " + error
			);

			err.code = error;

			callback(err);

			return;
		}

		callback(null);
	}
}

function pairWithClient(self, socket, clientKey) {
	let client = new Client(socket);
	let clientPairKey = genKeypair(clientKey);

	client.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + clientPairKey + "\r\n\r\n");

	self.emit("connection", client);
	let clientID = self.clients.push(client);
	client.on("disconnect", () => {
		delete self.clients[clientID];
	});
	client.on("error", error => {
		self.emit("client-error", error);
	});
}

module.exports = {
	Server
}
