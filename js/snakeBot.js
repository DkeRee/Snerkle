const WIN_BASE = 30000;

class LocalBody {
	constructor(x, y) {
		this.tileX = x;
		this.tileY = y;
	}
}

class SnakeSearcher {
	constructor(body, direction) {
		this.body = body;
		this.direction = direction;
	}

	cloneBody() {
		const newBody = [];

		for (var i = 0; i < this.body.length; i++) {
			newBody.push(new LocalBody(this.body[i].tileX, this.body[i].tileY));
		}

		return newBody;
	}

	clone() {
		return new SnakeSearcher(this.cloneBody(), this.direction);
	}

	hitSides() {
		const head = this.body[this.body.length - 1];

		const inXBounds = 0 <= head.tileX && head.tileX <= (BOARD_SIZE / TILE_SIZE) - 1;
		const inYBounds = 0 <= head.tileY && head.tileY <= (BOARD_SIZE / TILE_SIZE) - 1;
		return inXBounds && inYBounds;
	}

	hitWall() {
		const head = this.body[this.body.length - 1];
		if (head.tileX > -1 && head.tileY > -1 && head.tileX < (BOARD_SIZE / TILE_SIZE) && head.tileY < (BOARD_SIZE / TILE_SIZE)) {
			if (game.board.board[head.tileY][head.tileX] == WALL) {
				return true;
			}
		}

		return false;
	}

	hitSelf() {
		const head = this.body[this.body.length - 1];		
		for (var i = 0; i < this.body.length - 1; i++) {
			if (this.body[i].tileX == head.tileX && this.body[i].tileY == head.tileY) {
				return true;
			}
		}

		return false;
	}

	isOn(x, y) {
		for (var i = 0; i < this.body.length; i++) {
			if (this.body[i].tileX == x && this.body[i].tileY == y) {
				return true;
			}
		}

		return false;
	}

	makeMove(newDirection) {
		const latestHead = this.body[this.body.length - 1];
		const newHeadCoords = {
			x: latestHead.tileX,
			y: latestHead.tileY
		};

		switch(newDirection) {
			case RIGHT:
				newHeadCoords.x += 1;
				break;
			case LEFT:
				newHeadCoords.x -= 1;
				break;
			case UP:
				newHeadCoords.y -= 1;
				break;
			case DOWN:
				newHeadCoords.y += 1;
				break;
		}

		this.body.push(new LocalBody(newHeadCoords.x, newHeadCoords.y));

		//removal trailing tail
		this.body.shift();

		this.direction = newDirection;
	}
}

class GoldenAppleSearcher {
	constructor(x, y, direction) {
		this.tileX = x;
		this.tileY = y;
		this.direction = direction;
	}

	clone() {
		return new GoldenAppleSearcher(this.tileX, this.tileY, this.direction);
	}

	hitWall() {
		if (this.tileX > -1 && this.tileY > -1 && this.tileX < (BOARD_SIZE / TILE_SIZE) && this.tileY < (BOARD_SIZE / TILE_SIZE)) {
			if (game.board.board[this.tileY][this.tileX] == WALL) {
				return true;
			}
		}

		return false;
	}

	hitSides() {
		const inXBounds = 0 <= this.tileX && this.tileX <= (BOARD_SIZE / TILE_SIZE) - 1;
		const inYBounds = 0 <= this.tileY && this.tileY <= (BOARD_SIZE / TILE_SIZE) - 1;
		return inXBounds && inYBounds;
	}

	makeMove(newDirection) {
		switch(newDirection) {
			case RIGHT:
				this.tileX += 1;
				break;
			case LEFT:
				this.tileX -= 1;
				break;
			case UP:
				this.tileY -= 1;
				break;
			case DOWN:
				this.tileY += 1;
				break;
		}

		this.direction = newDirection;
	}
}

class AlphaBeta {
	constructor(alpha, beta) {
		this.alpha = alpha;
		this.beta = beta;
	}

	raiseAlpha(score) {
		this.alpha = score;
	}

	failLow(score) {
		return score <= this.alpha;
	}

	failHigh() {
		return this.alpha >= this.beta;
	}

	flip() {
		return new AlphaBeta(-this.beta, -this.alpha);
	}
}

function evaluate(snakeSearcher, goldenAppleSearcher, is_snake) {
	const snakeHead = snakeSearcher.body[snakeSearcher.body.length - 1];
	const dist = Math.abs(snakeHead.tileX - goldenAppleSearcher.tileX) + Math.abs(snakeHead.tileY - goldenAppleSearcher.tileY);
	
	if (is_snake) {
		return -dist;
	} else {
		return dist;
	}
}

//maximizer is snake, minimizer is golden apple
function search(alphaBeta, depth, ply, is_snake, snakeSearcher, goldenAppleSearcher) {
	//terminal node...get static eval
	if (depth == 0) {
		return [NONE, evaluate(snakeSearcher, goldenAppleSearcher, is_snake)];
	}

	//SNAKE HAS EATEN GOLDEN APPLE
	if (snakeSearcher.isOn(goldenAppleSearcher.tileX, goldenAppleSearcher.tileY)) {
		//if the snake and golden apple meet, it is only good for the snake!
		if (is_snake) {
			return [NONE, WIN_BASE - ply];
		} else {
			return [NONE, -WIN_BASE + ply];	
		}
	}

	if (snakeSearcher.hitSelf() || snakeSearcher.hitWall() || !snakeSearcher.hitSides() || goldenAppleSearcher.hitWall() || !goldenAppleSearcher.hitSides()) {
		//no matter who dies, it is always bad for them
		return [NONE, WIN_BASE - ply];
	}

	var legalMoves;
	if (is_snake) {
		legalMoves = generateMoves(snakeSearcher.direction);
	} else {
		legalMoves = generateMoves(goldenAppleSearcher.direction);
	}

	var bestDirection = null;
	var bestScore = -Infinity;
	for (var i = 0; i < legalMoves.length; i++) {
		const newDirection = legalMoves[i];
		const snakeSearcherClone = snakeSearcher.clone();
		const goldenAppleSearcherClone = goldenAppleSearcher.clone();

		if (is_snake) {
			snakeSearcherClone.makeMove(newDirection);
		} else {
			goldenAppleSearcherClone.makeMove(newDirection);
		}

		const result = search(alphaBeta.flip(), depth - 1, ply + 1, !is_snake, snakeSearcherClone, goldenAppleSearcherClone);
		const score = -result[1];

		if (score > bestScore) {
			bestScore = score;
			bestDirection = newDirection;

			if (!alphaBeta.failLow(score)) {
				alphaBeta.raiseAlpha(score);
				if (alphaBeta.failHigh()) {
					//FAIL SOFT
					break;
				}
			}
		}
	}

	return [bestDirection, bestScore];
}