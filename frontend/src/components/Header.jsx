import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="h-20 bg-cream-warm border-b border-beige-sand flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <button className="md:hidden text-brown-900 p-2 rounded-lg hover:bg-beige transition-colors">
                    <Menu size={24} />
                </button>
                
                <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search games, creators..." 
                        className="w-full bg-cream border border-beige-sand rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta transition-all text-brown-900 placeholder-brown-500 shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-brown-600 hover:bg-beige rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-terracotta rounded-full border-2 border-cream-warm"></span>
                </button>
                
                <Link to="/create" className="hidden sm:flex items-center gap-2 bg-terracotta hover:bg-terracotta-accent text-cream font-bold py-2 px-5 rounded-full transition-all shadow-lg hover:shadow-terracotta/50 transform hover:-translate-y-0.5">
                    Create Game
                </Link>

                <div className="flex items-center gap-3 ml-2 border-l border-beige-sand pl-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex items-center gap-4 text-sm font-bold bg-cream px-3 py-1.5 rounded-xl border border-beige-sand shadow-inner">
                                <div className="flex items-center gap-1 text-brown-900" title="Level">
                                    <span className="text-terracotta bg-beige rounded px-1 text-xs">LVL</span>
                                    {user.profile?.level || 1}
                                </div>
                                <div className="w-px h-4 bg-beige-sand"></div>
                                <div className="flex items-center gap-1 text-brown-900" title="Boink Coins">
                                    <span className="text-yellow-600">🪙</span>
                                    {user.profile?.boink_coins || 0}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 cursor-pointer group relative">
                                <div className="w-10 h-10 rounded-full bg-brown-600 flex items-center justify-center text-cream font-bold overflow-hidden shadow-md border-2 border-transparent group-hover:border-terracotta transition-all">
                                    {user.profile?.avatar ? (
                                        <img src={user.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        user.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="hidden lg:block text-sm">
                                    <p className="font-bold text-brown-900 leading-none">{user.username}</p>
                                    <button onClick={logout} className="text-xs text-brown-500 hover:text-terracotta mt-1 transition-colors">Logout</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Link to="/login" className="text-brown-900 hover:text-terracotta font-medium px-3 py-2 transition-colors">Login</Link>
                            <Link to="/register" className="bg-brown-900 hover:bg-brown-800 text-cream px-4 py-2 rounded-full font-medium transition-colors">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
