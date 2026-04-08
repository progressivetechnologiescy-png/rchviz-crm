import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import './Auth.css';
import { useStore } from '../store';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const login = useStore(state => state.login);
    const clients = useStore(state => state.clients);

    const toggleMode = () => setIsLogin(!isLogin);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Quick Mock Auth based on email
        let role = 'admin';
        let userProfile = { name: isLogin ? email.split('@')[0] : name, email };

        const clientMatch = clients.find(c => c.email.toLowerCase() === email.toLowerCase());

        if (clientMatch) {
            role = 'client';
            userProfile = { name: clientMatch.companyName || clientMatch.name, email, clientId: clientMatch.id };
        } else if (email.includes('@progressive') || email.includes('admin')) {
            role = email.startsWith('admin') ? 'admin' : 'employee';
            userProfile.name = isLogin ? email.split('@')[0].toUpperCase() : name;
        } else {
            // Default edge case, just make them a client for testing purposes 
            role = 'client';
            userProfile.name = isLogin ? email.split('@')[0] : name;
        }

        login(userProfile, role);
        onLogin(role);
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
            </div>

            <motion.div
                className="auth-card glass-panel"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="auth-header">
                    <div className="brand-logo mb-6">
                        <img
                            src="https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-4.png"
                            alt="Progressive Technologies"
                            className="auth-brand-logo-img"
                        />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-secondary">
                        {isLogin ? 'Sign in to access your studio workspace.' : 'Join the premier ArchViz CRM platform.'}
                    </p>
                </div>

                <div className="auth-sso-container">
                    <button className="auth-sso-btn text-sm" type="button" onClick={() => handleSubmit({ preventDefault: () => { } })}>
                        <Chrome size={18} className="text-secondary" />
                        {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                    </button>
                </div>

                <div className="auth-divider">
                    <span>or continue with email</span>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div
                                key="name-input"
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20, transition: { duration: 0.2 } }}
                                className="input-group"
                            >
                                <div className="input-with-icon">
                                    <User size={18} className="input-icon" />
                                    <input type="text" placeholder="Full Name" required={!isLogin} className="auth-input" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="input-group">
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input type="email" placeholder="Email Address" required className="auth-input" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input type="password" placeholder="Password" required className="auth-input" />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-block mt-4"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                        <ArrowRight size={16} />
                    </motion.button>
                </form>

                <div className="auth-footer">
                    <p className="text-secondary text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button type="button" onClick={toggleMode} className="auth-link">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
