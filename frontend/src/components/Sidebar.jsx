import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, PlusSquare, User, Settings, Gamepad2, Users, MessageSquare, ShoppingCart } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', name: 'Home', icon: Home },
        { path: '/discover', name: 'Discover', icon: Compass },
        { path: '/create', name: 'Create', icon: PlusSquare },
        { path: '/dashboard', name: 'Dashboard', icon: Gamepad2 },
        { path: '/store', name: 'Store', icon: ShoppingCart },
        { path: '/friends', name: 'Friends', icon: Users },
        { path: '/messages', name: 'Messages', icon: MessageSquare },
        { path: '/profile', name: 'Profile', icon: User },
        { path: '/settings', name: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-brown-900 text-cream h-full flex flex-col shadow-2xl hidden md:flex">
            <div className="p-6">
                <h1 className="text-3xl font-black text-terracotta tracking-tighter">BOINK</h1>
                <p className="text-xs text-beige-sand opacity-70 uppercase tracking-widest mt-1">Studio Guide</p>
            </div>
            
            <nav className="flex-1 px-4 mt-6 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive 
                                    ? 'bg-brown-600 text-cream font-bold shadow-lg shadow-brown-900/50' 
                                    : 'text-beige hover:bg-brown-800 hover:text-cream'
                            }`}
                        >
                            <Icon size={20} className={isActive ? 'text-cream' : 'text-terracotta-accent opacity-80'} />
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
            
            <div className="p-6 text-sm text-brown-500 text-center">
                &copy; {new Date().getFullYear()} BOINK
            </div>
        </aside>
    );
};

export default Sidebar;
