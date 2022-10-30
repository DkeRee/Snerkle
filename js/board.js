const death = new Audio("audio/death.mp3")

function initBoard(numTiles) {
	const board = [];
	const frequency = 0.15;

	for (var i = 0; i < numTiles; i++) {
		const row = [];
		for (var o = 0; o < numTiles; o++) {
			var noise = PerlinNoise(o * frequency, i * frequency);

			//transform the range to 0, 1
			noise += 1;
			noise /= 2;

			if (noise > 0.25) {
				row.push(EMPTY);
			} else {
				row.push(WALL);
			}
		}
		board.push(row);
	}

	return board;
}

function generateMoves(direction) {
	//this generates all possible technical moves
	//for example, going out of bounds, crashing into walls, etc
	//this will only remove the move that you definetly cannot do: go backwards
	//smart way of generating moves using the literal value of the move flag ;)
	//value matches up with this array!
	const allMoves = [RIGHT, LEFT, UP, DOWN];
	switch (direction) {
		case RIGHT:
			direction += 1;
			break;
		case LEFT:
			direction -= 1;
			break;
		case UP:
			direction += 1;
			break;
		case DOWN:
			direction -= 1;
			break;
	}
	allMoves.splice(direction, 1);
	return allMoves;
}

class Board {
	constructor() {
		//rendering
		this.boardSize = BOARD_SIZE;
		this.tileSize = TILE_SIZE;
		this.numTiles = this.boardSize / this.tileSize;

		//board
		this.board = initBoard(this.numTiles);
		this.dark = "#A2D149";
		this.light = "#AAD751";

		this.createCoin();
	}

	createCoin() {
		var coinX = Math.floor(Math.random() * this.numTiles);
		var coinY = Math.floor(Math.random() * this.numTiles);

		while (!this.collisionWithAnything(coinX, coinY, true)) {
			coinX = Math.floor(Math.random() * this.numTiles);
			coinY = Math.floor(Math.random() * this.numTiles);			
		}

		this.board[coinY][coinX] = COIN;
	}

	collisionWithAnything(x, y, inBounds) {
		if (inBounds) {
			if (this.board[y][x] == COIN) {
				game.coinCounter++;
				this.createCoin();
			}

			return this.board[y][x] == EMPTY || this.board[y][x] == COIN;
		}

		return false;
	}

	checkAllowed(x, y) {
		//more conditions will be set as time goes on. if these aren't met, the game will be ended.
		const inXBounds = 0 <= x && x <= this.numTiles - 1;
		const inYBounds = 0 <= y && y <= this.numTiles - 1;
		const inBounds = inXBounds && inYBounds;
		return inBounds && this.collisionWithAnything(x, y, inBounds);
	}

	setPosition(x, y, type) {
		if (this.checkAllowed(x, y)) {
			this.board[y][x] = type;			
		} else {
			//whatever it is has gone out of bounds, game is over
			start = false;
			scramblePerlin();
			death.currentTime = 0;
			death.play();
		}
	}

	erasePosition(x, y) {
		this.board[y][x] = EMPTY;
	}

	render() {
		var canvasCoords = {
			x: 0,
			y: 0
		}

		const numTiles = this.boardSize / this.tileSize;
		ctx.shadowBlur = 5;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (var i = 0; i < numTiles; i++) {
			for (var o = 0; o < numTiles; o++) {

				switch (this.board[i][o]) {
					case EMPTY:
						ctx.shadowBlur = 0;
						if (canvasCoords.y % 2 == 0) {
							if (canvasCoords.x % 2 == 0) {
								ctx.fillStyle = this.light;
							} else {
								ctx.fillStyle = this.dark;
							}							
						} else {
							if (canvasCoords.x % 2 == 0) {
								ctx.fillStyle = this.dark;
							} else {
								ctx.fillStyle = this.light;
							}								
						}
						break;
					case WALL:
						ctx.shadowColor = "red";
						ctx.fillStyle = "brown";
						break;
					case SNAKE:
						ctx.shadowColor = "red";
						ctx.fillStyle = "red";
						break;
					case COIN:
						ctx.shadowColor = "red";
						ctx.fillStyle = "cyan";
						break;
					case GOLDEN_APPLE:
						ctx.shadowColor = "red";
						ctx.fillStyle = "yellow";
						break;
				}

				ctx.fillRect(canvasCoords.x, canvasCoords.y, this.tileSize, this.tileSize);

				//give a little outline for everthing else that isn't empty
				if (this.board[i][o] !== EMPTY) {
					ctx.strokeStyle = "#d3d3d3";
					ctx.strokeRect(canvasCoords.x, canvasCoords.y, this.tileSize, this.tileSize);
				}

				//update canvas coords
				if (canvasCoords.x + this.tileSize == this.boardSize) {
					canvasCoords.x = 0;
					canvasCoords.y += this.tileSize;
				} else {
					canvasCoords.x += this.tileSize
				}
			}
		}

		if (!start) {
			ctx.shadowBlur = 10;
			ctx.shadowColor = "red";
			ctx.fillStyle = "rgba(10, 196, 30, 0.2)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.font = "90px monospace";
			ctx.fillStyle = "#FA9200";
			ctx.textAlign = "center";

			ctx.fillText("SNERKLE", canvas.width / 2, canvas.height / 2.6);

			ctx.font = "40px monospace";
			ctx.fillText("Your Score: " + game.coinCounter, canvas.width / 2, canvas.height / 1.9);

			ctx.fillText("Press Space", canvas.width / 2, canvas.height / 1.6);

			ctx.font = "30px monospace";
		}

		ctx.shadowBlur = 0;
	}
}