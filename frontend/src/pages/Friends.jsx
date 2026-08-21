import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Check, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const Friends = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addUserId, setAddUserId] = useState('');
    const ws = useRef(null);
    const navigate = useNavigate();
    
    const fetchFriendsData = async () => {
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                apiClient.get('social/friends/'),
                apiClient.get('social/pending_requests/')
            ]);
            setFriends(friendsRes.data.friends || []);
            setRequests(requestsRes.data || []);
        } catch (error) {
                console.error("Failed to load friends", error);
                setFriends([]);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchFriendsData();

        if (user) {
            ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/social/${user.id}/`);
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.action === 'friend_request_received') {
                    setRequests(prev => [...prev, data.payload]);
                } else if (data.action === 'friend_request_accepted') {
                    // Update friends list with new friend
                    setFriends(prev => [...prev, {
                        id: data.payload.receiver_id,
                        username: data.payload.receiver_username
                    }]);
                }
            };
        }

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [user]);

    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!addUserId.trim()) return;
        try {
            await apiClient.post('social/send_friend_request/', { username: addUserId });
            setAddUserId('');
            alert('Friend request sent!');
        } catch (e) {
            console.error(e);
            alert('Failed to send request. Check username.');
        }
    };

    const handleAccept = async (id) => {
        try {
            await apiClient.post(`social/${id}/accept_request/`);
            fetchFriendsData();
        } catch (e) {
            console.error("Failed to accept", e);
        }
    };

    const handleReject = async (id) => {
        try {
            await apiClient.post(`social/${id}/reject_request/`);
            fetchFriendsData();
        } catch (e) {
            console.error("Failed to reject", e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-brown-900 mb-2">Friends</h1>
                <p className="text-brown-600 text-lg">Connect with other creators and players.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-beige-sand mb-6">
                        <h2 className="text-xl font-bold text-brown-900 flex items-center gap-2 mb-4">
                            <UserPlus size={20} className="text-terracotta" />
                            Add a Friend
                        </h2>
                        <form onSubmit={handleSendRequest} className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Enter Username..." 
                                value={addUserId}
                                onChange={e => setAddUserId(e.target.value)}
                                className="flex-1 bg-cream-warm border border-beige-sand rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-terracotta"
                            />
                            <button type="submit" className="bg-terracotta hover:bg-terracotta-accent text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                                <Send size={16} /> Send Request
                            </button>
                        </form>
                    </section>

                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-beige-sand">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-brown-900 flex items-center gap-2">
                                <Users size={20} className="text-terracotta" />
                                My Friends ({friends.length})
                            </h2>
                            <button className="text-sm font-bold text-brown-500 hover:text-terracotta">Find Friends</button>
                        </div>
                        
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-brown-500">Loading friends...</p>
                            ) : friends.length > 0 ? (
                                friends.map((friend) => (
                                    <div key={friend.id} className="flex items-center justify-between p-4 bg-cream-warm rounded-xl border border-beige transition-colors hover:border-terracotta">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-brown-600 rounded-full flex items-center justify-center text-cream font-bold text-lg">
                                                {friend.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-brown-900">{friend.username}</h3>
                                                <p className="text-xs text-green-600 font-semibold">Online</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => navigate('/messages', { state: { selectedUserId: friend.id } })}
                                                className="px-4 py-2 bg-beige hover:bg-brown-200 text-brown-900 text-sm font-bold rounded-lg transition-colors"
                                            >
                                                Message
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-cream rounded-xl border border-dashed border-brown-300">
                                    <p className="text-brown-500">You don't have any friends yet.</p>
                                    <button className="mt-4 px-6 py-2 bg-terracotta text-cream font-bold rounded-lg hover:bg-terracotta-accent transition-colors">
                                        Find people to follow
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
                
                <div className="space-y-6">
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-beige-sand">
                        <h2 className="text-lg font-bold text-brown-900 mb-4 flex items-center gap-2">
                            <UserPlus size={18} className="text-brown-500" />
                            Friend Requests
                        </h2>
                        
                        <div className="space-y-4">
                            {requests.length > 0 ? (
                                requests.map(req => (
                                    <div key={req.id} className="flex flex-col gap-3 p-3 bg-cream-warm rounded-lg border border-beige">
                                        <div className="text-sm font-bold text-brown-900">
                                            {req.sender_username} wants to be friends.
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAccept(req.id)} className="flex-1 flex justify-center items-center gap-1 bg-terracotta hover:bg-terracotta-accent text-cream text-xs font-bold py-1.5 rounded-md transition-colors">
                                                <Check size={14} /> Accept
                                            </button>
                                            <button onClick={() => handleReject(req.id)} className="flex-1 flex justify-center items-center gap-1 bg-brown-200 hover:bg-brown-300 text-brown-900 text-xs font-bold py-1.5 rounded-md transition-colors">
                                                <X size={14} /> Ignore
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-brown-400 text-sm">
                                    No pending requests.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Friends;
