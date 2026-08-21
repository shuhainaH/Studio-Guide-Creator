import Phaser from 'phaser';

export default class PacBoinkScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PacBoinkScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#0A0A0A');

        this.tileSize = 40;
        this.score = 0;
        this.isGameOver = false;

        // Maze layout: 1 = wall, 0 = dot, 2 = empty
        const layout = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,1],
            [1,1,1,1,1,0,1,1,2,1,1,2,1,1,0,1,1,1,1,1],
            [2,2,2,2,1,0,1,2,2,2,2,2,2,1,0,1,2,2,2,2],
            [1,1,1,1,1,0,1,2,1,1,1,1,2,1,0,1,1,1,1,1],
            [0,0,0,0,0,0,2,2,1,2,2,1,2,2,0,0,0,0,0,0],
            [1,1,1,1,1,0,1,2,1,1,1,1,2,1,0,1,1,1,1,1],
            [2,2,2,2,1,0,1,2,2,2,2,2,2,1,0,1,2,2,2,2],
            [1,1,1,1,1,0,1,2,1,1,1,1,2,1,0,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        this.walls = this.physics.add.staticGroup();
        this.dots = this.physics.add.staticGroup();
        
        let startX = 0;
        let startY = 0;
        let ghostSpawns = [];

        // Build maze
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                let px = x * this.tileSize + this.tileSize/2;
                let py = y * this.tileSize + this.tileSize/2;
                
                if (layout[y][x] === 1) {
                    let wall = this.add.rectangle(px, py, this.tileSize, this.tileSize, 0x1111bb);
                    this.physics.add.existing(wall, true);
                    this.walls.add(wall);
                } else if (layout[y][x] === 0) {
                    let dot = this.add.circle(px, py, 4, 0xffb8ae);
                    this.physics.add.existing(dot, true);
                    this.dots.add(dot);
                } else if (layout[y][x] === 2 && y === 9 && (x === 9 || x === 10)) {
                    ghostSpawns.push({x: px, y: py});
                }
            }
        }

        // Player
        this.player = this.add.circle(this.tileSize * 9.5, this.tileSize * 11.5, 14, 0xffff00);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.playerDirection = new Phaser.Math.Vector2(0, 0);
        this.nextDirection = new Phaser.Math.Vector2(0, 0);
        this.playerSpeed = 150;

        // Ghosts
        this.ghosts = this.physics.add.group();
        const colors = [0xff0000, 0xffb8ff, 0x00ffff];
        ghostSpawns = [{x: 400, y: 300}, {x: 440, y: 300}, {x: 360, y: 300}];
        
        for (let i = 0; i < 3; i++) {
            let ghost = this.add.rectangle(ghostSpawns[i].x, ghostSpawns[i].y, 24, 24, colors[i]);
            this.physics.add.existing(ghost);
            ghost.body.setBounce(1);
            ghost.body.setCollideWorldBounds(true);
            
            // Random start direction
            let dirs = [[1,0], [-1,0], [0,1], [0,-1]];
            let d = dirs[Math.floor(Math.random() * dirs.length)];
            ghost.body.setVelocity(d[0] * 100, d[1] * 100);
            
            this.ghosts.add(ghost);
        }

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // UI
        this.scoreText = this.add.text(16, 16, 'SCORE: 0', { fontSize: '24px', fill: '#fff', fontFamily: 'monospace' }).setDepth(10);

        // Collisions
        this.physics.add.collider(this.player, this.walls, this.hitWall, null, this);
        this.physics.add.collider(this.ghosts, this.walls);
        this.physics.add.overlap(this.player, this.dots, this.eatDot, null, this);
        this.physics.add.overlap(this.player, this.ghosts, this.gameOver, null, this);
    }

    update() {
        if (this.isGameOver) return;

        // Teleport tunnel
        if (this.player.x < -10) this.player.x = this.scale.width + 10;
        if (this.player.x > this.scale.width + 10) this.player.x = -10;

        // Input buffering
        if (this.cursors.left.isDown) this.nextDirection.set(-1, 0);
        else if (this.cursors.right.isDown) this.nextDirection.set(1, 0);
        else if (this.cursors.up.isDown) this.nextDirection.set(0, -1);
        else if (this.cursors.down.isDown) this.nextDirection.set(0, 1);

        // Movement logic (grid alignment)
        let isCenteredX = Math.abs(this.player.x % this.tileSize - this.tileSize/2) < 4;
        let isCenteredY = Math.abs(this.player.y % this.tileSize - this.tileSize/2) < 4;

        if (isCenteredX && isCenteredY) {
            if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
                // Check if we can turn
                let destX = this.player.x + this.nextDirection.x * this.tileSize;
                let destY = this.player.y + this.nextDirection.y * this.tileSize;
                
                let canTurn = true;
                this.walls.children.each(w => {
                    if (Math.abs(w.x - destX) < 10 && Math.abs(w.y - destY) < 10) canTurn = false;
                });

                if (canTurn) {
                    this.player.x = Math.floor(this.player.x / this.tileSize) * this.tileSize + this.tileSize/2;
                    this.player.y = Math.floor(this.player.y / this.tileSize) * this.tileSize + this.tileSize/2;
                    this.playerDirection.copy(this.nextDirection);
                    this.nextDirection.set(0,0);
                }
            }
        }

        this.player.body.setVelocity(
            this.playerDirection.x * this.playerSpeed, 
            this.playerDirection.y * this.playerSpeed
        );
        
        // Simple AI for ghosts (bounce and turn)
        this.ghosts.children.each(g => {
            if (g.body.velocity.length() < 10) {
                let dirs = [[1,0], [-1,0], [0,1], [0,-1]];
                let d = dirs[Math.floor(Math.random() * dirs.length)];
                g.body.setVelocity(d[0] * 100, d[1] * 100);
            }
        });
    }

    hitWall() {
        this.playerDirection.set(0,0);
    }

    eatDot(player, dot) {
        dot.destroy();
        this.score += 10;
        this.scoreText.setText('SCORE: ' + this.score);
        this.events.emit('score-changed', this.score);
        
        if (this.dots.countActive() === 0) {
            this.gameOver(true); // Win
        }
    }

    gameOver(won = false) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.player.body.setVelocity(0, 0);
        this.ghosts.setVelocity(0, 0);

        this.add.text(this.scale.width / 2, this.scale.height / 2, won ? 'YOU WIN!' : 'GAME OVER', {
            fontSize: '48px',
            fill: won ? '#00ff00' : '#ff0000',
            fontFamily: 'monospace'
        }).setOrigin(0.5).setDepth(20);
    }
}
