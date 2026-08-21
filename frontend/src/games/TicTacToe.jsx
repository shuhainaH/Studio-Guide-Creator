import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);

    const checkWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleClick = (i) => {
        if (board[i] || winner) return;
        const newBoard = [...board];
        newBoard[i] = isXNext ? 'X' : 'O';
        setBoard(newBoard);
        setIsXNext(!isXNext);
        setWinner(checkWinner(newBoard));
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
    };

    const isDraw = !winner && board.every(square => square !== null);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand flex flex-col items-center">
            <h3 className="text-xl font-black text-brown-900 mb-4">Tic Tac Toe</h3>
            
            <div className="mb-4 text-sm font-bold text-brown-600 h-6">
                {winner ? `Winner: ${winner}` : isDraw ? 'Draw!' : `Next player: ${isXNext ? 'X' : 'O'}`}
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
                {board.map((square, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(i)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 bg-cream rounded-xl text-3xl font-black shadow-inner flex items-center justify-center transition-colors ${
                            !square && !winner ? 'hover:bg-beige cursor-pointer' : 'cursor-default'
                        } ${square === 'X' ? 'text-terracotta' : 'text-brown-800'}`}
                    >
                        {square}
                    </button>
                ))}
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

export default TicTacToe;
