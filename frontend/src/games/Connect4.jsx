import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

const ROWS = 6;
const COLS = 7;

const Connect4 = () => {
    // 2D Array: board[row][col], row 0 is top, row 5 is bottom
    const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    const [isRedNext, setIsRedNext] = useState(true);
    const [winner, setWinner] = useState(null);

    const checkWin = (b, r, c) => {
        const player = b[r][c];
        if (!player) return null;

        const directions = [
            [0, 1], // horizontal
            [1, 0], // vertical
            [1, 1], // diagonal right
            [1, -1] // diagonal left
        ];

        for (let [dr, dc] of directions) {
            let count = 1;
            // Check one direction
            for (let i = 1; i < 4; i++) {
                const nr = r + dr * i;
                const nc = c + dc * i;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === player) {
                    count++;
                } else break;
            }
            // Check opposite direction
            for (let i = 1; i < 4; i++) {
                const nr = r - dr * i;
                const nc = c - dc * i;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === player) {
                    count++;
                } else break;
            }
            if (count >= 4) return player;
        }
        return null;
    };

    const dropPiece = (colIndex) => {
        if (winner) return;
        
        const newBoard = board.map(row => [...row]);
        
        // Find bottom-most empty slot in the column
        let rowIndex = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!newBoard[r][colIndex]) {
                rowIndex = r;
                break;
            }
        }
        
        if (rowIndex === -1) return; // Column is full

        newBoard[rowIndex][colIndex] = isRedNext ? 'Red' : 'Yellow';
        setBoard(newBoard);
        setIsRedNext(!isRedNext);
        
        const gameWinner = checkWin(newBoard, rowIndex, colIndex);
        if (gameWinner) setWinner(gameWinner);
    };

    const resetGame = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
        setIsRedNext(true);
        setWinner(null);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand flex flex-col items-center w-full max-w-md mx-auto">
            <h3 className="text-xl font-black text-brown-900 mb-4">Connect 4</h3>
            
            <div className="mb-4 text-sm font-bold text-brown-600 h-6">
                {winner ? `Winner: ${winner}!` : `Next player: ${isRedNext ? 'Red' : 'Yellow'}`}
            </div>
            
            <div className="bg-brown-600 p-2 sm:p-3 rounded-xl mb-6 shadow-inner w-full max-w-[320px]">
                <div className="flex justify-between gap-1 mb-1">
                    {/* Column drop buttons */}
                    {Array(COLS).fill(0).map((_, c) => (
                        <button
                            key={`btn-${c}`}
                            className="flex-1 h-6 hover:bg-white/20 rounded cursor-pointer transition-colors"
                            onClick={() => dropPiece(c)}
                            disabled={!!winner || board[0][c] !== null}
                        />
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {board.map((row, rIndex) => (
                        row.map((cell, cIndex) => (
                            <div 
                                key={`${rIndex}-${cIndex}`} 
                                className="w-full aspect-square bg-brown-900 rounded-full shadow-inner flex items-center justify-center p-0.5"
                                onClick={() => dropPiece(cIndex)}
                            >
                                {cell && (
                                    <div className={`w-full h-full rounded-full shadow-sm animate-bounce-short ${
                                        cell === 'Red' ? 'bg-terracotta' : 'bg-yellow-400'
                                    }`} />
                                )}
                            </div>
                        ))
                    ))}
                </div>
            </div>
            
            <button 
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 bg-beige hover:bg-brown-200 text-brown-900 rounded-full font-bold transition-colors"
            >
                <RotateCcw size={16} /> Reset
            </button>
        </div>
    );
};

export default Connect4;
