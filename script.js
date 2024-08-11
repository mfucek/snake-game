const canvas = document.querySelector('canvas');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;
let score = 0;

const ctx = canvas.getContext('2d');

const dimensions = 20;

const grid = new Array(dimensions).fill(new Array(dimensions).fill(0));
const ripple = new Array(dimensions).fill(new Array(dimensions).fill(0));

const drawScore = () => {
	const el = document.querySelector('.score');
	el.innerHTML = score.toString().padStart(4, '0');
	if (score >= 420) {
		el.classList.add('rainbow');
	}
};
drawScore();

let margins = 100;
let padding = 12;

let gridSize = Math.min(width, height);
let cellSize = (gridSize - margins * 2) / dimensions;

let snake = [
	{
		x: Math.round(dimensions / 2),
		y: Math.round(dimensions / 2)
	}
];

let food = [];

const makeFood = () => {
	const x = Math.floor(Math.random() * dimensions);
	const y = Math.floor(Math.random() * dimensions);

	if (snake.some((s) => s.x === x && s.y === y)) {
		makeFood();
		return;
	}
	if (food.some((f) => f.x === x && f.y === y)) {
		makeFood();
		return;
	}
	food.push({ x, y });
};

let snakeDirection = [0, -1];

const clear = () => {
	ctx.shadowBlur = 0;
	ctx.shadowColor = '#000';
	ctx.fillStyle = '#000e';
	ctx.fillRect(0, 0, width, height);

	if (snake.length < 20) return;

	ctx.globalAlpha = 0.5;
	const img = new Image();
	img.src = 'hary-2.png';
	const size = Math.min(width, height) * (0.8 + 0.2 * Math.sin(age / 2000));
	ctx.drawImage(img, width / 2 - size / 2, height / 2 - size / 2, size, size);

	const interpolateColors = (color1, color2, ratio) => {
		const hexToRgb = (hex) => {
			const bigint = parseInt(hex.slice(1), 16);
			const r = (bigint >> 16) & 255;
			const g = (bigint >> 8) & 255;
			const b = bigint & 255;
			return { r, g, b };
		};

		const rgbToHex = (rgb) => {
			const { r, g, b } = rgb;
			return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
		};

		const c1 = hexToRgb(color1);
		const c2 = hexToRgb(color2);

		const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
		const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
		const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

		return rgbToHex({ r, g, b });
	};

	const rainbowColors = [
		'#ff0000', // red
		'#ff7f00', // orange
		'#ffff00', // yellow
		'#00ff00', // green
		'#0000ff', // blue
		'#4b0082', // indigo
		'#8b00ff' // violet
	];

	const colorIndex = Math.floor(age / 1000) % rainbowColors.length;
	const color1 = rainbowColors[colorIndex];
	const color2 = rainbowColors[(colorIndex + 1) % rainbowColors.length];
	const ratio = (age % 1000) / 1000;
	const rainbowColor = interpolateColors(color1, color2, ratio);

	ctx.globalCompositeOperation = 'color';
	ctx.fillStyle = rainbowColor;
	ctx.fillRect(0, 0, width, height);
	ctx.globalCompositeOperation = 'source-over';
	ctx.globalAlpha = 1;
};

const si = (a) => Math.sin(a) / 2 + 0.5;

const drawGrid = () => {
	clear();

	const s = 15 + Math.floor(8 * Math.sin(age * 0.0001));
	ctx.fillStyle =
		'#' +
		decToTwoDigitHex(s + 44 * si(age * 0.0003 + 142)) +
		decToTwoDigitHex(s + 44 * si(age * 0.00034 + 645)) +
		decToTwoDigitHex(s + 44 * si(age * 0.00042 + 421));

	grid.forEach((row, i) => {
		row.forEach((cell, j) => {
			const padx = padding - ripple[i][j] * 10;

			const t1 = (Math.sin((age * 2) ** 1.01 * 0.0025 + (i + j) * 0.5) + 1) / 2;
			const t2 =
				(Math.sin((age * 2) ** 1.01 * 0.002 + 10 * (i + j) * 0.5) + 1) / 2;
			padding = 10 + 5 * t1;
			margins = 100 + 5 * t2;
			cellSize = (gridSize - margins * 2) / dimensions;

			ctx.fillRect(
				i * cellSize + margins + width / 2 - gridSize / 2 + padx / 2,
				j * cellSize + margins + height / 2 - gridSize / 2 + padx / 2,
				cellSize - padx,
				cellSize - padx
			);
		});
	});
};

