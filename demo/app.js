
// S.

"use strict";

const WebSocket = require("../");

let server = new WebSocket.Server();

let i = 0;
let log = function(id, message) { console.log("[" + id + "] " + message); }

server.listen(error => {
	if(error !== null) throw error;

	console.log("WebSocket server is now listening...");
});

server.on("error", error => {
	console.log(error.toString());
});

server.on("connection", client => {
	client.id = i++;
	log(client.id, "CONNECTED");

	client.send({
		"type": "server-message",
		"message": "You are now connected. Welcome to our little workspace."
	});

	client.send({
		"type": "your-id",
		"message": client.id
	});

	client.on("message", message => {
		log(client.id, "[message]: " + message);

		server.broadcast({
			"type": "user-message",
			"userID": client.id,
			"message": message
		});
	});

	client.on("disconnect", reason => {
		log(client.id, "DISCONNECTED: " + (reason || "no reason given."));
	});
});
