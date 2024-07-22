class Game {
    ACCELERATION = 0.01
    constructor() {
        this.grid = document.getElementById('grid');
        this.character = new Character();
        this.grid.appendChild(this.character.element);
        this.scoreElement = document.getElementById('score');
        this.maxScoreElement = document.getElementById('maxScore');
        if (localStorage.getItem("maxScore") == 'undefined') {
            localStorage.setItem("maxScore", 0)
        }
        this.initialize();
    }

    initialize(isRestarting = false) {
        if (isRestarting) {
            this.removeObstacles();
        }
        this.score = 0;
        this.addEventListeners();
        this.startGameLoop();
    }

    startGameLoop() {
        this.gameInterval = setInterval(() => this.updateGame(), 10);
        this.objectSpawnInterval = setInterval(() => this.spawnObstacle(), 1000);
    }

    stopGameLoop() {
        clearInterval(this.gameInterval);
        clearInterval(this.objectSpawnInterval);
    }

    addEventListeners() {
        this.keydownHandler = (event) => this.handleKeydown(event);
        document.addEventListener('keydown', this.keydownHandler);
    }

    removeEventListeners() {
        document.removeEventListener('keydown', this.keydownHandler);
    }

    removeObstacles() {
        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obstacle => obstacle.remove());
    }

    checkCollisions() {
        const obstacles = document.getElementsByClassName('obstacle');
        for (let obstacle of obstacles) {
            const obstacleRect = obstacle.getBoundingClientRect();
            const characterRect = this.character.element.getBoundingClientRect();

            if (
                this.character.currentLane === parseInt(obstacle.style.gridColumn) &&
                obstacleRect.top < characterRect.bottom &&
                obstacleRect.bottom > characterRect.top
            ) {
                this.gameOver();
                break;
            }
        }
    }

    updateGame() {
        this.checkCollisions();
        this.updateScore();
    }

    updateScore() {
        this.score += 1;
        this.scoreElement.innerText = `Score: ${this.score}`;
    }

    gameOver() {
        this.stopGameLoop();
        this.removeEventListeners();
        const obstacles = document.getElementsByClassName('obstacle');
        for (let obstacle of obstacles) {
            obstacle.style.animationPlayState = 'paused';
        }

        if (parseInt(localStorage.getItem("maxScore")) < this.score) {
            localStorage.setItem("maxScore", this.score)
        }
    }

    spawnObstacle() {
        const obstacleAmount = Math.floor((Math.random() * (2)) + 1)

        let lanesWithObstacles = new Set();
        for (let index = 0; index < obstacleAmount; index++) {
            let lane = Math.floor((Math.random() * (3)) + 1)
            while (lanesWithObstacles.has(lane)) {
                lane = Math.floor((Math.random() * (3)) + 1)
            }
            lanesWithObstacles.add(lane)
        }

        lanesWithObstacles.forEach((lane) => {
            const obstacle = new Obstacle(lane)
            this.grid.appendChild(obstacle.element)
        })
    }

    handleKeydown(event) {
        if (event.code === 'ArrowLeft' && this.character.currentLane > 1) {
            this.character.currentLane--;
            this.character.move();
        } else if (event.code === 'ArrowRight' && this.character.currentLane < 3) {
            this.character.currentLane++;
            this.character.move();
        }
    }
}

class Character {
    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('character');
        this.currentLane = 2;
        this.element.style.gridColumn = this.currentLane
    }

    move() {
        this.element.style.gridColumn = this.currentLane;
    }
}

class Obstacle {
    constructor(lane) {
        this.element = document.createElement('div');
        this.element.classList.add('obstacle');
        this.element.style.animation = `moveObstacle 2s linear`;
        this.element.style.gridColumn = lane;
        this.element.style.gridRow = 1;
        this.element.addEventListener('animationend', () => this.element.remove());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const scoreElement = document.createElement('div');
    scoreElement.id = 'score';
    scoreElement.style.position = 'absolute';
    scoreElement.style.top = '10px';
    scoreElement.style.left = '10px';
    document.body.appendChild(scoreElement);
    const maxScoreElement = document.createElement('div');
    maxScoreElement.id = 'maxScore';
    maxScoreElement.style.position = 'absolute';
    maxScoreElement.style.top = '20px';
    maxScoreElement.style.left = '10px';
    document.body.appendChild(maxScoreElement);

    new Game();
});
