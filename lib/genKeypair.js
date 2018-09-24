
// S.

"use strict";

const crypto = require("crypto");

function genKeypair(userkey) {
	return crypto.createHash("sha1").update(userkey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest('base64');
}

module.exports = genKeypair;
