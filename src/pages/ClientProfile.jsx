import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { ArrowLeft, Building, Mail, Phone, Briefcase, DollarSign, Activity } from 'lucide-react';
import './ClientProfile.css';

const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
};

const ClientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const projects = useStore(state => state.projects);
    const clients = useStore(state => state.clients);

    // Reconstruct client info from store
    const decodedName = decodeURIComponent(id);

    const clientInfo = useMemo(() => {
        // Find existing client data or derive from projects
        let baseClient = clients.find(c => c.name === decodedName);

        const clientProjects = projects.filter(p => {
            // First try strict UUID matching
            if (baseClient && p.clientId === baseClient.id) return true;
            
            // Fall back to string matching against the project's client name AND the project name itself
            const cName = decodedName.trim().toLowerCase();
            const pClientName = (p.client || '').trim().toLowerCase();
            const pProjectName = (p.name || '').trim().toLowerCase();
            
            return cName === pClientName || cName === pProjectName;
        });

        const totalValue = clientProjects.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
        const totalDeposits = clientProjects.reduce((sum, p) => sum + (Number(p.deposit) || 0), 0);
        const totalBalance = clientProjects.reduce((sum, p) => sum + (Number(p.balance) || 0), 0);

        const activeProjects = clientProjects.filter(p => p.status !== 'Completed');
        const completedProjects = clientProjects.filter(p => p.status === 'Completed');

        return {
            name: decodedName,
            email: baseClient?.email || `contact@${decodedName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
            phone: baseClient?.phone || '+357 ' + (20000000 + (decodedName.length * 123456) + (decodedName.charCodeAt(0) || 0)),
            contact: baseClient?.contact || 'Account Team',
            totalValue,
            totalDeposits,
            totalBalance,
            allProjects: clientProjects,
            activeProjects,
            completedProjects
        };
    }, [decodedName, projects, clients]);

    return (
        <motion.div
            className="client-profile-container"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
        >
            <header className="client-profile-header">
                <button className="back-btn" onClick={() => navigate('/clients')}>
                    <ArrowLeft size={16} /> Back to Clients
                </button>

                <div className="client-header-right">
                    <div className="client-title-row">
                        <div className="client-header-icon">
                            <Building size={16} />
                        </div>
                        <h1 className="client-title">{clientInfo.name}</h1>
                    </div>
                    <div className="client-contact-row">
                        <span className="contact-item">
                            <Mail size={14} /> {clientInfo.email}
                        </span>
                        <span className="contact-item">
                            <Phone size={14} /> {clientInfo.phone}
                        </span>
                    </div>
                </div>
            </header>

            {/* Metrics Row */}
            <div className="metrics-grid">
                <div className="glass-panel new-metric-card">
                    <div className="new-metric-icon">
                        <Briefcase size={28} strokeWidth={1.5} />
                    </div>
                    <div className="new-metric-content">
                        <h3 className="new-metric-label">Total Projects</h3>
                        <p className="new-metric-value">{clientInfo.allProjects.length}</p>
                        <p className="new-metric-sub">{clientInfo.activeProjects.length} Active / {clientInfo.completedProjects.length} Completed</p>
                    </div>
                </div>

                <div className="glass-panel new-metric-card">
                    <div className="new-metric-icon">
                        <DollarSign size={28} strokeWidth={1.5} />
                    </div>
                    <div className="new-metric-content">
                        <h3 className="new-metric-label">Total Pipeline Value</h3>
                        <p className="new-metric-value">€{clientInfo.totalValue.toLocaleString()}</p>
                        <p className="new-metric-sub">€{clientInfo.totalDeposits.toLocaleString()} Collected</p>
                    </div>
                </div>

                <div className="glass-panel new-metric-card">
                    <div className="new-metric-icon">
                        <Activity size={28} strokeWidth={1.5} />
                    </div>
                    <div className="new-metric-content">
                        <h3 className="new-metric-label">Outstanding Balance</h3>
                        <p className="new-metric-value">€{clientInfo.totalBalance.toLocaleString()}</p>
                        <p className="new-metric-sub">Pending collection</p>
                    </div>
                </div>
            </div>

            {/* Project List */}
            <div className="glass-panel">
                <div className="project-list-header">
                    <h2 className="project-list-title">Project History</h2>
                </div>
                {clientInfo.allProjects.length > 0 ? (
                    <table className="client-profile-table w-full text-left">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Reference</th>
                                <th>Status</th>
                                <th className="text-right">Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientInfo.allProjects.map(project => (
                                <tr key={project.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/project/${project.id}`)}>
                                    <td className="p-4">
                                        <span className="font-medium text-white">{project.name}</span>
                                    </td>
                                    <td className="p-4 text-secondary text-sm">{project.reference}</td>
                                    <td className="p-4">
                                        <span className={`badge ${project.status === 'Completed' ? 'badge-success' : 'badge-neutral'}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-medium">
                                        €{project.totalAmount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-secondary">
                        No projects found for {clientInfo.name}.
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ClientProfile;
