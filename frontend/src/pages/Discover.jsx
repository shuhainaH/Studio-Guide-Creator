import { useState, useEffect } from 'react';
import { gamesService } from '../api/services/games';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Play, Star, Users, Share2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

const Discover = () => {
    const [games, setGames] = [useState([]), useState([])][0];
    const [categories, setCategories] = [useState([]), useState([])][0];
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [shareGame, setShareGame] = useState(null);
    const [friends, setFriends] = useState([]);
    
    // Fetch friends for sharing
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await apiClient.get('social/friends/');
                setFriends(res.data.friends || []);
            } catch (err) {
                console.error("Failed to load friends", err);
            }
        };
        fetchFriends();
    }, []);

    const handleShare = async (friendId) => {
        if (!shareGame) return;
        try {
            await apiClient.post('chat/messages/', {
                recipient_id: friendId,
                content: `Check out this game: ${shareGame.title}! Play it here: /play/${shareGame.slug}`
            });
            alert('Game shared!');
            setShareGame(null);
        } catch (e) {
            console.error(e);
            alert('Failed to share game.');
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await gamesService.getCategories();
                setCategories(data.results || data);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            try {
                const params = {};
                if (search) params.search = search;
                if (selectedCategory) params.category = selectedCategory;
                
                const data = await gamesService.getAllGames(params);
                setGames(data.results || data);
            } catch (err) {
                console.error("Failed to load games", err);
            } finally {
                setLoading(false);
            }
        };
        
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchGames();
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [search, selectedCategory]);

    return (
        <div className="pb-10">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-brown-900 mb-2">Discover Games</h1>
                <p className="text-brown-600 text-lg mb-6">Find your next favorite adventure created by the community.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-beige">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-500" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search games, tags..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-cream border border-beige-sand rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all text-brown-900 placeholder-brown-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="text-brown-500 hidden sm:block" size={20} />
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-cream border border-beige-sand rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-terracotta text-brown-900 cursor-pointer w-full sm:w-auto"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                <button 
                    onClick={() => setSelectedCategory('')}
                    className={`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === '' ? 'bg-brown-900 text-cream' : 'bg-beige text-brown-800 hover:bg-brown-200'}`}
                >
                    Trending
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id.toString())}
                        className={`px-5 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === cat.id.toString() ? 'bg-terracotta text-cream' : 'bg-beige text-brown-800 hover:bg-brown-300'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="animate-pulse bg-white rounded-2xl h-72 border border-beige-sand">
                            <div className="h-48 bg-beige rounded-t-2xl"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-beige rounded w-3/4"></div>
                                <div className="h-3 bg-beige rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : games.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {games.map((game, i) => (
                        <motion.div 
                            key={game.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-cream-warm rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-beige transition-all group relative"
                        >
                            <Link to={`/game/${game.slug}`} className="absolute inset-0 z-10"></Link>
                            <div className="h-48 bg-brown-800 relative">
                                {game.thumbnail && (
                                    <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="self-end bg-terracotta text-cream rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20">
                                        <Play fill="currentColor" size={24} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-brown-900 mb-1 line-clamp-1">{game.title}</h3>
                                <p className="text-sm text-brown-500 mb-3 line-clamp-1">by {game.creator_username}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 bg-beige rounded-md text-brown-600">
                                        {game.category_name || 'Uncategorized'}
                                    </span>
                                    <div className="flex items-center gap-3 text-brown-500 text-xs font-bold">
                                        <span className="flex items-center gap-1"><Users size={14} /> {game.play_count}</span>
                                        <span className="flex items-center gap-1"><Star size={14} /> {game.like_count}</span>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); setShareGame(game); }}
                                            className="relative z-20 hover:text-terracotta transition-colors ml-1"
                                            title="Share Game"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-beige-sand">
                    <Search className="mx-auto text-brown-300 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-brown-900 mb-2">No games found</h3>
                    <p className="text-brown-500">Try adjusting your search or filters.</p>
                </div>
            )}
            
            <AnimatePresence>
                {shareGame && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-brown-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-beige-sand"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black text-brown-900 text-lg">Share "{shareGame.title}"</h3>
                                <button onClick={() => setShareGame(null)} className="text-brown-400 hover:text-brown-900">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {friends.length > 0 ? friends.map(friend => (
                                    <div key={friend.id} className="flex justify-between items-center p-3 bg-cream-warm rounded-xl border border-beige">
                                        <span className="font-bold text-brown-900">{friend.username}</span>
                                        <button 
                                            onClick={() => handleShare(friend.id)}
                                            className="bg-terracotta text-white px-3 py-1 text-xs font-bold rounded-lg hover:bg-terracotta-accent transition-colors"
                                        >
                                            Send
                                        </button>
                                    </div>
                                )) : (
                                    <p className="text-sm text-brown-500 text-center py-4">You have no friends to share with.</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Discover;
