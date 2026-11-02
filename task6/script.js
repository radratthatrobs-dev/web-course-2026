class SnakeModel {
    constructor(tileCount = 20) {
        this.tileCount = tileCount; // Разметка сетки 20x20
        this.gridSize = 400 / tileCount; // Размер клетки: 20px
        this.reset();
    }

    reset() {
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.apple = this.spawnApple();
        this.score = 0;
        this.isGameOver = false;
        this.isStarted = false;
        this.moveInterval = 150; // Время в мс на один шаг змейки (фиксированная скорость)
        this.lastMoveTime = 0;
    }

    setDirection(newDir) {
        // Игнорируем разворот на 180 градусов
        if (newDir.x !== -this.direction.x || newDir.y !== -this.direction.y) {
            this.nextDirection = newDir;
        }
    }

    update(currentTime) {
        if (!this.isStarted || this.isGameOver) return;

        if (!this.lastMoveTime) this.lastMoveTime = currentTime;
        const elapsed = currentTime - this.lastMoveTime;

        // Движение фиксировано по времени (не зависит от герцовки экрана / fps)
        if (elapsed >= this.moveInterval) {
            this.lastMoveTime = currentTime - (elapsed % this.moveInterval);
            this.moveSnake();
        }
    }

    moveSnake() {
        this.direction = this.nextDirection;
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Столкновение со стенами
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.isGameOver = true;
            return;
        }

        // Столкновение с хвостом
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.isGameOver = true;
            return;
        }

        this.snake.unshift(head);

        // Поедание яблока
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score += 10;
            this.apple = this.spawnApple();
        } else {
            this.snake.pop(); // Если не съели — убираем кончик хвоста
        }
    }

    spawnApple() {
        let newApple;
        while (true) {
            newApple = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            const isOnSnake = this.snake.some(segment => segment.x === newApple.x && segment.y === newApple.y);
            if (!isOnSnake) break;
        }
        return newApple;
    }
}

class SnakeView {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
    }

    render(model) {
        this.clearCanvas();
        this.drawApple(model.apple, model.gridSize);
        this.drawSnake(model.snake, model.gridSize);
        this.scoreElement.textContent = model.score;

        if (model.isGameOver) {
            this.finalScoreElement.textContent = model.score;
            this.gameOverScreen.classList.remove('hidden');
            this.startBtn.style.display = 'none';
        } else {
            this.gameOverScreen.classList.add('hidden');
            this.startBtn.style.display = model.isStarted ? 'none' : 'inline-block';
        }
    }

    clearCanvas() {
        this.ctx.fillStyle = '#141414';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawSnake(snake, gridSize) {
        snake.forEach((segment, index) => {
            // Голова ярче туловища
            this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#81C784';
            this.ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
    }

    drawApple(apple, gridSize) {
        this.ctx.fillStyle = '#ef5350';
        this.ctx.beginPath();
        const x = apple.x * gridSize + gridSize / 2;
        const y = apple.y * gridSize + gridSize / 2;
        this.ctx.arc(x, y, gridSize / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

class SnakeController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.animationFrameId = null;

        this.initListeners();
        this.view.render(this.model);
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            if (!this.model.isStarted || this.model.isGameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.model.setDirection({ x: 0, y: -1 });
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.model.setDirection({ x: 0, y: 1 });
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.model.setDirection({ x: -1, y: 0 });
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.model.setDirection({ x: 1, y: 0 });
                    e.preventDefault();
                    break;
            }
        });

        this.view.startBtn.addEventListener('click', () => this.startGame());
        this.view.restartBtn.addEventListener('click', () => this.startGame());
    }

    startGame() {
        this.model.reset();
        this.model.isStarted = true;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        const gameLoop = (currentTime) => {
            this.model.update(currentTime);
            this.view.render(this.model);

            if (!this.model.isGameOver) {
                this.animationFrameId = requestAnimationFrame(gameLoop);
            }
        };

        this.animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// Запуск приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    const model = new SnakeModel();
    const view = new SnakeView();
    const controller = new SnakeController(model, view);
});