const decToTwoDigitHex = (dec) => {
	const hex = Math.round(dec).toString(16);
	return hex.length === 1 ? '0' + hex : hex;
};

const drawSnake = () => {
	ctx.shadowBlur = 40;
	ctx.shadowColor = '#fff';
	snake.forEach((cell, i) => {
		const opacityhex = 128 + Math.floor(127 * (1 - i / snake.length));
		ctx.fillStyle = '#ffffff' + decToTwoDigitHex(opacityhex);
		const { x, y } = cell;
		ctx.fillRect(
			x * cellSize + margins + width / 2 - gridSize / 2 + padding / 2,
			y * cellSize + margins + height / 2 - gridSize / 2 + padding / 2,
			cellSize - padding,
			cellSize - padding
		);
	});

	// draw image on head with respect to cellsize
	const head = snake[0];
	const img = new Image();
	img.src = score < 420 ? 'hary.png' : 'hary-2.png';
	ctx.drawImage(
		img,
		head.x * cellSize + margins + width / 2 - gridSize / 2 + (padding * -2) / 2,
		head.y * cellSize +
			margins +
			height / 2 -
			gridSize / 2 +
			(padding * -2) / 2,
		cellSize - padding * -2,
		cellSize - padding * -2
	);
};

const drawFood = () => {
	ctx.shadowBlur = 40;
	ctx.shadowColor = '#fa6';
	ctx.fillStyle = '#fa6';

	food.forEach((cell) => {
		const { x, y } = cell;
		const rndId = ((x ** 2 + y ** 3 + 15) % 5) + 1;
		const img = new Image();
		img.src = `item-0${rndId}.png`;
		ctx.fillRect(
			x * cellSize + margins + width / 2 - gridSize / 2 + padding / 2,
			y * cellSize + margins + height / 2 - gridSize / 2 + padding / 2,
			cellSize - padding,
			cellSize - padding
		);
		ctx.drawImage(
			img,
			x * cellSize + margins + width / 2 - gridSize / 2 + (padding * -4) / 2,
			y * cellSize + margins + height / 2 - gridSize / 2 + (padding * -4) / 2,
			cellSize - padding * -4,
			cellSize - padding * -4
		);
	});
};

let lastmove = [0, 0];
const moveSnake = () => {
	const head = snake[0];
	const newHead = {
		x: head.x + snakeDirection[0],
		y: head.y + snakeDirection[1]
	};
	lastmove = snakeDirection;

	snake.unshift(newHead);
	snake.pop();

	const isEatingItself = snake.some(
		(s, i) => i !== 0 && s.x === newHead.x && s.y === newHead.y
	);
	const isOutOfBounds =
		newHead.x < 0 ||
		newHead.x >= dimensions ||
		newHead.y < 0 ||
		newHead.y >= dimensions;

	if (food.some((f) => f.x === newHead.x && f.y === newHead.y)) {
		makeFood();
		food = food.filter((f) => f.x !== newHead.x || f.y !== newHead.y);
		snake.push(snake[snake.length - 1]);
		waitTime = Math.max(waitTime - waitTimeDecrement, minWaitTime);

		score += Math.round(1000 / waitTime) * 10;
		drawScore();
	}

	if (isEatingItself || isOutOfBounds) {
		snake = [
			{
				x: Math.round(dimensions / 2),
				y: Math.round(dimensions / 2)
			}
		];
		food = [];
		makeFood();
		makeFood();
		makeFood();

		waitTime = 300;
		snakeDirection = [0, -1];
	}
};

