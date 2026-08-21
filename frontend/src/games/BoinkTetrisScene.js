import Phaser from 'phaser';

export default class BoinkTetrisScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BoinkTetrisScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#1e272e');

        this.cols = 10;
        this.rows = 20;
        this.blockSize = 24;
        
        this.gridX = (width - (this.cols * this.blockSize)) / 2;
        this.gridY = (height - (this.rows * this.blockSize)) / 2;

        // Draw grid background
        this.add.rectangle(width/2, height/2, this.cols * this.blockSize, this.rows * this.blockSize, 0x000000).setAlpha(0.5);

        this.grid = Array(this.rows).fill(0).map(() => Array(this.cols).fill(0));
        
        // Tetromino definitions
        this.shapes = [
            { shape: [[1,1,1,1]], color: 0x00ffff }, // I
            { shape: [[1,1], [1,1]], color: 0xffff00 }, // O
            { shape: [[0,1,0], [1,1,1]], color: 0x800080 }, // T
            { shape: [[0,1,1], [1,1,0]], color: 0x00ff00 }, // S
            { shape: [[1,1,0], [0,1,1]], color: 0xff0000 }, // Z
            { shape: [[1,0,0], [1,1,1]], color: 0x0000ff }, // J
            { shape: [[0,0,1], [1,1,1]], color: 0xffa500 }  // L
        ];

        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        
        this.score = 0;
        this.isGameOver = false;
        
        this.dropTimer = 0;
        this.dropInterval = 800; // ms

        // Render group
        this.blocks = this.add.group();

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Prevent rapid holding
        this.inputTimer = 0;

        // UI
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', { 
            fontSize: '32px', 
            fill: '#ffffff', 
            fontFamily: 'monospace',
            fontStyle: 'bold' 
        });

        this.spawnPiece();
    }

    spawnPiece() {
        let type = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        this.currentPiece = {
            shape: type.shape,
            color: type.color
        };
        this.currentX = Math.floor(this.cols / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentY = 0;

        if (this.checkCollision(this.currentX, this.currentY, this.currentPiece.shape)) {
            this.isGameOver = true;
            this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
                fontSize: '64px',
                fill: '#ff0000',
                fontFamily: 'monospace',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(20);
        }
    }

    checkCollision(nx, ny, shape) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    let gx = nx + x;
                    let gy = ny + y;
                    
                    if (gx < 0 || gx >= this.cols || gy >= this.rows) return true;
                    if (gy >= 0 && this.grid[gy][gx] !== 0) return true;
                }
            }
        }
        return false;
    }

    rotatePiece() {
        let oldShape = this.currentPiece.shape;
        let newShape = [];
        for (let x = 0; x < oldShape[0].length; x++) {
            newShape[x] = [];
            for (let y = 0; y < oldShape.length; y++) {
                newShape[x][y] = oldShape[oldShape.length - 1 - y][x];
            }
        }
        
        if (!this.checkCollision(this.currentX, this.currentY, newShape)) {
            this.currentPiece.shape = newShape;
        }
    }

    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    if (this.currentY + y < 0) continue;
                    this.grid[this.currentY + y][this.currentX + x] = this.currentPiece.color;
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            let full = true;
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 0) full = false;
            }
            
            if (full) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // Check same row again
            }
        }
        
        if (linesCleared > 0) {
            this.score += linesCleared * 100;
            this.scoreText.setText('SCORE: ' + this.score);
            this.events.emit('score-changed', this.score);
            this.dropInterval = Math.max(200, 800 - (this.score / 10));
        }
    }

    draw() {
        this.blocks.clear(true, true);
        
        // Draw grid
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] !== 0) {
                    let b = this.add.rectangle(
                        this.gridX + x * this.blockSize + this.blockSize/2,
                        this.gridY + y * this.blockSize + this.blockSize/2,
                        this.blockSize - 2,
                        this.blockSize - 2,
                        this.grid[y][x]
                    );
                    this.blocks.add(b);
                }
            }
        }
        
        // Draw current
        if (this.currentPiece && !this.isGameOver) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        let b = this.add.rectangle(
                            this.gridX + (this.currentX + x) * this.blockSize + this.blockSize/2,
                            this.gridY + (this.currentY + y) * this.blockSize + this.blockSize/2,
                            this.blockSize - 2,
                            this.blockSize - 2,
                            this.currentPiece.color
                        );
                        this.blocks.add(b);
                    }
                }
            }
        }
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Input
        if (time > this.inputTimer) {
            if (this.cursors.left.isDown) {
                if (!this.checkCollision(this.currentX - 1, this.currentY, this.currentPiece.shape)) {
                    this.currentX--;
                    this.inputTimer = time + 150;
                }
            } else if (this.cursors.right.isDown) {
                if (!this.checkCollision(this.currentX + 1, this.currentY, this.currentPiece.shape)) {
                    this.currentX++;
                    this.inputTimer = time + 150;
                }
            } else if (this.cursors.up.isDown) {
                this.rotatePiece();
                this.inputTimer = time + 250;
            } else if (this.cursors.down.isDown) {
                if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece.shape)) {
                    this.currentY++;
                    this.inputTimer = time + 50;
                } else {
                    this.lockPiece();
                    this.inputTimer = time + 200;
                }
            }
        }

        // Gravity
        this.dropTimer += delta;
        if (this.dropTimer > this.dropInterval) {
            this.dropTimer = 0;
            if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece.shape)) {
                this.currentY++;
            } else {
                this.lockPiece();
            }
        }

        this.draw();
    }
}
