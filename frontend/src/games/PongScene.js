import Phaser from 'phaser';

export default class PongScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PongScene' });
    }

    create() {
        const { width, height } = this.scale;
        
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Glow styling
        const glowOptions = {
            blur: 10,
            color: 0xe94560,
            quality: 1,
            distance: 0,
            innerStrength: 0,
            outerStrength: 2
        };

        // Middle line
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x0f3460, 0.5);
        graphics.beginPath();
        graphics.moveTo(width / 2, 0);
        graphics.lineTo(width / 2, height);
        graphics.strokePath();

        // Paddles
        this.paddle1 = this.add.rectangle(40, height / 2, 15, 100, 0xe94560);
        this.physics.add.existing(this.paddle1);
        this.paddle1.body.setImmovable(true);
        this.paddle1.body.setCollideWorldBounds(true);
        this.paddle1.postFX.addGlow(0xe94560, 4, 0, false, 0.1, 10);

        this.paddle2 = this.add.rectangle(width - 40, height / 2, 15, 100, 0x0f3460);
        this.physics.add.existing(this.paddle2);
        this.paddle2.body.setImmovable(true);
        this.paddle2.body.setCollideWorldBounds(true);
        this.paddle2.postFX.addGlow(0x0f3460, 4, 0, false, 0.1, 10);

        // Ball
        this.ball = this.add.circle(width / 2, height / 2, 10, 0xffffff);
        this.physics.add.existing(this.ball);
        this.ball.body.setBounce(1.05, 1.05); // Speed increases
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setMaxVelocity(800, 800);
        this.ball.postFX.addGlow(0xffffff, 4, 0, false, 0.1, 10);
        
        // Start ball
        this.resetBall();

        // Collisions
        this.physics.add.collider(this.ball, this.paddle1, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.paddle2, this.hitPaddle, null, this);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Scores
        this.score1 = 0;
        this.score2 = 0;
        this.scoreText1 = this.add.text(width / 4, 50, '0', { fontSize: '64px', fill: '#e94560', fontFamily: 'monospace' }).setOrigin(0.5);
        this.scoreText2 = this.add.text(width * 3/4, 50, '0', { fontSize: '64px', fill: '#0f3460', fontFamily: 'monospace' }).setOrigin(0.5);

        // Particles for explosion on goal
        this.emitter = this.add.particles(0, 0, 'flares', {
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            emitting: false
        });
    }

    hitPaddle(ball, paddle) {
        // Screen shake
        this.cameras.main.shake(100, 0.005);
        
        // Change ball vertical velocity based on where it hit the paddle
        let diff = 0;
        if (ball.y < paddle.y) {
            diff = paddle.y - ball.y;
            ball.body.velocity.y = -10 * diff;
        } else if (ball.y > paddle.y) {
            diff = ball.y - paddle.y;
            ball.body.velocity.y = 10 * diff;
        } else {
            ball.body.velocity.y = 2 + Math.random() * 8;
        }
    }

    resetBall() {
        const { width, height } = this.scale;
        this.ball.setPosition(width / 2, height / 2);
        
        const dir = Math.random() > 0.5 ? 1 : -1;
        this.ball.body.setVelocity(300 * dir, (Math.random() - 0.5) * 300);
    }

    goal(player) {
        if (player === 1) {
            this.score1++;
            this.scoreText1.setText(this.score1);
            // Create a fake graphics object to act as a texture for particles if 'flares' doesn't exist
            // Using a simple workaround by adding a small circle and tweening it for explosion
            this.createExplosion(this.scale.width, this.ball.y, 0xe94560);
        } else {
            this.score2++;
            this.scoreText2.setText(this.score2);
            this.createExplosion(0, this.ball.y, 0x0f3460);
        }
        
        this.events.emit('score-changed', Math.max(this.score1, this.score2));
        
        this.cameras.main.shake(200, 0.02);
        this.ball.body.setVelocity(0, 0);
        
        this.time.delayedCall(1000, () => {
            this.resetBall();
        });
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            let p = this.add.circle(x, y, 4, color);
            this.tweens.add({
                targets: p,
                x: x + (Math.random() - 0.5) * 200,
                y: y + (Math.random() - 0.5) * 200,
                alpha: 0,
                duration: 500 + Math.random() * 500,
                onComplete: () => p.destroy()
            });
        }
    }

    update() {
        const speed = 500;

        // Player 1 (Left) - Arrow keys or W/S
        if (this.cursors.up.isDown) {
            this.paddle1.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.paddle1.body.setVelocityY(speed);
        } else {
            this.paddle1.body.setVelocityY(0);
        }

        // Player 2 (Right) - Simple AI
        const aiSpeed = 400;
        if (this.ball.body.velocity.x > 0) { // Ball moving towards AI
            if (this.paddle2.y < this.ball.y - 10) {
                this.paddle2.body.setVelocityY(aiSpeed);
            } else if (this.paddle2.y > this.ball.y + 10) {
                this.paddle2.body.setVelocityY(-aiSpeed);
            } else {
                this.paddle2.body.setVelocityY(0);
            }
        } else {
            // Return to center
            const centerY = this.scale.height / 2;
            if (this.paddle2.y < centerY - 10) this.paddle2.body.setVelocityY(aiSpeed * 0.5);
            else if (this.paddle2.y > centerY + 10) this.paddle2.body.setVelocityY(-aiSpeed * 0.5);
            else this.paddle2.body.setVelocityY(0);
        }

        // Check bounds for goal
        if (this.ball.x < 0) {
            this.goal(2); // Right player scores
            this.ball.x = 10; // Prevent multiple triggers
        } else if (this.ball.x > this.scale.width) {
            this.goal(1); // Left player scores
            this.ball.x = this.scale.width - 10;
        }
    }
}
