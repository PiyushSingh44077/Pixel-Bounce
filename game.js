const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const squareImage = new Image();
squareImage.src = 'square.png';

const square = {
    x: 50,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    dy: 0,
    gravity: 0.5,
    jumpStrength: -12,
    isJumping: false
};

const obstacles = [];
const obstacleMinWidth = 20;
const obstacleMaxWidth = 40;
const obstacleMinHeight = 40;
const obstacleMaxHeight = 100;
const obstacleMinGap = square.width * 2; // Ensure minimum gap is two times the square's width
const obstacleMaxGap = 500;
let lastObstacleX = canvas.width;
let gameOver = false;
let score = 0;
let playerName = '';

const highScoresKey = 'highScores';
const maxHighScores = 3;

function drawSquare() {
    ctx.drawImage(squareImage, square.x, square.y, square.width, square.height);
}

function drawObstacles() {
    ctx.fillStyle = '#ff00a5';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateSquare() {
    square.y += square.dy;
    square.dy += square.gravity;

    if (square.y > canvas.height - square.height) {
        square.y = canvas.height - square.height;
        square.dy = 0;
        square.isJumping = false;
    }
}

function updateObstacles() {
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - obstacleMinGap) {
        const obstacleWidth = obstacleMinWidth + Math.random() * (obstacleMaxWidth - obstacleMinWidth);
        const obstacleHeight = obstacleMinHeight + Math.random() * (obstacleMaxHeight - obstacleMinHeight);
        const gap = obstacleMinGap + Math.random() * (obstacleMaxGap - obstacleMinGap);
        obstacles.push({
            x: canvas.width + gap,
            y: canvas.height - obstacleHeight,
            width: obstacleWidth,
            height: obstacleHeight
        });
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 5;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }
    });
}

function checkCollision() {
    obstacles.forEach(obstacle => {
        if (
            square.x < obstacle.x + obstacle.width &&
            square.x + square.width > obstacle.x &&
            square.y < obstacle.y + obstacle.height &&
            square.y + square.height > obstacle.y
        ) {
            gameOver = true;
        }
    });
}

function drawGameOver() {
    ctx.font = '30px CustomFont';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    document.getElementById('replayButton').style.display = 'block';
    saveHighScore(score, playerName);
    displayHighScores();
}

function resetGame() {
    square.y = canvas.height - 60;
    square.dy = 0;
    square.isJumping = false;
    obstacles.length = 0;
    lastObstacleX = canvas.width;
    gameOver = false;
    score = 0;
    document.getElementById('replayButton').style.display = 'none';
    gameLoop();
}

function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSquare();
    drawObstacles();
    updateSquare();
    updateObstacles();
    checkCollision();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    playerName = document.getElementById('playerName').value;
    if (playerName.trim() === '') {
        alert('Please enter your name to start the game');
        return;
    }
    document.getElementById('playerName').style.display = 'none';
    document.getElementById('startButton').style.display = 'none';
    resetGame();
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !square.isJumping) {
        square.dy = square.jumpStrength;
        square.isJumping = true;
    }
});

squareImage.onload = function() {
    displayHighScores();
};

function saveHighScore(score, name) {
    const highScores = JSON.parse(localStorage.getItem(highScoresKey)) || [];
    highScores.push({ score, name });
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > maxHighScores) {
        highScores.pop();
    }
    localStorage.setItem(highScoresKey, JSON.stringify(highScores));
}

function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem(highScoresKey)) || [];
    const highScoresDiv = document.getElementById('highScores');
    highScoresDiv.innerHTML = '<h2>High Scores</h2>';
    highScores.forEach((scoreEntry, index) => {
        highScoresDiv.innerHTML += `<p>${index + 1}. ${scoreEntry.name} - ${scoreEntry.score}</p>`;
    });
}
