import Phaser from 'phaser';

export default class DotsAndBoxesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DotsAndBoxesScene' });
        this.ROWS = 4;
        this.COLS = 4;
        this.SPACING = 80;
        
        // State
        this.horizontalLines = []; // [row][col]
        this.verticalLines = [];   // [row][col]
        this.boxes = [];           // [row][col] = 0(empty), 1(P1), 2(P2)
        this.currentPlayer = 1;
        this.score1 = 0;
        this.score2 = 0;
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#F4F1EA'); // BOINK cream

        this.horizontalLines = Array(this.ROWS + 1).fill(null).map(() => Array(this.COLS).fill(false));
        this.verticalLines = Array(this.ROWS).fill(null).map(() => Array(this.COLS + 1).fill(false));
        this.boxes = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(0));
        this.currentPlayer = 1;
        this.score1 = 0;
        this.score2 = 0;

        const boardWidth = this.COLS * this.SPACING;
        const boardHeight = this.ROWS * this.SPACING;
        const startX = (width - boardWidth) / 2;
        const startY = (height - boardHeight) / 2 + 30;

        this.startX = startX;
        this.startY = startY;

        // UI
        this.statusText = this.add.text(width / 2, 50, "Player 1's Turn", {
            fontSize: '32px',
            fontFamily: 'system-ui, sans-serif',
            fill: '#E25E3E',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scoreText = this.add.text(width / 2, 90, "P1: 0  |  P2: 0", {
            fontSize: '24px',
            fontFamily: 'system-ui, sans-serif',
            fill: '#5A4634',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Draw dots and interactive lines
        for (let r = 0; r <= this.ROWS; r++) {
            for (let c = 0; c <= this.COLS; c++) {
                let px = startX + c * this.SPACING;
                let py = startY + r * this.SPACING;

                // Dot
                this.add.circle(px, py, 6, 0x5A4634).setDepth(10);

                // Horizontal click zone
                if (c < this.COLS) {
                    let zone = this.add.zone(px + this.SPACING/2, py, this.SPACING - 10, 20).setInteractive();
                    zone.on('pointerdown', () => this.clickLine('h', r, c));
                    zone.on('pointerover', () => this.hoverLine('h', r, c, true));
                    zone.on('pointerout', () => this.hoverLine('h', r, c, false));
                }

                // Vertical click zone
                if (r < this.ROWS) {
                    let zone = this.add.zone(px, py + this.SPACING/2, 20, this.SPACING - 10).setInteractive();
                    zone.on('pointerdown', () => this.clickLine('v', r, c));
                    zone.on('pointerover', () => this.hoverLine('v', r, c, true));
                    zone.on('pointerout', () => this.hoverLine('v', r, c, false));
                }
            }
        }

        this.drawnGraphics = this.add.graphics();
        this.hoverGraphics = this.add.graphics();
    }

    hoverLine(type, r, c, isHovering) {
        this.hoverGraphics.clear();
        if (!isHovering) return;
        
        if (type === 'h' && this.horizontalLines[r][c]) return;
        if (type === 'v' && this.verticalLines[r][c]) return;

        this.hoverGraphics.lineStyle(4, this.currentPlayer === 1 ? 0xE25E3E : 0x8C6B52, 0.4);
        
        let px = this.startX + c * this.SPACING;
        let py = this.startY + r * this.SPACING;
        
        this.hoverGraphics.beginPath();
        if (type === 'h') {
            this.hoverGraphics.moveTo(px, py);
            this.hoverGraphics.lineTo(px + this.SPACING, py);
        } else {
            this.hoverGraphics.moveTo(px, py);
            this.hoverGraphics.lineTo(px, py + this.SPACING);
        }
        this.hoverGraphics.strokePath();
    }

    clickLine(type, r, c) {
        if (type === 'h' && this.horizontalLines[r][c]) return;
        if (type === 'v' && this.verticalLines[r][c]) return;

        this.hoverGraphics.clear();

        if (type === 'h') this.horizontalLines[r][c] = true;
        else this.verticalLines[r][c] = true;

        // Draw it
        this.drawnGraphics.lineStyle(4, this.currentPlayer === 1 ? 0xE25E3E : 0x8C6B52, 1);
        let px = this.startX + c * this.SPACING;
        let py = this.startY + r * this.SPACING;
        this.drawnGraphics.beginPath();
        if (type === 'h') {
            this.drawnGraphics.moveTo(px, py);
            this.drawnGraphics.lineTo(px + this.SPACING, py);
        } else {
            this.drawnGraphics.moveTo(px, py);
            this.drawnGraphics.lineTo(px, py + this.SPACING);
        }
        this.drawnGraphics.strokePath();

        // Check for completed boxes
        let boxesCompleted = this.checkBoxes();

        if (boxesCompleted > 0) {
            if (this.currentPlayer === 1) this.score1 += boxesCompleted;
            else this.score2 += boxesCompleted;
            this.scoreText.setText(`P1: ${this.score1}  |  P2: ${this.score2}`);
            this.events.emit('score-changed', Math.max(this.score1, this.score2));
            
            if (this.score1 + this.score2 === this.ROWS * this.COLS) {
                let winner = this.score1 > this.score2 ? 'Player 1' : (this.score2 > this.score1 ? 'Player 2' : 'Nobody');
                this.statusText.setText(`${winner} Wins!`);
                this.statusText.setFill('#5A4634');
            }
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.statusText.setText(this.currentPlayer === 1 ? "Player 1's Turn" : "Player 2's Turn");
            this.statusText.setFill(this.currentPlayer === 1 ? '#E25E3E' : '#8C6B52');
        }
    }

    checkBoxes() {
        let completed = 0;
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (this.boxes[r][c] === 0) {
                    if (this.horizontalLines[r][c] && this.horizontalLines[r+1][c] && this.verticalLines[r][c] && this.verticalLines[r][c+1]) {
                        this.boxes[r][c] = this.currentPlayer;
                        completed++;
                        
                        // Fill box animation
                        let px = this.startX + c * this.SPACING;
                        let py = this.startY + r * this.SPACING;
                        let box = this.add.rectangle(px + this.SPACING/2, py + this.SPACING/2, 0, 0, this.currentPlayer === 1 ? 0xE25E3E : 0x8C6B52);
                        box.setAlpha(0.5);
                        
                        this.tweens.add({
                            targets: box,
                            width: this.SPACING - 4,
                            height: this.SPACING - 4,
                            duration: 300,
                            ease: 'Back.easeOut'
                        });
                    }
                }
            }
        }
        return completed;
    }
}
