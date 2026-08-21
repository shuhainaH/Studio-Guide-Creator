import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { gamesService } from './api/services/games';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import GamePlayer from './pages/GamePlayer';
import Studio from './pages/Studio';
import Friends from './pages/Friends';
import CreatorDashboard from './pages/CreatorDashboard';
import Store from './pages/Store';
import Login from './pages/Login';
import Register from './pages/Register';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const CreateRedirect = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const handleCreateGame = async () => {
            try {
                const newGame = await gamesService.createGame({ title: 'New Game', description: 'My awesome new game' });
                navigate(`/create/${newGame.id}`);
            } catch (err) {
                console.error("Failed to create game", err);
                navigate('/dashboard');
            }
        };
        handleCreateGame();
    }, [navigate]);
    
    return <div className="p-10 text-center flex items-center justify-center h-full text-brown-600 font-bold">Creating your new game studio...</div>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="discover" element={<Discover />} />
            <Route path="game/:slug" element={<GamePlayer />} />
            <Route path="create" element={<CreateRedirect />} />
            <Route path="create/:gameId" element={<Studio />} />
            <Route path="friends" element={<Friends />} />
            <Route path="dashboard" element={<CreatorDashboard />} />
            <Route path="store" element={<Store />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
