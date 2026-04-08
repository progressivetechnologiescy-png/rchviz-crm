import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { Shield, Users, Save, Plus, User, CheckCircle, AlertCircle } from 'lucide-react';
import { AddUserModal } from '../components/Modals';
import { AnimatePresence } from 'framer-motion';
import './Settings.css';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
};

const Settings = () => {
    const { userRole, currentUser, updateProfile, employees } = useStore();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileName, setProfileName] = useState(currentUser?.name || '');
    const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSavePassword = (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            showToast('Please enter and confirm your new password.', 'error');
            return;
        }

        if (password === confirmPassword) {
            showToast('Master password updated successfully!', 'success');
            setPassword('');
            setConfirmPassword('');
        } else {
            showToast('Passwords do not match. Please try again.', 'error');
        }
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (!profileName.trim()) {
            showToast('Display name cannot be empty.', 'error');
            return;
        }
        updateProfile({ name: profileName, avatar: profileAvatar });
        showToast('Profile updated successfully!', 'success');
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <motion.div
            className="settings-container p-6"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
        >
            <header className="page-header mb-8">
                <div>
                    <h1 className="page-title text-2xl font-bold text-[var(--text-primary)] mb-2">Account Settings</h1>
                    <p className="page-subtitle text-secondary">Manage your preferences, security, and team access.</p>
                </div>
            </header>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md ${toast.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}
                    >
                        {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="font-medium text-sm">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="settings-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Section */}
                <section className="settings-card glass-panel transition-all">
                    <div className="settings-card-header">
                        <div className="settings-card-title">
                            <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg text-blue-400">
                                <User size={22} />
                            </div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Profile</h2>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative group shrink-0">
                                <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center justify-center overflow-hidden">
                                    {profileAvatar ? (
                                        <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-secondary" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                    <Plus size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-secondary mb-2">Display Name</label>
                                <input
                                    type="text"
                                    className="settings-input w-full"
                                    value={profileName}
                                    onChange={e => setProfileName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="btn btn-primary flex items-center gap-2">
                                <Save size={16} /> Update Profile
                            </button>
                        </div>
                    </form>
                </section>

                <section className="settings-card glass-panel transition-all">
                    <div className="settings-card-header">
                        <div className="settings-card-title">
                            <div className="p-2 bg-indigo-500 bg-opacity-20 rounded-lg text-indigo-400">
                                <Shield size={22} />
                            </div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Security & Access</h2>
                        </div>
                    </div>

                    <form onSubmit={handleSavePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">New Master Password</label>
                            <input
                                type="password"
                                className="settings-input"
                                placeholder="Enter new master password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-secondary mb-2">Confirm Master Password</label>
                            <input
                                type="password"
                                className="settings-input"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className="pt-2 mt-8">
                            <button type="submit" className="btn btn-primary flex items-center gap-2">
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </form>
                </section>

                {/* Team Management Section (Admin Only) */}
                {userRole === 'admin' && (
                    <section className="settings-card glass-panel transition-all">
                        <div className="settings-card-header">
                            <div className="settings-card-title">
                                <div className="p-2 bg-emerald-500 bg-opacity-20 rounded-lg text-emerald-400">
                                    <Users size={22} />
                                </div>
                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Team Management</h2>
                            </div>
                            <button className="btn btn-ghost btn-sm flex items-center gap-2" onClick={() => setIsAddUserOpen(true)}>
                                <Plus size={16} /> Add User
                            </button>
                        </div>

                        <div className="users-list space-y-4">
                            {employees.map(emp => (
                                <div key={emp.id} className="user-row flex items-center justify-between p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-secondary)] hover:bg-[var(--hover-bg)] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg-tertiary)] border border-[var(--glass-border)] flex items-center justify-center text-secondary font-bold text-sm">
                                            {emp.initials}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)]">{emp.name}</p>
                                            <p className="text-sm text-secondary mt-0.5 capitalize">{emp.role}</p>
                                        </div>
                                    </div>
                                    {emp.role !== 'admin' && (
                                        <div className="px-3 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--glass-border)] text-xs font-medium text-secondary">
                                            Active
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
            <AddUserModal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} />
        </motion.div>
    );
};

export default Settings;
