import Phaser from 'phaser';

export default class SnakeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SnakeScene' });
        this.CELL_SIZE = 20;
    }

    create() {
        const { width, height } = this.scale;
        
        this.cameras.main.setBackgroundColor('#1e272e');

        // Draw grid
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x485460, 0.3);
        for (let i = 0; i <= width; i += this.CELL_SIZE) {
            graphics.moveTo(i, 0); graphics.lineTo(i, height);
        }
        for (let i = 0; i <= height; i += this.CELL_SIZE) {
            graphics.moveTo(0, i); graphics.lineTo(width, i);
        }
        graphics.strokePath();

        this.snake = [];
        // Head
        this.snake.push({ x: 10, y: 10 });
        // Initial tail
        this.snake.push({ x: 9, y: 10 });
        this.snake.push({ x: 8, y: 10 });

        this.direction = Phaser.Math.Vector2.RIGHT;
        this.nextDirection = Phaser.Math.Vector2.RIGHT;

        this.apple = { x: 15, y: 10 };
        this.placeApple();

        this.score = 0;
        this.scoreText = this.add.text(10, 10, '0', { fontSize: '32px', fill: '#0fb9b1', fontFamily: 'monospace' });
        this.scoreText.setDepth(10);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.moveTimer = 0;
        this.moveInterval = 120; // ms per move
        
        this.gameOver = false;
        
        // Emitter for eating apple
        this.emitter = this.add.particles(0, 0, 'flares', {
            speed: 100,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            emitting: false
        });
    }

    placeApple() {
        const cols = this.scale.width / this.CELL_SIZE;
        const rows = this.scale.height / this.CELL_SIZE;
        
        let valid = false;
        while (!valid) {
            this.apple.x = Phaser.Math.Between(0, cols - 1);
            this.apple.y = Phaser.Math.Between(0, rows - 1);
            valid = !this.snake.some(segment => segment.x === this.apple.x && segment.y === this.apple.y);
        }
    }

    update(time, delta) {
        if (this.gameOver) return;

        // Input
        if (this.cursors.left.isDown && this.direction.x === 0) {
            this.nextDirection = Phaser.Math.Vector2.LEFT;
        } else if (this.cursors.right.isDown && this.direction.x === 0) {
            this.nextDirection = Phaser.Math.Vector2.RIGHT;
        } else if (this.cursors.up.isDown && this.direction.y === 0) {
            this.nextDirection = Phaser.Math.Vector2.UP;
        } else if (this.cursors.down.isDown && this.direction.y === 0) {
            this.nextDirection = Phaser.Math.Vector2.DOWN;
        }

        this.moveTimer += delta;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.moveSnake();
        }

        this.draw();
    }

    moveSnake() {
        this.direction = this.nextDirection;

        const head = this.snake[0];
        const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };

        const cols = this.scale.width / this.CELL_SIZE;
        const rows = this.scale.height / this.CELL_SIZE;

        // Wall collision
        if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
            this.triggerGameOver();
            return;
        }

        // Self collision
        if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.triggerGameOver();
            return;
        }

        this.snake.unshift(newHead);

        // Apple collision
        if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
            this.score += 10;
            this.scoreText.setText(this.score);
            this.events.emit('score-changed', this.score);
            this.placeApple();
            this.createExplosion(this.apple.x * this.CELL_SIZE + this.CELL_SIZE/2, this.apple.y * this.CELL_SIZE + this.CELL_SIZE/2);
            // Speed up slightly
            this.moveInterval = Math.max(50, this.moveInterval - 2);
        } else {
            this.snake.pop();
        }
    }

    triggerGameOver() {
        this.gameOver = true;
        this.cameras.main.shake(300, 0.01);
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.5);
        overlay.setDepth(20);
        
        this.add.text(width / 2, height / 2 - 20, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: 'system-ui, sans-serif',
            fill: '#ff3f34',
            fontStyle: '900'
        }).setOrigin(0.5).setDepth(21);
        
        this.add.text(width / 2, height / 2 + 30, 'Use restart button to try again', {
            fontSize: '20px',
            fontFamily: 'system-ui, sans-serif',
            fill: '#d2dae2'
        }).setOrigin(0.5).setDepth(21);
    }

    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            let p = this.add.rectangle(x, y, 6, 6, 0x0fb9b1);
            this.tweens.add({
                targets: p,
                x: x + (Math.random() - 0.5) * 100,
                y: y + (Math.random() - 0.5) * 100,
                alpha: 0,
                scale: 0,
                duration: 400 + Math.random() * 200,
                onComplete: () => p.destroy()
            });
        }
    }

    draw() {
        // We could use GameObjects instead of drawing every frame, 
        // but graphics is simple and efficient for Snake
        if (!this.drawGraphics) {
            this.drawGraphics = this.add.graphics();
        }
        
        this.drawGraphics.clear();

        // Draw Apple
        this.drawGraphics.fillStyle(0xff3f34, 1);
        this.drawGraphics.fillRoundedRect(
            this.apple.x * this.CELL_SIZE + 2, 
            this.apple.y * this.CELL_SIZE + 2, 
            this.CELL_SIZE - 4, 
            this.CELL_SIZE - 4, 
            4
        );
        // Apple Glow
        this.drawGraphics.lineStyle(2, 0xff3f34, 0.5);
        this.drawGraphics.strokeRoundedRect(
            this.apple.x * this.CELL_SIZE, 
            this.apple.y * this.CELL_SIZE, 
            this.CELL_SIZE, 
            this.CELL_SIZE, 
            4
        );

        // Draw Snake
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const color = i === 0 ? 0x0fb9b1 : 0x0abde3; // Head is slightly different color
            
            this.drawGraphics.fillStyle(color, 1);
            this.drawGraphics.fillRoundedRect(
                segment.x * this.CELL_SIZE + 1, 
                segment.y * this.CELL_SIZE + 1, 
                this.CELL_SIZE - 2, 
                this.CELL_SIZE - 2, 
                4
            );
        }
    }
}
