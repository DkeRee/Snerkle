class Body {
	constructor(x, y, board) {
		this.tileX = x;
		this.tileY = y;
		this.board = board;

		//insert into board
		this.board.setPosition(this.tileX, this.tileY, SNAKE);
	}

	delete() {
		this.board.erasePosition(this.tileX, this.tileY);
	}
}

function checkAllowed(body, board) {
	for (var i = 0; i < body.length; i++) {
		if (!board.checkAllowed(body[i].tileX, body[i].tileY)) {
			return false;
		}
	}

	return true;
}

function generateBody(length, board, direction) {
	//set placeholder for initial loop
	var localBody = [new LocalBody(-1, -1)];

	//get random coordinates
	while (!checkAllowed(localBody, board)) {
		localBody = [];

		var localBodyX = Math.floor(Math.random() * (BOARD_SIZE / TILE_SIZE));
		var localBodyY = Math.floor(Math.random() * (BOARD_SIZE / TILE_SIZE));

		var changeX = 0;
		var changeY = 0;

		switch(direction) {
			case RIGHT:
				changeX = -1;
				break;
			case LEFT:
				changeX = 1;
				break;
			case UP:
				changeY = 1;
				break;
			case DOWN:
				changeY = -1;
				break;
		}

		for (var i = 0; i < length; i++) {
			localBody.push(new LocalBody(localBodyX, localBodyY));
			localBodyX += changeX;
			localBodyY += changeY;
		}

		localBody.reverse();
	}


	const body = [];
	for (var i = 0; i < localBody.length; i++) {
		body.push(new Body(localBody[i].tileX, localBody[i].tileY, board));
	}
	return body;
}

class Snake {
	constructor(board) {
		const directions = [RIGHT, LEFT, UP, DOWN];
		
		this.increase = false;
		this.direction = directions[Math.floor(Math.random() * directions.length)];
		this.coolDown = 4;
		this.coolDownCounter = 0;

		//0 == tail, length - 1 == head
		this.board = board;
		this.body = generateBody(3, board, this.direction);
	}

	cloneBody() {
		const newBody = [];

		for (var i = 0; i < this.body.length; i++) {
			newBody.push(new LocalBody(this.body[i].tileX, this.body[i].tileY));
		}

		return newBody;
	}

	increaseLength() {
		var xInc = 0;
		var yInc = 0;

		switch(this.direction) {
			case RIGHT:
				xInc = 1;
				break;
			case LEFT:
				xInc = -1;
				break;
			case UP:
				yInc = -1;
				break;
			case DOWN:
				yInc = 1;
				break;
		}

		const testBody = new LocalBody(this.body[this.body.length - 1].tileX + xInc, this.body[this.body.length - 1].tileY + yInc);
		if (this.board.checkAllowed(testBody.tileX, testBody.tileY)) {
			this.body.push(new Body(testBody.tileX, testBody.tileY, this.board));
			this.increase = false;
		}
	}

	updateMovement() {
		//update movement

		//get new head
		const latestHead = this.body[this.body.length - 1];
		const newHeadCoords = {
			x: latestHead.tileX,
			y: latestHead.tileY
		};

		switch(this.direction) {
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

		this.body.push(new Body(newHeadCoords.x, newHeadCoords.y, this.board));

		//removal trailing tail
		this.body[0].delete();
		this.body.shift();
	}

	invokeBot() {
		const result = search(new AlphaBeta(-Infinity, Infinity), 16, 0, true, new SnakeSearcher(this.cloneBody(), this.direction), new GoldenAppleSearcher(game.goldenApple.tileX, game.goldenApple.tileY, game.goldenApple.direction));
		this.direction = result[0];
	}

	update() {
		if (this.coolDownCounter >= this.coolDown) {
			this.coolDownCounter = 0;

			this.invokeBot();
			this.updateMovement();

			if (this.increase) {
				this.increaseLength();
			}
		} else {
			this.coolDownCounter += 1;
		}
	}
}