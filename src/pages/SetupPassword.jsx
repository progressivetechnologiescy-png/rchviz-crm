import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import './Auth.css';

const SetupPassword = () => {
    const { t } = useTranslation();
    const login = useStore(state => state.login);
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const qs = new URLSearchParams(window.location.search);
    const token = qs.get('token');
    const email = qs.get('email');

    if (!token || !email) {
        return (
            <div className="auth-container">
                <div className="auth-card glass-panel text-center p-8">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Invalid Invite Link</h2>
                    <p className="text-secondary mb-6">This setup link is missing or malformed.</p>
                    <button className="btn btn-primary w-full" onClick={() => window.location.href = '/auth'}>
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_BASE}/api/auth/setup-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, password })
            });

            const json = await res.json();
            if (json.success) {
                setSuccess(true);
                // We securely set the browser localStorage JWT just like Auth.jsx does
                localStorage.setItem('crm_token', json.token);
                // Call store login to hydrate Zustand
                login(json.user, json.user.role);
                
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                setError(json.error || 'Failed to set password. Link may be expired.');
            }
        } catch (err) {
            setError('Network error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div 
                className="auth-card glass-panel"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="auth-header text-center mb-8">
                    <div className="auth-logo mx-auto mb-4 bg-blue-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center border border-blue-500/20">
                        <Shield className="text-blue-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome to ArchViz</h1>
                    <p className="text-secondary text-sm">Create your master password for <span className="text-white font-medium">{email}</span></p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg flex items-center gap-2 mb-6"
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {success ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                    >
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                            <CheckCircle className="text-emerald-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Password Set!</h3>
                        <p className="text-secondary">Redirecting to your dashboard...</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="auth-input-group">
                            <label className="text-sm font-medium text-secondary mb-1.5 block">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                                    <Key size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="auth-input w-full pl-10 pr-10 py-3 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg text-white placeholder-secondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                    placeholder="Enter secure password"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="auth-input-group mb-6">
                            <label className="text-sm font-medium text-secondary mb-1.5 block">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                                    <CheckCircle size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="auth-input w-full pl-10 pr-10 py-3 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg text-white placeholder-secondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                    placeholder="Repeat password"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="btn btn-primary w-full py-3 text-base flex items-center justify-center gap-2 mt-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {isLoading ? 'Saving...' : 'Set Password'} 
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default SetupPassword;
