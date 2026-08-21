import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid username or password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
            <Link to="/" className="flex items-center gap-2 mb-8 text-terracotta hover:text-brown-900 transition-colors">
                <Gamepad2 size={32} />
                <span className="text-2xl font-black tracking-tighter">BOINK</span>
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border border-beige-sand"
            >
                <h1 className="text-2xl font-bold text-brown-900 mb-2">Welcome back!</h1>
                <p className="text-brown-500 mb-8">Ready to play or create something new?</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-brown-900 mb-1">Username</label>
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-cream border border-beige-sand rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all text-brown-900"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-bold text-brown-900">Password</label>
                            <a href="#" className="text-xs font-semibold text-terracotta hover:text-brown-900">Forgot?</a>
                        </div>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-cream border border-beige-sand rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all text-brown-900"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-brown-900 hover:bg-brown-800 text-cream font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Log In</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
                
                <p className="text-center text-sm text-brown-500 mt-8">
                    Don't have an account? <Link to="/register" className="font-bold text-terracotta hover:text-brown-900 transition-colors">Sign up here</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
