import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, MapPin, Calendar, Link as LinkIcon, Gamepad2, Star, Users, Edit3, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('games');
    const [myGames, setMyGames] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    
    useEffect(() => {
        if (!user) return;
        
        const fetchData = async () => {
            setLoadingData(true);
            try {
                if (activeTab === 'games') {
                    const res = await apiClient.get('games/my_games/');
                    setMyGames(res.data.results || res.data);
                } else if (activeTab === 'favorites') {
                    const res = await apiClient.get('games/favorites/');
                    setFavorites(res.data.results || res.data);
                } else if (activeTab === 'friends') {
                    const res = await apiClient.get('social/friends/');
                    setFriends(res.data.friends || []);
                }
            } catch (error) {
                console.error("Failed to load profile data", error);
            } finally {
                setLoadingData(false);
            }
        };
        
        fetchData();
    }, [user, activeTab]);

    if (!user) {
        return <div className="p-10 text-center">Loading profile...</div>;
    }

    const displayUser = user;

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Cover Image & Avatar */}
            <div className="relative mb-16">
                <div className="h-64 bg-brown-900 rounded-3xl overflow-hidden relative border-4 border-white shadow-md">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-colors text-sm">
                        <Edit3 size={16} /> Edit Cover
                    </button>
                </div>
                
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div className="relative">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.username}`} 
                            alt="Avatar" 
                            className="w-32 h-32 rounded-full border-4 border-cream bg-white shadow-xl"
                        />
                        <button className="absolute bottom-0 right-0 bg-terracotta text-white p-2 rounded-full shadow-lg border-2 border-cream hover:bg-terracotta-accent transition-colors">
                            <Edit3 size={14} />
                        </button>
                    </div>
                </div>
                
                <div className="absolute -bottom-12 right-8 flex gap-3">
                    <Link to="/settings" className="bg-white border border-beige-sand text-brown-900 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-cream-warm transition-colors flex items-center gap-2">
                        <Settings size={18} /> Settings
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-8">
                {/* Left Column - User Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-black text-brown-900">{displayUser.username}</h1>
                        <p className="text-brown-500 font-bold mb-4">@creator_{displayUser.username.toLowerCase()}</p>
                        <p className="text-brown-700 leading-relaxed">
                            {displayUser.profile?.bio || `Level ${displayUser.profile?.level || 1} Game Creator | I love making games with BOINK Studio.`}
                        </p>
                    </div>

                    <div className="space-y-3 text-sm font-bold text-brown-600">
                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-terracotta" />
                            <span>San Francisco, CA</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <LinkIcon size={18} className="text-terracotta" />
                            <a href="#" className="text-brown-900 hover:underline">boinkstudio.com/games</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-terracotta" />
                            <span>Joined August 2026</span>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-white border border-beige-sand rounded-2xl shadow-sm">
                        <div className="flex-1 text-center border-r border-beige-sand">
                            <h4 className="text-2xl font-black text-brown-900">{myGames.length || 0}</h4>
                            <p className="text-xs font-bold text-brown-500 uppercase">Games</p>
                        </div>
                        <div className="flex-1 text-center border-r border-beige-sand">
                            <h4 className="text-2xl font-black text-brown-900">1.2k</h4>
                            <p className="text-xs font-bold text-brown-500 uppercase">Followers</p>
                        </div>
                        <div className="flex-1 text-center">
                            <h4 className="text-2xl font-black text-brown-900">{displayUser.profile?.boink_coins || 0}</h4>
                            <p className="text-xs font-bold text-brown-500 uppercase">Boink Coins</p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Tabs and Content */}
                <div className="lg:col-span-2">
                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-beige-sand mb-6">
                        <button 
                            onClick={() => setActiveTab('games')}
                            className={`pb-4 font-bold flex items-center gap-2 transition-colors ${activeTab === 'games' ? 'text-brown-900 border-b-2 border-terracotta' : 'text-brown-500 hover:text-brown-900'}`}
                        >
                            <Gamepad2 size={18} /> My Games
                        </button>
                        <button 
                            onClick={() => setActiveTab('favorites')}
                            className={`pb-4 font-bold flex items-center gap-2 transition-colors ${activeTab === 'favorites' ? 'text-brown-900 border-b-2 border-terracotta' : 'text-brown-500 hover:text-brown-900'}`}
                        >
                            <Star size={18} /> Favorites
                        </button>
                        <button 
                            onClick={() => setActiveTab('friends')}
                            className={`pb-4 font-bold flex items-center gap-2 transition-colors ${activeTab === 'friends' ? 'text-brown-900 border-b-2 border-terracotta' : 'text-brown-500 hover:text-brown-900'}`}
                        >
                            <Users size={18} /> Friends
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {loadingData ? (
                            <div className="col-span-full py-10 text-center text-brown-500">Loading...</div>
                        ) : activeTab === 'games' || activeTab === 'favorites' ? (
                            (activeTab === 'games' ? myGames : favorites).length > 0 ? (
                                (activeTab === 'games' ? myGames : favorites).map((game) => (
                                    <div key={game.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-beige-sand group hover:shadow-md transition-all relative">
                                        <Link to={`/game/${game.slug}`} className="absolute inset-0 z-10"></Link>
                                        <div className="h-40 bg-brown-800 relative">
                                            {game.thumbnail && (
                                                <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                                <span className="bg-terracotta text-white text-xs font-bold px-2 py-1 rounded w-max mb-1">{game.category_name || 'Game'}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 relative z-20 pointer-events-none">
                                            <h3 className="font-bold text-lg text-brown-900 mb-1 line-clamp-1">{game.title}</h3>
                                            <p className="text-sm text-brown-500 line-clamp-2 mb-3">{game.description || 'No description provided.'}</p>
                                            <div className="flex items-center gap-4 text-xs font-bold text-brown-600">
                                                <span className="flex items-center gap-1"><Gamepad2 size={14} className="text-terracotta" /> {game.play_count} Plays</span>
                                                <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> {game.like_count} Likes</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-10 text-center text-brown-500 bg-white rounded-2xl border border-beige-sand">
                                    No games found in this tab.
                                </div>
                            )
                        ) : activeTab === 'friends' ? (
                            friends.length > 0 ? (
                                friends.map((friend) => (
                                    <div key={friend.id} className="bg-white p-4 rounded-2xl shadow-sm border border-beige-sand flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`} alt={friend.username} className="w-12 h-12 rounded-full border-2 border-cream bg-beige" />
                                            <div>
                                                <h3 className="font-bold text-brown-900">{friend.username}</h3>
                                                <p className="text-xs font-bold text-brown-500">Friend</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/messages', { state: { selectedUserId: friend.id } })}
                                            className="px-3 py-1.5 bg-beige hover:bg-brown-200 text-brown-900 text-xs font-bold rounded-lg transition-colors"
                                        >
                                            Message
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-10 text-center text-brown-500 bg-white rounded-2xl border border-beige-sand">
                                    You haven't added any friends yet.
                                </div>
                            )
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