const exciteRipple = (position) => {
	const { x, y } = position;
	ripple[x][y] = 1;
};
exciteRipple({ x: 10, y: 10 });

// make excitations spread and whole ripple grid decay to 0
const updateRipple = (dt) => {
	// blur ripple
	ripple.forEach((row, i) => {
		row.forEach((cell, j) => {
			const neighbors = [
				{ x: i - 1, y: j },
				{ x: i + 1, y: j },
				{ x: i, y: j - 1 },
				{ x: i, y: j + 1 }
			];
			const sum = neighbors.reduce((acc, n) => {
				if (n.x < 0 || n.x >= dimensions || n.y < 0 || n.y >= dimensions)
					return acc;
				return acc + ripple[n.x][n.y];
			}, 0);

			ripple[i][j] = Math.min(1, sum / 4);
		});
	});

	// decay ripple grid
	ripple.forEach((row, i) => {
		row.forEach((cell, j) => {
			ripple[i][j] = Math.max(0, cell - dt / 1000);
		});
	});
};

let age = 0;
let lastTime = Date.now();
let timer = 0;
let waitTime = 300;
const minWaitTime = 100;
const waitTimeDecrement = 10;

const handleTimer = (dt) => {
	timer += dt;
	age += dt;
	if (timer >= waitTime) {
		timer -= waitTime;
		moveSnake();
	}
};

const updateGraphics = (dt) => {
	const t1 = (Math.sin(age ** 1.01 * 0.0025) + 1) / 2;
	const t2 = (Math.sin(age ** 1.01 * 0.002) + 1) / 2;
	padding = 10 + 5 * t1;
	margins = 10 + 5 * t2;
	cellSize = (gridSize - margins * 2) / dimensions;

	updateRipple(dt);
};

const loop = () => {
	const delta = Date.now() - lastTime;
	lastTime = Date.now();

	handleTimer(delta);
	updateGraphics(delta);

	drawGrid();
	drawFood();
	drawSnake();

	requestAnimationFrame(loop);
};

const init = () => {
	makeFood();
	makeFood();
	makeFood();
};

window.addEventListener('keydown', (e) => {
	switch (e.key) {
		case 'w':
			if (lastmove[1] === 1) return;
			snakeDirection = [0, -1];
			moveSnake();
			timer = 0;

			break;
		case 'ArrowUp':
			if (lastmove[1] === 1) return;
			snakeDirection = [0, -1];
			moveSnake();
			timer = 0;

			break;
		case 's':
			if (lastmove[1] === -1) return;
			snakeDirection = [0, 1];
			moveSnake();
			timer = 0;

			break;
		case 'ArrowDown':
			if (lastmove[1] === -1) return;
			snakeDirection = [0, 1];
			moveSnake();
			timer = 0;

			break;
		case 'a':
			if (lastmove[0] === 1) return;
			snakeDirection = [-1, 0];
			moveSnake();
			timer = 0;

			break;
		case 'ArrowLeft':
			if (lastmove[0] === 1) return;
			snakeDirection = [-1, 0];
			moveSnake();
			timer = 0;

			break;
		case 'd':
			if (lastmove[0] === -1) return;
			snakeDirection = [1, 0];
			moveSnake();
			timer = 0;

			break;
		case 'ArrowRight':
			if (lastmove[0] === -1) return;
			snakeDirection = [1, 0];
			moveSnake();
			timer = 0;

			break;
		default:
			break;
	}
});

init();
loop();

const updateDimensions = () => {
	width = window.innerWidth;
	height = window.innerHeight;

	canvas.width = width;
	canvas.height = height;
};

window.addEventListener('resize', updateDimensions);
