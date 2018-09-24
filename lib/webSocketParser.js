
// S.

"use strict";

const bits = require("bits");

function parseIn(buffer) {
	if(buffer === undefined) return;
	let result = {}
	let offset = 0;

	let parsed = bits.translate(buffer);

	result["last"] = !!parseInt(parsed.slice(0, 1));

	result["rsv"] = Array(3);
	result["rsv"][0] = !!parseInt(parsed.slice(1, 2), 2);
	result["rsv"][1] = !!parseInt(parsed.slice(2, 3), 2);
	result["rsv"][2] = !!parseInt(parsed.slice(3, 4), 2);

	result["opcode"] = parseInt(parsed.slice(4, 8).join(""), 2);

	result["mask"] = !!parseInt(parsed.slice(8, 9), 2);

	result["payload-len"] = parseInt(parsed.slice(9, 16).join(""), 2);

	// if(result["payload-len"] === 126) {
	// 	//
	// }

	result["masking-key"] = parsed.slice(16 + offset, 48 + offset);
	result["data"] = "";

	let data = parsed.slice(48, 48 + 8 * result["payload-len"]);
	let _data = Array();

	for(let i = 0; i < data.length; i++) {
		_data.push(data[i] ^ result["masking-key"][i % 32]);
	}

	for(let i = 0; i < (_data.length / 8); i++) {
		result["data"] += String.fromCharCode(parseInt(_data.slice(i * 8, (i + 1) * 8).join(""), 2));
	}

	result["masking-key"] = result["masking-key"].join("");

	return result;
}

function parseOut(message, properties) {
	let raw = "1" + // FIN
			   "000" + // RSV
				  "0001" + // opcode
					  "0"; // Mask

	if(typeof message !== "string" && typeof message !== "object") {
		throw new TypeError(
			"[webSocketParser] out(\"message\"), expected type: \"string\" or \"object\", got: " + typeof message
		);
	}

	if(typeof message === "object") message = JSON.stringify(message);

	if(message.length < 126) {
		let temp = message.length.toString(2);

		temp = Array(7 - temp.length).fill("0").join("") + temp;

		raw += temp;
	} else if(message.length < 65536) {
		let temp = message.length.toString(2);

		temp = Array(16 - temp.length).fill("0").join("") + temp;

		raw += "1111110";
		raw += temp;
	} else {
		throw new Error(
			"message's maximum limit reached, 65535 < " + message.length
		);
	}

	raw += bits.translate(message).join("");

	let binnary = bits.bufferify(raw, {
		"input": "binnary"
	});

	return binnary;
}

module.exports = {
	"in": parseIn,
	"out": parseOut
};
