import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatWindow from './ChatWindow';
import { Home, Compass, PlusSquare, User, Gamepad2 } from 'lucide-react';

const Layout = () => {
    const location = useLocation();
    
    const bottomNav = [
        { path: '/', icon: Home },
        { path: '/discover', icon: Compass },
        { path: '/create', icon: PlusSquare },
        { path: '/dashboard', icon: Gamepad2 },
        { path: '/profile', icon: User },
    ];

    return (
        <div className="flex h-screen bg-cream overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
                <ChatWindow />
                
                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brown-900 border-t-4 border-terracotta flex justify-around items-center h-16 px-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                    {bottomNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-cream bg-brown-800' : 'text-brown-500'}`}
                            >
                                <Icon size={24} className={isActive ? 'text-terracotta' : ''} />
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    );
};

export default Layout;
