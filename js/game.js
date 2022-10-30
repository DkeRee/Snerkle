class Game {
	constructor() {
		this.coinCounter = 0;
		this.board = new Board();
		this.snake = new Snake(this.board);
		this.goldenApple = new GoldenApple(this.board);
	}
}

var game = new Game();