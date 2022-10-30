const cap = 256;
const P = [];

//init permutation table
for (var i = 0; i < cap; i++) {
	P.push(i);
}

function scramblePerlin() {
	//scramble permutation table
	for (var i = P.length - 1; i > 0; i--) {
		const randIndex = Math.round(Math.random() * (i - 1));
		const temp = P[i];

		//flop
		P[i] = P[randIndex];
		P[randIndex] = temp;
	}
}

scramblePerlin();

//double the table to avoid overflow
for (var i = 0; i < cap; i++) {
	P.push(P[i]);
}

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	dotProduct(otherVector) {
		return this.x * otherVector.x + this.y * otherVector.y;
	}
}

//smooth turns
function fade(t) {
	return ((6 * t - 15) * t + 10) * t * t * t;
}

//interpolate
function lerp(t, a, b) {
	return a + t * (b - a);
}

function GetConstantVector(permutationValue) {
	const type = permutationValue % 4;

	switch (type) {
		case 0:
			//pointing top right
			return new Vector(1, 1);
		case 1:
			//pointing top left
			return new Vector(-1, 1);
		case 2:
			//pointing bottom left
			return new Vector(-1, -1);
		default:
			//pointing bottom right
			return new Vector(1, -1);
	}
}

function PerlinNoise(x, y) {
	//used to get constant vector from permutation table
	const seedX = Math.floor(x) % cap;
	const seedY = Math.floor(y) % cap;

	//used to map out direction of internal vectors
	const vectorDirX = x - Math.floor(x);
	const vectorDirY = y - Math.floor(y);

	const internalBottomLeft = new Vector(vectorDirX, vectorDirY);
	const internalBottomRight = new Vector(vectorDirX - 1, vectorDirY);
	const internalTopLeft = new Vector(vectorDirX, vectorDirY - 1);
	const internalTopRight = new Vector(vectorDirX - 1, vectorDirY - 1);

	const constantTopRight = P[P[seedX + 1] + seedY + 1];
	const constantTopLeft = P[P[seedX] + seedY + 1];
	const constantBottomRight = P[P[seedX + 1] + seedY];
	const constantBottomLeft = P[P[seedX] + seedY];

	const dotBottomLeft = internalBottomLeft.dotProduct(GetConstantVector(constantBottomLeft));
	const dotBottomRight = internalBottomRight.dotProduct(GetConstantVector(constantBottomRight));
	const dotTopLeft = internalTopLeft.dotProduct(GetConstantVector(constantTopLeft));
	const dotTopRight = internalTopRight.dotProduct(GetConstantVector(constantTopRight));

	const u = fade(vectorDirX);
	const v = fade(vectorDirY);

	return lerp(u, lerp(v, dotBottomLeft, dotTopLeft), lerp(v, dotBottomRight, dotTopRight));
}