document.addEventListener('DOMContentLoaded', () => {
    const playButtons = document.querySelectorAll('.play-btn');
    const modal = document.getElementById('game-modal');
    const modalContent = document.querySelector('.modal-content');
    const closeBtn = document.querySelector('.close-btn');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const clickSound = document.getElementById('click-sound');
    let gameInterval = null;
    let keyHandler = null;

    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const game = button.parentElement.dataset.game;
            modal.style.display = 'block';
            clickSound.play();
            loadGame(game);
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        if (keyHandler) {
            document.removeEventListener('keydown', keyHandler);
            keyHandler = null;
        }
    });

    function loadGame(game) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';

        switch (game) {
            case 'tetris':
                startTetrisGame();
                break;
            case 'snake':
                startSnakeGame();
                break;
            case 'pacman':
                startPacManGame();
                break;
            default:
                ctx.fillText('Select a Game!', canvas.width / 2, canvas.height / 2);
        }
    }

    function startTetrisGame() {
        const gridWidth = 10;
        const gridHeight = 20;
        const blockSize = 20;
        canvas.width = gridWidth * blockSize;
        canvas.height = gridHeight * blockSize;

        let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
        let currentPiece = createPiece();
        let position = { x: Math.floor(gridWidth / 2) - 1, y: 0 };
        let speed = 500;

        function createPiece() {
            const pieces = [
                [[1, 1, 1, 1]], // I
                [[1, 1], [1, 1]], // O
                [[1, 1, 1], [0, 1, 0]], // T
                [[1, 1, 1], [1, 0, 0]], // L
                [[1, 1, 1], [0, 0, 1]] // J
            ];
            return pieces[Math.floor(Math.random() * pieces.length)];
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#333';
            grid.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        ctx.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);
                    }
                });
            });
            ctx.fillStyle = '#6200ea';
            currentPiece.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        ctx.fillRect((position.x + dx) * blockSize, (position.y + dy) * blockSize, blockSize - 1, blockSize - 1);
                    }
                });
            });
        }

        function movePiece() {
            position.y++;
            if (collision()) {
                position.y--;
                mergePiece();
                currentPiece = createPiece();
                position = { x: Math.floor(gridWidth / 2) - 1, y: 0 };
                if (collision()) {
                    ctx.fillStyle = '#fff';
                    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
                    clearInterval(gameInterval);
                    gameInterval = null;
                    return;
                }
            }
            draw();
        }

        function collision() {
            for (let dy = 0; dy < currentPiece.length; dy++) {
                for (let dx = 0; dx < currentPiece[dy].length; dx++) {
                    if (currentPiece[dy][dx]) {
                        let newX = position.x + dx;
                        let newY = position.y + dy;
                        if (newX < 0 || newX >= gridWidth || newY >= gridHeight || (newY >= 0 && grid[newY] && grid[newY][newX])) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function mergePiece() {
            currentPiece.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        grid[position.y + dy][position.x + dx] = 1;
                    }
                });
            });
        }

        keyHandler = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    position.x--;
                    if (collision()) position.x++;
                    break;
                case 'ArrowRight':
                    position.x++;
                    if (collision()) position.x--;
                    break;
                case 'ArrowDown':
                    movePiece();
                    break;
            }
            draw();
        };
        document.addEventListener('keydown', keyHandler);

        if (gameInterval) clearInterval(gameInterval);
        draw();
        gameInterval = setInterval(movePiece, speed);
    }

    function startSnakeGame() {
        canvas.width = 800;
        canvas.height = 400;
        let snake = [{ x: 10, y: 10 }];
        let direction = { x: 1, y: 0 };
        let food = { x: 15, y: 15 };
        let speed = 100;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4caf50';
            snake.forEach(segment => {
                ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
            });
            ctx.fillStyle = '#f44336';
            ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
        }

        function update() {
            const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
            
            if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                ctx.fillStyle = '#fff';
                ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
                clearInterval(gameInterval);
                gameInterval = null;
                return;
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                food = { x: Math.floor(Math.random() * 40), y: Math.floor(Math.random() * 20) };
            } else {
                snake.pop();
            }

            if (head.x < 0 || head.x >= 40 || head.y < 0 || head.y >= 20) {
                ctx.fillStyle = '#fff';
                ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
                clearInterval(gameInterval);
                gameInterval = null;
                return;
            }

            draw();
        }

        keyHandler = (e) => {
            switch (e.key) {
                case 'ArrowUp': if (direction.y !== 1) direction = { x: 0, y: -1 }; break;
                case 'ArrowDown': if (direction.y !== -1) direction = { x: 0, y: 1 }; break;
                case 'ArrowLeft': if (direction.x !== 1) direction = { x: -1, y: 0 }; break;
                case 'ArrowRight': if (direction.x !== -1) direction = { x: 1, y: 0 }; break;
            }
        };
        document.addEventListener('keydown', keyHandler);

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(update, speed);
    }

    function startPacManGame() {
        canvas.width = 560; // 28 tiles * 20px
        canvas.height = 620; // 31 tiles * 20px
        const tileSize = 20;
        const gridWidth = 28;
        const gridHeight = 31;

        // 0: empty, 1: wall, 2: dot
        const maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,1,0,0,1,2,1,0,0,0,1,2,1,1,2,1,0,0,0,1,2,1,0,0,1,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
            [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
            [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
            [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1],
            [0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0],
            [0,0,0,0,0,1,2,1,1,2,0,0,0,0,0,0,0,0,2,1,1,2,1,0,0,0,0,0],
            [0,0,0,0,0,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,0,0,0,0,0],
            [1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        let pacman = { x: 14, y: 23 }; // Starting position
        let direction = { x: 0, y: 0 }; // Initial direction
        let speed = 100;
        let score = 0;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw maze
            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    if (maze[y][x] === 1) {
                        ctx.fillStyle = '#0000FF'; // Walls
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    } else if (maze[y][x] === 2) {
                        ctx.fillStyle = '#FFFFFF'; // Dots
                        ctx.beginPath();
                        ctx.arc(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // Draw Pac-Man
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(pacman.x * tileSize + tileSize / 2, pacman.y * tileSize + tileSize / 2, tileSize / 2, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.lineTo(pacman.x * tileSize + tileSize / 2, pacman.y * tileSize + tileSize / 2);
            ctx.fill();

            // Draw score
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${score}`, 10, 30);
        }

        function update() {
            const newX = pacman.x + direction.x;
            const newY = pacman.y + direction.y;

            // Check for walls
            if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight && maze[newY][newX] !== 1) {
                pacman.x = newX;
                pacman.y = newY;

                // Check for dots
                if (maze[pacman.y][pacman.x] === 2) {
                    maze[pacman.y][pacman.x] = 0; // Eat the dot
                    score += 10;
                }

                // Check for win condition (all dots eaten)
                let dotsLeft = 0;
                for (let y = 0; y < gridHeight; y++) {
                    for (let x = 0; x < gridWidth; x++) {
                        if (maze[y][x] === 2) dotsLeft++;
                    }
                }
                if (dotsLeft === 0) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.textAlign = 'center';
                    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
                    clearInterval(gameInterval);
                    gameInterval = null;
                    return;
                }
            }

            draw();
        }

        keyHandler = (e) => {
            switch (e.key) {
                case 'ArrowUp': direction = { x: 0, y: -1 }; break;
                case 'ArrowDown': direction = { x: 0, y: 1 }; break;
                case 'ArrowLeft': direction = { x: -1, y: 0 }; break;
                case 'ArrowRight': direction = { x: 1, y: 0 }; break;
            }
        };
        document.addEventListener('keydown', keyHandler);

        if (gameInterval) clearInterval(gameInterval);
        draw();
        gameInterval = setInterval(update, speed);
    }
});