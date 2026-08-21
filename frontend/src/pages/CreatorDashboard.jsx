import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Users, Gamepad2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { gamesService } from '../api/services/games';

import apiClient from '../api/client';

import TicTacToe from '../games/TicTacToe';
import Connect4 from '../games/Connect4';

const CreatorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [myGames, setMyGames] = useState([]);
    const [stats, setStats] = useState({
        chart_data: [],
        metrics: { total_plays: 0, total_revenue: 0, active_players: 0 }
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateGame = async () => {
        setIsCreating(true);
        try {
            const newGame = await gamesService.createGame({ title: 'New Game', description: 'My awesome new game' });
            navigate(`/create/${newGame.id}`);
        } catch (err) {
            console.error("Failed to create game", err);
            alert("Failed to create game. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        const fetchMyGames = async () => {
            try {
                const data = await gamesService.getAllGames();
                setMyGames(data.results || data);
                
                const statsResponse = await apiClient.get('analytics/dashboard/');
                setStats(statsResponse.data);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyGames();
    }, []);

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-brown-900 mb-2">Creator Dashboard</h1>
                <p className="text-brown-600 text-lg">Track your game performance and earnings.</p>
            </header>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-bold text-brown-500 uppercase tracking-wider">Total Plays</p>
                            <h3 className="text-3xl font-black text-brown-900 mt-1">{stats.metrics.total_plays.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-cream rounded-xl text-terracotta">
                            <Gamepad2 size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-bold text-brown-500 uppercase tracking-wider">Active Players</p>
                            <h3 className="text-3xl font-black text-brown-900 mt-1">{stats.metrics.active_players.toLocaleString()}</h3>
                        </div>
                        <div className="p-3 bg-cream rounded-xl text-terracotta">
                            <Users size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-bold text-brown-500 uppercase tracking-wider">Revenue (Coins)</p>
                            <h3 className="text-3xl font-black text-brown-900 mt-1">{stats.metrics.total_revenue.toLocaleString()} 🪙</h3>
                        </div>
                        <div className="p-3 bg-cream rounded-xl text-terracotta">
                            <BarChart2 size={24} />
                        </div>
                    </div>
                    <p className="text-sm text-green-600 font-bold flex items-center gap-1">
                        <TrendingUp size={16} /> +22.4% from last week
                    </p>
                </motion.div>
                
                <motion.div 
                    onClick={!isCreating ? handleCreateGame : undefined}
                    whileHover={{ y: -5 }} 
                    className={`bg-brown-900 p-6 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group ${!isCreating ? 'cursor-pointer' : 'opacity-80 cursor-wait'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-terracotta/20 to-transparent"></div>
                    <h3 className="text-xl font-bold text-cream relative z-10 mb-2">{isCreating ? 'Creating...' : 'Create New Game'}</h3>
                    <p className="text-sm text-beige-sand relative z-10">Launch your next hit</p>
                </motion.div>
            </div>

            {/* Mini Games Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-brown-900 mb-6">Quick Play / Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TicTacToe />
                    <Connect4 />
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-brown-900">Engagement & Revenue Overview</h2>
                    <select className="bg-cream border border-beige-sand rounded-lg px-3 py-1.5 text-sm font-bold text-brown-900 focus:outline-none focus:ring-1 focus:ring-terracotta">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>All Time</option>
                    </select>
                </div>
                
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.chart_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EAD8C5" vertical={false} />
                            <XAxis dataKey="name" stroke="#8B5E3C" tick={{fill: '#8B5E3C'}} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" stroke="#B86B45" tick={{fill: '#8B5E3C'}} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#6F4E37" tick={{fill: '#8B5E3C'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#2B1D16', border: 'none', borderRadius: '8px', color: '#FFF8F0' }}
                                itemStyle={{ color: '#EAD8C5' }}
                            />
                            <Line yAxisId="left" type="monotone" dataKey="plays" stroke="#B86B45" strokeWidth={3} dot={{r: 4, fill: '#B86B45'}} activeDot={{r: 6}} />
                            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3A261C" strokeWidth={3} dot={{r: 4, fill: '#3A261C'}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* My Games List */}
            <div className="bg-white rounded-2xl shadow-sm border border-beige-sand overflow-hidden">
                <div className="p-6 border-b border-beige-sand">
                    <h2 className="text-xl font-bold text-brown-900">My Published Games</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-cream-warm text-sm text-brown-500 border-b border-beige-sand">
                                <th className="p-4 font-bold">Game Name</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Total Plays</th>
                                <th className="p-4 font-bold text-right">Revenue</th>
                                <th className="p-4 font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="p-4 text-center text-brown-500">Loading your games...</td></tr>
                            ) : myGames.length > 0 ? (
                                myGames.map((game) => (
                                    <tr key={game.id} className="border-b border-beige-sand last:border-0 hover:bg-cream/50 transition-colors">
                                        <td className="p-4 font-bold text-brown-900">{game.title}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Live</span>
                                        </td>
                                        <td className="p-4 text-right font-semibold text-brown-600">{game.play_count || 0}</td>
                                        <td className="p-4 text-right font-semibold text-terracotta">{game.play_count * 10 || 0} 🪙</td>
                                        <td className="p-4 text-center space-x-4">
                                            <Link to={`/create/${game.id}`} className="text-sm text-brown-500 hover:text-terracotta font-bold">Edit</Link>
                                            <Link to={`/game/${game.slug}`} className="text-sm text-brown-500 hover:text-terracotta font-bold">View</Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-4 text-center text-brown-500">You haven't published any games yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CreatorDashboard;
