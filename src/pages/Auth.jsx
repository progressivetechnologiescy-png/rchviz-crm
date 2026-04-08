import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import './Auth.css';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

const Auth = ({ onLogin }) => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const login = useStore(state => state.login);
    const clients = useStore(state => state.clients);

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setAuthError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        
        try {
            const endpoint = isLogin ? 'login' : 'register';
            const payload = isLogin ? { email, password } : { email, name, password, role: 'admin' };
            
            const response = await fetch(`http://localhost:3001/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store JWT locally
                localStorage.setItem('crm_token', data.token);
                // Dispatch to Zustand
                login(data.user, data.user.role);
                onLogin(data.user.role);
            } else {
                setAuthError(data.error || 'Authentication failed');
            }
        } catch (err) {
            setAuthError('Unable to connect to authentication server');
        }
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
                        {isLogin ? t('welcome_back', 'Welcome Back') : t('create_account', 'Create Account')}
                    </h2>
                    <p className="text-secondary">
                        {isLogin ? t('sign_in_desc', 'Sign in to access your studio workspace.') : t('sign_up_desc', 'Join the premier ArchViz CRM platform.')}
                    </p>
                </div>

                <div className="auth-sso-container">
                    <button className="auth-sso-btn text-sm" type="button" onClick={() => handleSubmit({ preventDefault: () => { } })}>
                        <Chrome size={18} className="text-secondary" />
                        {isLogin ? t('sign_in_google', 'Sign in with Google') : t('sign_up_google', 'Sign up with Google')}
                    </button>
                </div>

                <div className="auth-divider">
                    <span>{t('or_continue_email', 'or continue with email')}</span>
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
                                    <input type="text" placeholder={t('full_name', 'Full Name')} required={!isLogin} className="auth-input" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="input-group">
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input type="email" placeholder={t('email_address', 'Email Address')} required className="auth-input" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input type="password" placeholder={t('password', 'Password')} required className="auth-input" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                    </div>

                    {authError && <p className="text-red-500 text-sm mt-2 text-center">{authError}</p>}

                    <motion.button
                        type="submit"
                        className="btn btn-primary btn-block mt-4"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>{isLogin ? t('sign_in', 'Sign In') : t('sign_up', 'Sign Up')}</span>
                        <ArrowRight size={16} />
                    </motion.button>
                </form>

                <div className="auth-footer">
                    <p className="text-secondary text-sm">
                        {isLogin ? t('dont_have_account', "Don't have an account?") : t('already_have_account', "Already have an account?")}
                        <button type="button" onClick={toggleMode} className="auth-link">
                            {isLogin ? t('sign_up', 'Sign Up') : t('sign_in', 'Sign In')}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
