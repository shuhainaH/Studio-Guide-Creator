import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import PlatformerScene from '../games/PlatformerScene';
import TicTacToeScene from '../games/TicTacToeScene';
import Connect4Scene from '../games/Connect4Scene';
import PongScene from '../games/PongScene';
import SnakeScene from '../games/SnakeScene';
import SpaceInvadersScene from '../games/SpaceInvadersScene';
import DotsAndBoxesScene from '../games/DotsAndBoxesScene';
import PacBoinkScene from '../games/PacBoinkScene';
import SubwayRunnerScene from '../games/SubwayRunnerScene';
import SpaceBoinkScene from '../games/SpaceBoinkScene';
import BoinkRacingScene from '../games/BoinkRacingScene';
import BoinkTetrisScene from '../games/BoinkTetrisScene';
import MysteryBoinkScene from '../games/MysteryBoinkScene';
import ComingSoonScene from '../games/ComingSoonScene';
import { Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

const GamePlayer = () => {
    const { slug } = useParams();
    const gameRef = useRef(null);
    const [phaserGame, setPhaserGame] = useState(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [score, setScore] = useState(0);
    const [gameDetails, setGameDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSceneKey, setCurrentSceneKey] = useState('PlatformerScene');

    useEffect(() => {
        const fetchGame = async () => {
            try {
                // Since we don't have a direct slug endpoint configured yet, we fetch all and find it, or we could add a slug endpoint.
                // Assuming /api/games/?search=slug works, but let's just fetch the generic endpoint for now.
                const res = await fetch(`http://127.0.0.1:8000/api/games/`);
                if (res.ok) {
                    const data = await res.json();
                    const foundGame = data.results.find(g => g.slug === slug) || data.results[0];
                    
                    if (foundGame) {
                        try {
                            const studioRes = await fetch(`http://127.0.0.1:8000/api/games/${foundGame.id}/studio/`);
                            if (studioRes.ok) {
                                const studioData = await studioRes.json();
                                foundGame.game_data = studioData.game_data || [];
                            }
                        } catch (e) {
                            console.error("Failed to fetch custom game data", e);
                        }
                    }
                    
                    setGameDetails(foundGame);
                }
            } catch (err) {
                console.error("Failed to fetch game details", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGame();
    }, [slug]);

    useEffect(() => {
        if (!gameDetails) return;

        let ActiveScene = PlatformerScene;
        let sceneKey = 'PlatformerScene';

        if (gameDetails.title.toLowerCase().includes('tic tac toe')) {
            ActiveScene = TicTacToeScene;
            sceneKey = 'TicTacToeScene';
        } else if (gameDetails.title.toLowerCase().includes('connect 4')) {
            ActiveScene = Connect4Scene;
            sceneKey = 'Connect4Scene';
        } else if (gameDetails.title.toLowerCase().includes('dots and boxes')) {
            ActiveScene = DotsAndBoxesScene;
            sceneKey = 'DotsAndBoxesScene';
        } else if (gameDetails.title.toLowerCase().includes('pong retro')) {
            ActiveScene = PongScene;
            sceneKey = 'PongScene';
        } else if (gameDetails.title.toLowerCase().includes('classic snake')) {
            ActiveScene = SnakeScene;
            sceneKey = 'SnakeScene';
        } else if (gameDetails.title.toLowerCase().includes('space invaders')) {
            ActiveScene = SpaceInvadersScene;
            sceneKey = 'SpaceInvadersScene';
        } else if (gameDetails.title.toLowerCase().includes('subway runner')) {
            ActiveScene = SubwayRunnerScene;
            sceneKey = 'SubwayRunnerScene';
        } else if (gameDetails.title.toLowerCase().includes('pac boink')) {
            ActiveScene = PacBoinkScene;
            sceneKey = 'PacBoinkScene';
        } else if (gameDetails.title.toLowerCase().includes('space boink')) {
            ActiveScene = SpaceBoinkScene;
            sceneKey = 'SpaceBoinkScene';
        } else if (gameDetails.title.toLowerCase().includes('boink racing')) {
            ActiveScene = BoinkRacingScene;
            sceneKey = 'BoinkRacingScene';
        } else if (gameDetails.title.toLowerCase().includes('boink tetris')) {
            ActiveScene = BoinkTetrisScene;
            sceneKey = 'BoinkTetrisScene';
        } else if (gameDetails.title.toLowerCase().includes('mystery boink mansion')) {
            ActiveScene = MysteryBoinkScene;
            sceneKey = 'MysteryBoinkScene';
        } else {
            ActiveScene = ComingSoonScene;
            sceneKey = 'ComingSoonScene';
        }

        setCurrentSceneKey(sceneKey);

        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: gameRef.current,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300 },
                    debug: false
                }
            },
            scene: [ActiveScene],
            backgroundColor: '#2B1D16'
        };

        const newGame = new Phaser.Game(config);
        
        // Inject custom level data for scenes to read
        if (gameDetails.game_data && gameDetails.game_data.length > 0) {
            newGame.registry.set('gameData', gameDetails.game_data);
        }
        
        setPhaserGame(newGame);

        newGame.events.on('score-changed', (newScore) => {
            setScore(newScore);
        });

        return () => {
            newGame.destroy(true);
        };
    }, [gameDetails]);

    const handlePause = () => {
        if (phaserGame) {
            if (isPlaying) {
                phaserGame.scene.pause(currentSceneKey);
            } else {
                phaserGame.scene.resume(currentSceneKey);
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleRestart = () => {
        if (phaserGame) {
            phaserGame.scene.stop(currentSceneKey);
            phaserGame.scene.start(currentSceneKey);
            setScore(0);
            setIsPlaying(true);
        }
    };

    if (isLoading) {
        return <div className="text-center py-20 text-brown-500">Loading Game Engine...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-brown-900 mb-2">{gameDetails?.title || 'Platformer Template'}</h1>
                    <p className="text-brown-600">Created by {gameDetails?.creator_username || 'BOINK Studio'}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-brown-500 uppercase tracking-widest">Score</p>
                    <p className="text-4xl font-black text-terracotta">{score}</p>
                </div>
            </header>

            <div className="bg-brown-900 p-2 sm:p-4 rounded-3xl shadow-2xl mb-6 border-4 border-brown-800">
                {/* Game Canvas Container */}
                <div 
                    ref={gameRef} 
                    className="w-full aspect-[4/3] max-h-[600px] bg-black rounded-xl overflow-hidden shadow-inner mx-auto flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:max-h-full [&>canvas]:object-contain"
                ></div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-beige">
                <button 
                    onClick={handlePause}
                    className="flex items-center gap-2 px-6 py-3 bg-brown-900 hover:bg-brown-800 text-cream rounded-full font-bold transition-colors shadow-md"
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    {isPlaying ? 'Pause' : 'Resume'}
                </button>

                <button 
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-6 py-3 bg-beige hover:bg-brown-200 text-brown-900 rounded-full font-bold transition-colors shadow-sm"
                >
                    <RotateCcw size={20} />
                    Restart
                </button>
                
                <button className="flex items-center gap-2 px-4 py-3 bg-cream-warm hover:bg-beige border border-beige-sand text-brown-900 rounded-full font-bold transition-colors shadow-sm ml-auto">
                    <Maximize2 size={20} />
                    <span className="hidden sm:inline">Fullscreen</span>
                </button>
            </div>
            
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-beige">
                <h3 className="text-xl font-bold text-brown-900 mb-4">How to play</h3>
                <ul className="space-y-2 text-brown-600">
                    <li className="flex items-center gap-3">
                        <kbd className="px-2 py-1 bg-cream-warm border border-beige-sand rounded text-brown-900 font-bold font-mono text-sm shadow-sm">↑</kbd>
                        <span>Jump over obstacles</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <kbd className="px-2 py-1 bg-cream-warm border border-beige-sand rounded text-brown-900 font-bold font-mono text-sm shadow-sm">←</kbd>
                        <kbd className="px-2 py-1 bg-cream-warm border border-beige-sand rounded text-brown-900 font-bold font-mono text-sm shadow-sm">→</kbd>
                        <span>Move left and right</span>
                    </li>
                    <li className="flex items-center gap-3 mt-4">
                        <span className="w-4 h-4 bg-yellow-400 rounded-full inline-block shadow-sm"></span>
                        <span>Collect yellow stars to earn points</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default GamePlayer;
