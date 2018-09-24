
// S.

"use strict";

function httpParser(request) {
	let result = {}

	let bigParts	= request.split("\r\n\r\n");

	let headParts	= bigParts[0].split("\r\n");
	let headers		= headParts[0].split(" ");

	result.method	= headers[0];
	result.url		= headers[1];
	result.protocol	= headers[2];

	for(let i = 1; i < headParts.length; i++) {
		let temp = headParts[i].split(": ");

		result[temp[0]] = temp[1];
	}

	if(result["Sec-WebSocket-Version"] !== undefined) {
		result["Sec-WebSocket-Version"] = result["Sec-WebSocket-Version"].split(", ");
	}

	return result;
}

module.exports = httpParser;
