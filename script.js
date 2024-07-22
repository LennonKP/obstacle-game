const startButton = document.getElementById("startButton") 

class Game {
    constructor() {
        startButton.style.display = "none"
        this.grid = document.getElementById('grid');
        this.grid.style.display = "grid"
        this.gameAudio = new Audio("./audio-jogo.mp3")
        this.fimAudio = new Audio("./fim.mp3")
        this.character = new Character();
        this.level = 1
        this.grid.appendChild(this.character.element);
        this.scoreElement = document.getElementById('score');
        this.maxScoreElement = document.getElementById('maxScore');
        if (localStorage.getItem("maxScore") == 'undefined' || !localStorage.getItem("maxScore")) {
            localStorage.setItem("maxScore", 0)
        }
        
        this.initialize();
    }

    initialize(isRestarting = false) {
        if (isRestarting) {
            this.removeObstacles();
            const restartButton = document.getElementById("restartButton")
            restartButton.remove()
        }
        if (parseInt(localStorage.getItem("maxScore")) < this.score) {
            localStorage.setItem("maxScore", this.score)
        }
        this.score = 0;
        this.maxScoreElement.innerText = `Max score: ${localStorage.getItem("maxScore")}`
        this.addEventListeners();
        this.startGameLoop();
    }

    startGameLoop() {
        this.audioLoop = setInterval(() => this.gameAudio.play(), 10)
        this.gameInterval = setInterval(() => this.updateGame(), 10);
        this.objectSpawnInterval = setInterval(() => this.spawnObstacle(), 1000);
    }

    stopGameLoop() {
        this.gameAudio.pause()
        clearInterval(this.audioLoop)
        this.fimAudio.play()
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
        if (this.score % 500 == 0) {
            this.level++
            console.log(this.level)
        }
    }

    gameOver() {
        this.stopGameLoop();
        this.removeEventListeners();
        const obstacles = document.getElementsByClassName('obstacle');
        for (let obstacle of obstacles) {
            obstacle.style.animationPlayState = 'paused';
        }

        const restartButton = document.createElement("button")
        restartButton.innerText = "Restart..."
        restartButton.id = "restartButton"
        restartButton.onclick = () => this.initialize(true)
        this.grid.appendChild(restartButton)
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
            const obstacle = new Obstacle(lane, this.level)
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
    constructor(lane, level) {
        this.element = document.createElement('div');
        this.element.classList.add('obstacle');
        let seconds = 2 - (level * 0.1)
        if (seconds <= 0.5) {
            seconds = 0.5
        }

        this.element.style.animation = `moveObstacle ${seconds}s linear`;
        this.element.style.gridColumn = lane;
        this.element.style.gridRow = 1;
        this.element.addEventListener('animationend', () => this.element.remove());
    }
}


startButton.addEventListener("click", () => {
    const scoreElement = document.createElement('div');
    scoreElement.id = 'score';
    scoreElement.style.position = 'absolute';
    scoreElement.style.top = '10px';
    scoreElement.style.left = '10px';
    document.body.appendChild(scoreElement);
    const maxScoreElement = document.createElement('div');
    maxScoreElement.id = 'maxScore';
    maxScoreElement.style.position = 'absolute';
    maxScoreElement.style.top = '25px';
    maxScoreElement.style.left = '10px';
    document.body.appendChild(maxScoreElement);

    new Game();
});

