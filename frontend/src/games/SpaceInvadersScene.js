import Phaser from 'phaser';

export default class SpaceInvadersScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SpaceInvadersScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#000000');

        // Starfield background
        this.stars = this.add.graphics();
        for (let i = 0; i < 100; i++) {
            this.stars.fillStyle(0xffffff, Math.random());
            this.stars.fillCircle(Math.random() * width, Math.random() * height, Math.random() * 2);
        }

        // Player
        this.player = this.add.triangle(width / 2, height - 50, 0, 20, 20, 20, 10, 0, 0x00ffcc);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        
        // Bullets group
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        // Enemies group
        this.enemies = this.physics.add.group();
        this.createEnemies();

        this.enemyDirection = 1;
        this.enemySpeed = 50;

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.lastFired = 0;

        // Score
        this.score = 0;
        this.scoreText = this.add.text(10, 10, 'SCORE: 0', { fontSize: '24px', fill: '#00ffcc', fontFamily: 'monospace' });

        // Collisions
        this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.collider(this.player, this.enemies, this.gameOver, null, this);
        
        // Explosion particle emitter
        this.emitter = this.add.particles(0, 0, 'flares', {
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            emitting: false
        });
    }

    createEnemies() {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 8; col++) {
                let enemy = this.add.rectangle(100 + col * 60, 50 + row * 50, 30, 20, 0xff00ff);
                this.physics.add.existing(enemy);
                this.enemies.add(enemy);
            }
        }
        this.enemies.setVelocityX(this.enemySpeed);
    }

    update(time, delta) {
        if (!this.player.active) return;

        // Starfield scroll effect
        this.stars.y += 0.5;
        if (this.stars.y > this.scale.height) this.stars.y = -this.scale.height;

        // Player Movement
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(300);
        } else {
            this.player.body.setVelocityX(0);
        }

        // Shooting
        if (this.spaceBar.isDown && time > this.lastFired) {
            let bullet = this.add.rectangle(this.player.x, this.player.y - 20, 4, 15, 0x00ffcc);
            this.physics.add.existing(bullet);
            this.bullets.add(bullet);
            bullet.body.setVelocityY(-400);
            
            this.lastFired = time + 300;
        }

        // Bullet cleanup
        this.bullets.children.each(b => {
            if (b.active && b.y < 0) {
                b.destroy();
            }
        });

        // Enemy movement logic
        let hitEdge = false;
        this.enemies.children.each(enemy => {
            if (enemy.active) {
                if (enemy.x > this.scale.width - 20 && this.enemyDirection === 1) {
                    hitEdge = true;
                } else if (enemy.x < 20 && this.enemyDirection === -1) {
                    hitEdge = true;
                }
            }
        });

        if (hitEdge) {
            this.enemyDirection *= -1;
            this.enemySpeed += 10;
            this.enemies.setVelocityX(this.enemySpeed * this.enemyDirection);
            this.enemies.children.each(enemy => {
                if (enemy.active) {
                    enemy.y += 20;
                    if (enemy.y > this.scale.height - 100) {
                        this.gameOver();
                    }
                }
            });
        }
        
        if (this.enemies.countActive() === 0) {
            this.createEnemies(); // Next level
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();
        
        // Simple explosion
        for(let i=0; i<10; i++){
            let p = this.add.rectangle(enemy.x, enemy.y, 4, 4, 0xff00ff);
            this.tweens.add({
                targets: p,
                x: enemy.x + (Math.random() - 0.5) * 100,
                y: enemy.y + (Math.random() - 0.5) * 100,
                alpha: 0,
                duration: 300,
                onComplete: () => p.destroy()
            });
        }
        
        enemy.destroy();

        this.score += 100;
        this.scoreText.setText('SCORE: ' + this.score);
        this.events.emit('score-changed', this.score);
    }

    gameOver() {
        this.player.setActive(false).setVisible(false);
        this.enemies.setVelocityX(0);
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0055',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
    }
}
