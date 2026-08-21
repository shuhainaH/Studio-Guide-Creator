import Phaser from 'phaser';

export default class BoinkRacingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BoinkRacingScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#2c3e50');

        // Road
        this.roadWidth = 400;
        this.roadStartX = (width - this.roadWidth) / 2;
        
        this.road = this.add.rectangle(width/2, height/2, this.roadWidth, height, 0x34495e);
        
        // Road lines
        this.lines = this.add.graphics();
        this.lineOffset = 0;

        // Player (Car)
        this.player = this.add.rectangle(width/2, height - 100, 40, 80, 0xe74c3c);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        // Constrain player to road
        this.player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(this.roadStartX, 0, this.roadWidth, height));

        // Enemies/Obstacles group
        this.obstacles = this.physics.add.group();

        this.gameSpeed = 400;
        this.score = 0;
        this.isGameOver = false;

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // UI
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', { 
            fontSize: '32px', 
            fill: '#ecf0f1', 
            fontFamily: 'monospace',
            fontStyle: 'bold' 
        });

        // Collisions
        this.physics.add.collider(this.player, this.obstacles, this.crash, null, this);

        // Obstacle Spawner
        this.time.addEvent({
            delay: 1000,
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
        
        let lanes = [
            this.roadStartX + 50, 
            this.roadStartX + 150, 
            this.roadStartX + 250, 
            this.roadStartX + 350
        ];
        
        // Spawn 1 or 2 cars
        let count = Math.random() > 0.7 ? 2 : 1;
        let spawnedLanes = [];
        
        for (let i = 0; i < count; i++) {
            let lane;
            do {
                lane = lanes[Math.floor(Math.random() * lanes.length)];
            } while (spawnedLanes.includes(lane));
            
            spawnedLanes.push(lane);
            
            let isTruck = Math.random() > 0.8;
            let obs = this.add.rectangle(lane, -100, 40, isTruck ? 120 : 80, isTruck ? 0xf1c40f : 0x9b59b6);
            this.physics.add.existing(obs);
            obs.body.setVelocityY(this.gameSpeed * (isTruck ? 0.7 : 0.9)); // Enemies move slightly slower than road for relative speed
            
            this.obstacles.add(obs);
        }
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Player Movement
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-400);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(400);
        } else {
            this.player.body.setVelocityX(0);
        }

        // Fast forward / Brake
        if (this.cursors.up.isDown) {
            this.gameSpeed = Math.min(this.gameSpeed + 5, 800);
        } else if (this.cursors.down.isDown) {
            this.gameSpeed = Math.max(this.gameSpeed - 10, 200);
        }

        // Draw scrolling road lines
        this.lines.clear();
        this.lines.fillStyle(0xecf0f1, 1);
        
        this.lineOffset += (this.gameSpeed * delta / 1000);
        if (this.lineOffset > 60) this.lineOffset = 0;

        for (let i = -1; i < this.scale.height / 60 + 1; i++) {
            let y = (i * 60) + this.lineOffset;
            this.lines.fillRect(this.roadStartX + 100, y, 10, 30);
            this.lines.fillRect(this.roadStartX + 200, y, 10, 30);
            this.lines.fillRect(this.roadStartX + 300, y, 10, 30);
        }

        // Cleanup obstacles
        this.obstacles.children.each(obs => {
            if (obs.active && obs.y > this.scale.height + 150) {
                obs.destroy();
            } else if (obs.active) {
                // Adjust enemy speed based on our game speed
                obs.body.setVelocityY(this.gameSpeed * (obs.height > 80 ? 0.7 : 0.9));
            }
        });
    }

    crash(player, obstacle) {
        this.isGameOver = true;
        this.obstacles.setVelocityY(0);
        this.player.body.setVelocity(0, 0);
        this.gameSpeed = 0;
        
        // Explosion particles
        for(let i=0; i<15; i++){
            let p = this.add.rectangle(player.x, player.y, 8, 8, 0xffa500);
            this.tweens.add({
                targets: p,
                x: player.x + (Math.random() - 0.5) * 200,
                y: player.y + (Math.random() - 0.5) * 200,
                alpha: 0,
                rotation: Math.random() * Math.PI,
                duration: 800,
                onComplete: () => p.destroy()
            });
        }
        
        this.cameras.main.shake(400, 0.04);
        this.player.setFillStyle(0x333333);

        this.add.text(this.scale.width / 2, this.scale.height / 2, 'CRASHED', {
            fontSize: '64px',
            fill: '#e74c3c',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);
    }
}
