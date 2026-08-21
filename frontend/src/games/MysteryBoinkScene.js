import Phaser from 'phaser';

export default class MysteryBoinkScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MysteryBoinkScene' });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#1e1428');

        this.tileSize = 60;
        this.score = 0;
        this.isGameOver = false;

        // Level map: 1 = wall, 0 = floor, 2 = target, 3 = crate, 4 = player
        this.level = [
            [1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,1],
            [1,0,2,3,4,3,2,0,1],
            [1,0,0,0,1,0,0,0,1],
            [1,1,1,1,1,1,1,1,1]
        ];

        this.offsetX = (width - (this.level[0].length * this.tileSize)) / 2;
        this.offsetY = (height - (this.level.length * this.tileSize)) / 2;

        this.walls = this.add.group();
        this.targets = this.add.group();
        this.crates = this.add.group();
        this.player = null;

        this.playerGridPos = { x: 0, y: 0 };
        this.crateData = []; // To keep track of crate positions

        this.buildLevel();

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Prevent rapid movement
        this.inputTimer = 0;

        // UI
        this.scoreText = this.add.text(20, 20, 'PUSH CRATES TO TARGETS', { 
            fontSize: '24px', 
            fill: '#9b59b6', 
            fontFamily: 'monospace',
            fontStyle: 'bold' 
        });

        // Restart instruction
        this.add.text(width - 20, 20, 'PRESS SPACE TO RESTART', { 
            fontSize: '18px', 
            fill: '#7f8c8d', 
            fontFamily: 'monospace'
        }).setOrigin(1, 0);

        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    buildLevel() {
        this.walls.clear(true, true);
        this.targets.clear(true, true);
        this.crates.clear(true, true);
        if (this.player) this.player.destroy();
        this.crateData = [];

        // Floor
        for (let y = 0; y < this.level.length; y++) {
            for (let x = 0; x < this.level[y].length; x++) {
                let px = this.offsetX + x * this.tileSize + this.tileSize/2;
                let py = this.offsetY + y * this.tileSize + this.tileSize/2;
                
                this.add.rectangle(px, py, this.tileSize, this.tileSize, 0x2c1d3e).setStrokeStyle(2, 0x1e1428);
                
                let tile = this.level[y][x];
                
                if (tile === 1) {
                    let w = this.add.rectangle(px, py, this.tileSize, this.tileSize, 0x34495e);
                    this.walls.add(w);
                } else if (tile === 2) {
                    let t = this.add.circle(px, py, 15, 0x9b59b6).setAlpha(0.6);
                    t.gridX = x;
                    t.gridY = y;
                    this.targets.add(t);
                } else if (tile === 3) {
                    let c = this.add.rectangle(px, py, this.tileSize * 0.8, this.tileSize * 0.8, 0xd35400);
                    c.gridX = x;
                    c.gridY = y;
                    this.crates.add(c);
                    this.crateData.push(c);
                } else if (tile === 4) {
                    this.playerGridPos.x = x;
                    this.playerGridPos.y = y;
                    this.player = this.add.circle(px, py, this.tileSize * 0.35, 0x00ffcc);
                }
            }
        }
    }

    update(time, delta) {
        if (this.isGameOver) return;

        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            this.buildLevel();
            return;
        }

        if (time > this.inputTimer) {
            let dx = 0;
            let dy = 0;

            if (this.cursors.left.isDown) dx = -1;
            else if (this.cursors.right.isDown) dx = 1;
            else if (this.cursors.up.isDown) dy = -1;
            else if (this.cursors.down.isDown) dy = 1;

            if (dx !== 0 || dy !== 0) {
                this.movePlayer(dx, dy);
                this.inputTimer = time + 200;
            }
        }
    }

    movePlayer(dx, dy) {
        let nx = this.playerGridPos.x + dx;
        let ny = this.playerGridPos.y + dy;

        // Check bounds
        if (ny < 0 || ny >= this.level.length || nx < 0 || nx >= this.level[0].length) return;

        // Check wall
        if (this.level[ny][nx] === 1) return;

        // Check crate
        let crate = this.crateData.find(c => c.gridX === nx && c.gridY === ny);
        if (crate) {
            // Can we push the crate?
            let cx = nx + dx;
            let cy = ny + dy;
            
            if (this.level[cy][cx] === 1) return; // Wall behind crate
            let crateBehind = this.crateData.find(c => c.gridX === cx && c.gridY === cy);
            if (crateBehind) return; // Crate behind crate

            // Push crate
            crate.gridX = cx;
            crate.gridY = cy;
            
            this.tweens.add({
                targets: crate,
                x: this.offsetX + cx * this.tileSize + this.tileSize/2,
                y: this.offsetY + cy * this.tileSize + this.tileSize/2,
                duration: 100
            });
        }

        // Move player
        this.playerGridPos.x = nx;
        this.playerGridPos.y = ny;
        
        this.tweens.add({
            targets: this.player,
            x: this.offsetX + nx * this.tileSize + this.tileSize/2,
            y: this.offsetY + ny * this.tileSize + this.tileSize/2,
            duration: 100,
            onComplete: () => this.checkWinCondition()
        });
    }

    checkWinCondition() {
        let targetsFilled = 0;
        
        this.crateData.forEach(crate => {
            let onTarget = false;
            this.targets.children.each(target => {
                if (crate.gridX === target.gridX && crate.gridY === target.gridY) {
                    onTarget = true;
                }
            });
            
            if (onTarget) {
                crate.setFillStyle(0x27ae60);
                targetsFilled++;
            } else {
                crate.setFillStyle(0xd35400);
            }
        });

        if (targetsFilled === this.targets.getLength() && targetsFilled > 0) {
            this.isGameOver = true;
            this.score = 500;
            this.events.emit('score-changed', this.score);
            
            this.add.text(this.scale.width / 2, this.scale.height / 2, 'ROOM CLEARED!', {
                fontSize: '64px',
                fill: '#00ffcc',
                fontFamily: 'monospace',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(20);
        }
    }
}
