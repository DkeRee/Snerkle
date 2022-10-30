//essential delta time info//
const deltaTime = 1 / 60;
var accTime = 0;
var lastTime = 0;

var start = false;

function step(time) {
	accTime += (time - lastTime) / 1000;

	while (accTime > deltaTime) {
		if (accTime > 1) {
			accTime = deltaTime;
		}

		if (start) {
			game.goldenApple.update();
			game.snake.update();
		}

		accTime -= deltaTime;
	}
	lastTime = time;

	game.board.render();
	requestAnimationFrame(step);
}
requestAnimationFrame(step);

window.addEventListener("keydown", e => {
	game.goldenApple.userInput(e.keyCode ? e.keyCode : e.which);

	if (e.keyCode == 32 && start == false) {
		start = true;
		game = new Game();
	}
});
