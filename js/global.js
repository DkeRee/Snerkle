const BOARD_SIZE = 600;
const TILE_SIZE = 25;

canvas.width = BOARD_SIZE;
canvas.height = BOARD_SIZE;

//BOARD CONSTANTS
const EMPTY = 0;
const WALL = 1;
const SNAKE = 2;
const COIN = 3;
const GOLDEN_APPLE = 4;

//MOVEMENT DIRECTIONS
const RIGHT = 0;
const LEFT = 1;
const UP = 2;
const DOWN = 3;
const NONE = 4;