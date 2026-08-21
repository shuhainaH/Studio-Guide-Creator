import Phaser from 'phaser';

export default class SpaceBoinkScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SpaceBoinkScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#000022');

        // Starfield background
        this.stars = this.add.graphics();
        for (let i = 0; i < 150; i++) {
            this.stars.fillStyle(0xffffff, Math.random());
            this.stars.fillCircle(Math.random() * width, Math.random() * height, Math.random() * 2);
        }

        // Player (Boink Ship)
        // Using a triangle for the ship
        this.player = this.add.triangle(width / 2, height / 2, 0, 30, 20, 0, 40, 30, 0x00ffcc);
        this.physics.add.existing(this.player);
        this.player.body.setDrag(0.99); // Space friction
        this.player.body.setMaxVelocity(400);
        
        // Custom properties
        this.player.body.setAngularDrag(400);
        this.player.body.setMaxAngular(300);

        // Groups
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 20
        });

        this.asteroids = this.physics.add.group();

        this.score = 0;
        this.isGameOver = false;
        this.lastFired = 0;

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // UI
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', { 
            fontSize: '32px', 
            fill: '#00ffcc', 
            fontFamily: 'monospace',
            fontStyle: 'bold' 
        }).setDepth(10);

        // Collisions
        this.physics.add.collider(this.bullets, this.asteroids, this.hitAsteroid, null, this);
        this.physics.add.collider(this.player, this.asteroids, this.crash, null, this);

        // Initial Asteroids
        for (let i = 0; i < 5; i++) {
            this.spawnAsteroid();
        }
        
        // Spawn more periodically
        this.time.addEvent({
            delay: 3000,
            callback: this.spawnAsteroid,
            callbackScope: this,
            loop: true
        });
    }

    spawnAsteroid(x, y, size = 3) {
        if (this.isGameOver) return;
        
        // Random edge spawn if no coords provided
        if (x === undefined || y === undefined) {
            if (Math.random() > 0.5) {
                x = Math.random() > 0.5 ? 0 : this.scale.width;
                y = Math.random() * this.scale.height;
            } else {
                x = Math.random() * this.scale.width;
                y = Math.random() > 0.5 ? 0 : this.scale.height;
            }
        }

        let radius = size * 15;
        let ast = this.add.circle(x, y, radius, 0xff0055);
        this.physics.add.existing(ast);
        ast.body.setCircle(radius);
        ast.size = size;
        
        // Random velocity
        let speed = (4 - size) * 50 + Math.random() * 50;
        let angle = Math.random() * Math.PI * 2;
        ast.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        
        this.asteroids.add(ast);
    }

    update(time) {
        if (this.isGameOver) return;

        // Screen wrapping for player
        this.physics.world.wrap(this.player, 20);
        // Screen wrapping for asteroids
        this.asteroids.children.each(ast => {
            this.physics.world.wrap(ast, 20);
        });

        // Rotation
        if (this.cursors.left.isDown) {
            this.player.body.setAngularVelocity(-300);
        } else if (this.cursors.right.isDown) {
            this.player.body.setAngularVelocity(300);
        } else {
            this.player.body.setAngularVelocity(0);
        }

        // Thrust
        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(this.player.rotation - Math.PI/2, 300, this.player.body.acceleration);
        } else {
            this.player.body.setAcceleration(0);
        }

        // Shooting
        if (this.spaceBar.isDown && time > this.lastFired) {
            let bullet = this.add.rectangle(this.player.x, this.player.y, 4, 15, 0x00ffcc);
            this.physics.add.existing(bullet);
            this.bullets.add(bullet);
            
            bullet.rotation = this.player.rotation;
            this.physics.velocityFromRotation(this.player.rotation - Math.PI/2, 600, bullet.body.velocity);
            
            // Auto destroy bullet after a short time
            this.time.delayedCall(1000, () => {
                if(bullet.active) bullet.destroy();
            });
            
            this.lastFired = time + 200;
        }
    }

    hitAsteroid(bullet, asteroid) {
        bullet.destroy();
        
        let size = asteroid.size;
        let x = asteroid.x;
        let y = asteroid.y;
        
        asteroid.destroy();
        
        // Particles
        for(let i=0; i<5; i++){
            let p = this.add.circle(x, y, 4, 0xff0055);
            this.tweens.add({
                targets: p,
                x: x + (Math.random() - 0.5) * 100,
                y: y + (Math.random() - 0.5) * 100,
                alpha: 0,
                duration: 500,
                onComplete: () => p.destroy()
            });
        }
        
        // Spawn smaller asteroids
        if (size > 1) {
            this.spawnAsteroid(x, y, size - 1);
            this.spawnAsteroid(x, y, size - 1);
        }
        
        this.score += (4 - size) * 100;
        this.scoreText.setText('SCORE: ' + this.score);
        this.events.emit('score-changed', this.score);
    }

    crash(player, asteroid) {
        this.isGameOver = true;
        this.player.setActive(false).setVisible(false);
        this.asteroids.setVelocity(0, 0);
        this.bullets.setVelocity(0, 0);
        
        this.cameras.main.shake(300, 0.05);

        this.add.text(this.scale.width / 2, this.scale.height / 2, 'SHIP DESTROYED', {
            fontSize: '64px',
            fill: '#ff0055',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
}
