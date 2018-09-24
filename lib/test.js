
// S.

"use strict";

function parse(buffer) {
	let result = "";
	// console.log(buffer);
	let parsed = JSON.parse(JSON.stringify(buffer)).data;

	parsed.forEach(byte => {
		let temp = byte.toString(2);
		result += Array(8 - temp.length).fill("0").join("") + temp;
	});

	// console.log("result.length: " + result.length)
	// console.log("result.length / 8: " + result.length / 8)

	return result;
}

console.log(parse(Buffer.from("as")));
