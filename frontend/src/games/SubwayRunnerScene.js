import Phaser from 'phaser';

export default class SubwayRunnerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SubwayRunnerScene' });
    }

    create() {
        const { width, height } = this.scale;
        
        // Cyberpunk city background colors
        this.cameras.main.setBackgroundColor('#1a0b2e');

        // Scrolling skyline
        this.skyline = this.add.graphics();
        this.skyline.fillStyle(0x3a1f5d, 1);
        for(let i=0; i<20; i++) {
            let h = Math.random() * 200 + 100;
            this.skyline.fillRect(i * 60, height - h - 100, 50, h);
        }
        
        // Ground
        this.ground = this.add.rectangle(width/2, height - 50, width, 100, 0x4a0e4e);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = this.add.rectangle(150, height - 120, 40, 60, 0x00ffcc);
        this.physics.add.existing(this.player);
        this.player.body.setGravityY(1200);
        this.player.body.setCollideWorldBounds(true);

        // Obstacles group
        this.obstacles = this.physics.add.group();

        // Speed and state
        this.gameSpeed = 300;
        this.score = 0;
        this.isGameOver = false;

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // UI
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', { 
            fontSize: '32px', 
            fill: '#00ffcc', 
            fontFamily: 'monospace',
            fontStyle: 'bold'
        });

        // Collisions
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);

        // Obstacle Spawner
        this.time.addEvent({
            delay: 1500,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        // Score timer
        this.time.addEvent({
            delay: 100,
            callback: () => {
                if(!this.isGameOver) {
                    this.score += 1;
                    this.scoreText.setText('SCORE: ' + this.score);
                    this.events.emit('score-changed', this.score);
                    // Gradually increase speed
                    if (this.score % 100 === 0) {
                        this.gameSpeed += 20;
                    }
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    spawnObstacle() {
        if (this.isGameOver) return;
        
        // Randomly spawn a low barricade or a high hovering drone
        let isHigh = Math.random() > 0.6;
        let obsY = isHigh ? this.scale.height - 180 : this.scale.height - 120;
        let obsH = isHigh ? 30 : 50;
        let obsColor = isHigh ? 0xff0055 : 0xffaa00;

        let obs = this.add.rectangle(this.scale.width + 50, obsY, 40, obsH, obsColor);
        this.physics.add.existing(obs);
        obs.body.setAllowGravity(false);
        obs.body.setVelocityX(-this.gameSpeed);
        
        this.obstacles.add(obs);
    }

    update() {
        if (this.isGameOver) return;

        // Jumping
        const isGrounded = this.player.body.touching.down;
        if ((this.cursors.up.isDown || this.spaceBar.isDown) && isGrounded) {
            this.player.body.setVelocityY(-700);
            
            // Jump dust
            let dust = this.add.rectangle(this.player.x, this.player.y + 30, 20, 10, 0xffffff, 0.5);
            this.tweens.add({
                targets: dust,
                scaleX: 3,
                alpha: 0,
                duration: 300,
                onComplete: () => dust.destroy()
            });
        }

        // Fast fall
        if (this.cursors.down.isDown && !isGrounded) {
            this.player.body.setVelocityY(800);
        }

        // Parallax background (fake scrolling by just redrawing or moving the whole group)
        // For simplicity, we just move the skyline slightly left and wrap it
        this.skyline.x -= (this.gameSpeed * 0.001);
        if (this.skyline.x < -1200) {
            this.skyline.x = 0;
        }

        // Cleanup obstacles
        this.obstacles.children.each(obs => {
            if (obs.active && obs.x < -50) {
                obs.destroy();
            }
        });
    }

    hitObstacle(player, obstacle) {
        this.isGameOver = true;
        this.obstacles.setVelocityX(0);
        this.player.body.setVelocity(0, 0);
        this.gameSpeed = 0;

        // Crash effect
        this.cameras.main.shake(200, 0.02);
        this.player.setFillStyle(0xff0000);

        this.add.text(this.scale.width / 2, this.scale.height / 2, 'CRASHED!', {
            fontSize: '64px',
            fill: '#ff0055',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
}
