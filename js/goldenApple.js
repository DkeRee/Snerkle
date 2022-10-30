const boop = new Audio("audio/boop.mp3");

function sanitizeUserInput(legalMoves, direction) {
	//return true if this mvoe can be played
	for (var i = 0; i < legalMoves.length; i++) {
		if (legalMoves[i] == direction) {
			return true;
		}
	}

	return false;
}

class GoldenApple {
	constructor(board) {
		this.direction = RIGHT;
		this.coolDown = 4;
		this.coolDownCounter = 0;

		this.tileX = 0;
		this.tileY = 0;
		this.board = board;
		this.board.setPosition(this.tileX, this.tileY, GOLDEN_APPLE);
	}

	updateMovement() {
		//update movement
		this.board.erasePosition(this.tileX, this.tileY);
		switch(this.direction) {
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
		this.board.setPosition(this.tileX, this.tileY, GOLDEN_APPLE);
	}

	update() {
		if (this.coolDownCounter >= this.coolDown) {
			this.coolDownCounter = 0;
			this.updateMovement();
		} else {
			this.coolDownCounter += 1;
		}
	}

	playSound() {
		boop.currentTime = 0;
		boop.play();
	}

	userInput(key) {
		const legalMoves = generateMoves(this.direction);

		switch (key) {
			case 87:
			case 38:
				if (sanitizeUserInput(legalMoves, UP)) {
					this.direction = UP;	
					this.playSound();			
				}
				break;
			case 83:
			case 40:
				if (sanitizeUserInput(legalMoves, DOWN)) {
					this.direction = DOWN;			
					this.playSound();	
				}
				break;
			case 68:
			case 39:
				if (sanitizeUserInput(legalMoves, RIGHT)) {
					this.direction = RIGHT;	
					this.playSound();				
				}
				break;
			case 65:
			case 37:
				if (sanitizeUserInput(legalMoves, LEFT)) {
					this.direction = LEFT;
					this.playSound();
				}
				break;
		}
	}
}