import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Bell, Key, Save, Moon, Monitor, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../api/services/auth';

const Settings = () => {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: ''
    });
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.profile?.bio || ''
            });
        }
    }, [user]);

    const handleToggle = async (field) => {
        if (!user || !user.profile) return;
        const newValue = !user.profile[field];
        try {
            await authService.updateProfile({ [field]: newValue });
            await refreshUser();
        } catch (error) {
            console.error('Failed to update toggle:', error);
        }
    };

    const handleThemeChange = async (newTheme) => {
        try {
            await authService.updateProfile({ theme_preference: newTheme });
            await refreshUser();
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!passwords.old_password || !passwords.new_password) return;
        setSaving(true);
        try {
            await authService.changePassword(passwords.old_password, passwords.new_password);
            alert('Password changed successfully!');
            setPasswords({ old_password: '', new_password: '' });
        } catch (error) {
            console.error(error);
            alert('Failed to change password. Please check your current password.');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update User (username, email)
            if (formData.username !== user.username || formData.email !== user.email) {
                await authService.updateUser({
                    username: formData.username,
                    email: formData.email
                });
            }
            
            // Update Profile (bio)
            if (formData.bio !== user.profile?.bio) {
                await authService.updateProfile({
                    bio: formData.bio
                });
            }
            
            await refreshUser();
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings. Username might be taken.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-brown-900 mb-2">Settings</h1>
                <p className="text-brown-600 text-lg">Manage your account preferences and customize your experience.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0">
                    <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                        <button 
                            onClick={() => setActiveTab('account')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'account' ? 'bg-brown-900 text-cream' : 'text-brown-600 hover:bg-cream-warm hover:text-brown-900'}`}
                        >
                            <User size={18} /> Account Details
                        </button>
                        <button 
                            onClick={() => setActiveTab('privacy')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'privacy' ? 'bg-brown-900 text-cream' : 'text-brown-600 hover:bg-cream-warm hover:text-brown-900'}`}
                        >
                            <Shield size={18} /> Privacy & Security
                        </button>
                        <button 
                            onClick={() => setActiveTab('notifications')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'bg-brown-900 text-cream' : 'text-brown-600 hover:bg-cream-warm hover:text-brown-900'}`}
                        >
                            <Bell size={18} /> Notifications
                        </button>
                        <button 
                            onClick={() => setActiveTab('appearance')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'appearance' ? 'bg-brown-900 text-cream' : 'text-brown-600 hover:bg-cream-warm hover:text-brown-900'}`}
                        >
                            <Monitor size={18} /> Appearance
                        </button>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                    {activeTab === 'account' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand">
                                <h2 className="text-xl font-bold text-brown-900 mb-6 flex items-center gap-2"><User size={20}/> Profile Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-brown-500 mb-1">Username</label>
                                        <input 
                                            type="text" 
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className="w-full bg-cream-warm border border-beige-sand rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-terracotta text-brown-900" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-brown-500 mb-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-cream-warm border border-beige-sand rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-terracotta text-brown-900" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-brown-500 mb-1">Bio</label>
                                        <textarea 
                                            rows="3" 
                                            value={formData.bio}
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                            className="w-full bg-cream-warm border border-beige-sand rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-terracotta text-brown-900 resize-none"
                                        ></textarea>
                                    </div>
                                    <button 
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-accent disabled:bg-brown-300 text-cream rounded-xl font-bold transition-colors"
                                    >
                                        <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'privacy' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand">
                                <h2 className="text-xl font-bold text-brown-900 mb-6 flex items-center gap-2"><Key size={20}/> Change Password</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-brown-500 mb-1">Current Password</label>
                                        <input 
                                            type="password" 
                                            value={passwords.old_password}
                                            onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
                                            placeholder="••••••••" 
                                            className="w-full bg-cream-warm border border-beige-sand rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-terracotta text-brown-900" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-brown-500 mb-1">New Password</label>
                                        <input 
                                            type="password" 
                                            value={passwords.new_password}
                                            onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                                            placeholder="••••••••" 
                                            className="w-full bg-cream-warm border border-beige-sand rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-terracotta text-brown-900" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handlePasswordUpdate}
                                        disabled={saving || !passwords.old_password || !passwords.new_password}
                                        className="flex items-center gap-2 px-6 py-3 bg-brown-900 hover:bg-brown-800 disabled:bg-brown-300 text-cream rounded-xl font-bold transition-colors"
                                    >
                                        {saving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand">
                                <h2 className="text-xl font-bold text-brown-900 mb-6 flex items-center gap-2"><Eye size={20}/> Profile Visibility</h2>
                                <div className="flex items-center justify-between p-4 bg-cream-warm rounded-xl border border-beige-sand">
                                    <div>
                                        <p className="font-bold text-brown-900">Public Profile</p>
                                        <p className="text-sm text-brown-500">Allow others to see your profile and games.</p>
                                    </div>
                                    <div 
                                        onClick={() => handleToggle('is_public')}
                                        className={`w-12 h-6 ${user?.profile?.is_public ? 'bg-terracotta' : 'bg-brown-300'} rounded-full relative cursor-pointer transition-colors`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user?.profile?.is_public ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand">
                                <h2 className="text-xl font-bold text-brown-900 mb-6 flex items-center gap-2"><Bell size={20}/> Email Notifications</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Game Reviews', field: 'notify_game_reviews' },
                                        { label: 'New Followers', field: 'notify_new_followers' },
                                        { label: 'Direct Messages', field: 'notify_direct_messages' },
                                        { label: 'Platform Updates', field: 'notify_platform_updates' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-cream-warm rounded-xl border border-beige-sand">
                                            <p className="font-bold text-brown-900">{item.label}</p>
                                            <div 
                                                onClick={() => handleToggle(item.field)}
                                                className={`w-12 h-6 ${user?.profile?.[item.field] ? 'bg-terracotta' : 'bg-brown-300'} rounded-full relative cursor-pointer transition-colors`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user?.profile?.[item.field] ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-sand">
                                <h2 className="text-xl font-bold text-brown-900 mb-6 flex items-center gap-2"><Monitor size={20}/> Theme Preferences</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => handleThemeChange('light')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${user?.profile?.theme_preference === 'light' ? 'border-terracotta bg-cream' : 'border-beige-sand bg-white hover:bg-cream-warm'}`}
                                    >
                                        <Monitor className={user?.profile?.theme_preference === 'light' ? 'text-terracotta' : 'text-brown-400'} size={32} />
                                        <span className="font-bold text-brown-900">Light Mode</span>
                                    </button>
                                    <button 
                                        onClick={() => handleThemeChange('dark')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${user?.profile?.theme_preference === 'dark' ? 'border-terracotta bg-cream' : 'border-beige-sand bg-white hover:bg-cream-warm'}`}
                                    >
                                        <Moon className={user?.profile?.theme_preference === 'dark' ? 'text-terracotta' : 'text-brown-400'} size={32} />
                                        <span className="font-bold text-brown-900">Dark Mode</span>
                                    </button>
                                    <button 
                                        onClick={() => handleThemeChange('system')}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${user?.profile?.theme_preference === 'system' ? 'border-terracotta bg-cream' : 'border-beige-sand bg-white hover:bg-cream-warm'}`}
                                    >
                                        <Monitor className={user?.profile?.theme_preference === 'system' ? 'text-terracotta' : 'text-brown-400'} size={32} />
                                        <span className="font-bold text-brown-900">System Default</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Settings;
