import Phaser from 'phaser';

export default class Connect4Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Connect4Scene' });
        this.ROWS = 6;
        this.COLS = 7;
        this.CELL_SIZE = 70;
        this.board = [];
        this.currentPlayer = 1; // 1 (Red) or 2 (Yellow)
        this.gameOver = false;
        this.isDropping = false;
        this.tokens = [];
    }

    create() {
        this.board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.isDropping = false;
        this.tokens = [];

        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#2B1D16');

        this.boardWidth = this.COLS * this.CELL_SIZE;
        this.boardHeight = this.ROWS * this.CELL_SIZE;
        this.offsetX = (width - this.boardWidth) / 2;
        this.offsetY = (height - this.boardHeight) / 2 + 30;

        // Draw board
        const boardGraphics = this.add.graphics();
        boardGraphics.fillStyle(0x3498db, 1);
        boardGraphics.fillRoundedRect(this.offsetX - 10, this.offsetY - 10, this.boardWidth + 20, this.boardHeight + 20, 15);
        
        // Punch holes
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const cx = this.offsetX + c * this.CELL_SIZE + this.CELL_SIZE / 2;
                const cy = this.offsetY + r * this.CELL_SIZE + this.CELL_SIZE / 2;
                boardGraphics.fillStyle(0x2B1D16, 1);
                boardGraphics.fillCircle(cx, cy, this.CELL_SIZE / 2 - 5);
            }
        }
        boardGraphics.setDepth(10); // Board is on top of tokens

        // Hover token indicator
        this.hoverToken = this.add.circle(0, this.offsetY - this.CELL_SIZE/2, this.CELL_SIZE/2 - 5, 0xe74c3c);
        this.hoverToken.setDepth(5);
        this.hoverToken.setVisible(false);

        // Input
        this.input.on('pointermove', (pointer) => {
            if (this.gameOver || this.isDropping) return;
            const col = this.getColFromX(pointer.x);
            if (col >= 0 && col < this.COLS) {
                this.hoverToken.setVisible(true);
                this.hoverToken.setX(this.offsetX + col * this.CELL_SIZE + this.CELL_SIZE / 2);
                this.hoverToken.setFillStyle(this.currentPlayer === 1 ? 0xe74c3c : 0xf1c40f);
            } else {
                this.hoverToken.setVisible(false);
            }
        });

        this.input.on('pointerdown', (pointer) => {
            if (this.gameOver || this.isDropping) return;
            const col = this.getColFromX(pointer.x);
            if (col >= 0 && col < this.COLS) {
                this.dropToken(col);
            }
        });

        this.statusText = this.add.text(width / 2, this.offsetY - 70, "Red's Turn", {
            fontSize: '32px',
            fontFamily: 'system-ui, sans-serif',
            fill: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    getColFromX(x) {
        const col = Math.floor((x - this.offsetX) / this.CELL_SIZE);
        return col;
    }

    dropToken(col) {
        // Find empty row
        let row = -1;
        for (let r = this.ROWS - 1; r >= 0; r--) {
            if (this.board[r][col] === 0) {
                row = r;
                break;
            }
        }
        if (row === -1) return; // Column full

        this.isDropping = true;
        this.hoverToken.setVisible(false);
        this.board[row][col] = this.currentPlayer;

        const startX = this.offsetX + col * this.CELL_SIZE + this.CELL_SIZE / 2;
        const startY = this.offsetY - this.CELL_SIZE;
        const endY = this.offsetY + row * this.CELL_SIZE + this.CELL_SIZE / 2;

        const token = this.add.circle(startX, startY, this.CELL_SIZE/2 - 5, this.currentPlayer === 1 ? 0xe74c3c : 0xf1c40f);
        token.setDepth(5);
        this.tokens.push(token);

        this.tweens.add({
            targets: token,
            y: endY,
            duration: 500,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                this.isDropping = false;
                if (this.checkWin(row, col, this.currentPlayer)) {
                    this.statusText.setText(this.currentPlayer === 1 ? "Red Wins!" : "Yellow Wins!");
                    this.statusText.setFill(this.currentPlayer === 1 ? '#e74c3c' : '#f1c40f');
                    this.gameOver = true;
                } else if (this.board.flat().every(c => c !== 0)) {
                    this.statusText.setText("It's a Draw!");
                    this.statusText.setFill('#F4F1EA');
                    this.gameOver = true;
                } else {
                    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                    this.statusText.setText(this.currentPlayer === 1 ? "Red's Turn" : "Yellow's Turn");
                    this.statusText.setFill(this.currentPlayer === 1 ? '#e74c3c' : '#f1c40f');
                    
                    // Update hover token
                    const pointer = this.input.activePointer;
                    const c = this.getColFromX(pointer.x);
                    if (c >= 0 && c < this.COLS) {
                        this.hoverToken.setVisible(true);
                        this.hoverToken.setFillStyle(this.currentPlayer === 1 ? 0xe74c3c : 0xf1c40f);
                    }
                }
            }
        });
    }

    checkWin(r, c, player) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        
        for (let [dr, dc] of directions) {
            let count = 1;
            // Check forward
            let nr = r + dr, nc = c + dc;
            while (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS && this.board[nr][nc] === player) {
                count++;
                nr += dr; nc += dc;
            }
            // Check backward
            nr = r - dr; nc = c - dc;
            while (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS && this.board[nr][nc] === player) {
                count++;
                nr -= dr; nc -= dc;
            }
            if (count >= 4) return true;
        }
        return false;
    }
}
