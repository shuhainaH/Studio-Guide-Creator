import Phaser from 'phaser';

export default class TicTacToeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TicTacToeScene' });
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.cells = [];
    }

    create() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.cells = [];

        const { width, height } = this.scale;
        
        // Background
        this.cameras.main.setBackgroundColor('#2B1D16');

        // Draw grid lines
        const g = this.add.graphics();
        g.lineStyle(4, 0x8C6B52);
        
        const cx = width / 2;
        const cy = height / 2;
        const s = 100; // cell size
        
        g.beginPath();
        g.moveTo(cx - s/2, cy - s*1.5); g.lineTo(cx - s/2, cy + s*1.5);
        g.moveTo(cx + s/2, cy - s*1.5); g.lineTo(cx + s/2, cy + s*1.5);
        g.moveTo(cx - s*1.5, cy - s/2); g.lineTo(cx + s*1.5, cy - s/2);
        g.moveTo(cx - s*1.5, cy + s/2); g.lineTo(cx + s*1.5, cy + s/2);
        g.strokePath();

        // Create interactive cells
        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const x = cx + (col - 1) * s;
            const y = cy + (row - 1) * s;

            const zone = this.add.zone(x, y, s, s).setInteractive();
            zone.on('pointerdown', () => this.handleMove(i, x, y));
            this.cells.push({ zone, text: null });
        }

        this.statusText = this.add.text(cx, cy - s*2.5, "Player X's Turn", {
            fontSize: '32px',
            fontFamily: 'system-ui, sans-serif',
            fill: '#F4F1EA',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Restart instruction
        this.add.text(cx, height - 30, "Use restart button to play again", {
            fontSize: '16px',
            fill: '#8C6B52',
            fontFamily: 'system-ui, sans-serif'
        }).setOrigin(0.5);
    }

    handleMove(index, x, y) {
        if (this.gameOver || this.board[index]) return;

        this.board[index] = this.currentPlayer;
        
        const color = this.currentPlayer === 'X' ? '#E25E3E' : '#C4A484';
        
        const text = this.add.text(x, y, this.currentPlayer, {
            fontSize: '64px',
            fontFamily: 'system-ui, sans-serif',
            fill: color,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Small pop animation
        text.setScale(0);
        this.tweens.add({
            targets: text,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        this.cells[index].text = text;

        if (this.checkWin(this.currentPlayer)) {
            this.statusText.setText(`Player ${this.currentPlayer} Wins!`);
            this.gameOver = true;
        } else if (this.board.every(cell => cell !== null)) {
            this.statusText.setText("It's a Draw!");
            this.gameOver = true;
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.statusText.setText(`Player ${this.currentPlayer}'s Turn`);
        }
    }

    checkWin(player) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        return lines.some(line => line.every(i => this.board[i] === player));
    }
}
