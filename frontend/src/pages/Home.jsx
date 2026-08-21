import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    const { user } = useAuth();
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/games/');
                if (res.ok) {
                    const data = await res.json();
                    setGames(data.results.slice(0, 4));
                }
            } catch (error) {
                console.error("Failed to fetch games", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGames();
    }, []);

    return (
        <div className="space-y-10 pb-10">
            <header>
                <h1 className="text-3xl font-black text-brown-900">
                    Good evening{user ? `, ${user.username}` : ''}!
                </h1>
                <p className="text-brown-600 mt-2 text-lg">Ready to build or play something amazing today?</p>
            </header>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-brown-800">Featured Games</h2>
                    <Link to="/discover" className="text-sm font-semibold text-terracotta hover:text-brown-900 transition-colors">View All</Link>
                </div>
                
                {isLoading ? (
                    <div className="text-center py-12 text-brown-500">Loading games...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {games.map((game) => (
                            <Link to={`/game/${game.slug}`} key={game.id}>
                                <motion.div 
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="bg-cream-warm rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-beige transition-all group cursor-pointer"
                                >
                                    <div className="h-48 bg-brown-900 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="bg-terracotta text-cream rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                <Play fill="currentColor" size={24} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-brown-900 mb-1 truncate">{game.title}</h3>
                                        <p className="text-sm text-brown-500 mb-3 truncate">by {game.creator_username}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2 py-1 bg-beige rounded-md text-brown-600">
                                                ⭐ {game.average_rating || 'New'}
                                            </span>
                                            <span className="text-xs font-semibold px-2 py-1 bg-beige rounded-md text-brown-600">
                                                🎮 {game.play_count} Plays
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-brown-800">Recommended For You</h2>
                </div>
                <div className="bg-brown-900 rounded-3xl p-8 text-center text-cream relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-terracotta rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-brown-500 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-4">Discover Your Next Favorite Game</h3>
                        <p className="text-beige-sand mb-8 max-w-lg mx-auto">Explore thousands of community-created games or start building your own world with our beginner-friendly Studio.</p>
                        <button className="bg-cream text-brown-900 font-bold py-3 px-8 rounded-full hover:bg-white hover:shadow-[0_0_20px_rgba(255,248,240,0.4)] transition-all">
                            Explore Catalog
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
