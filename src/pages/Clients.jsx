import React, { useState, useMemo } from 'react';
import './Clients.css';
import { Search, Plus, MoreVertical, Building, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { AddClientModal, DeleteClientModal } from '../components/Modals';
import { useTranslation } from 'react-i18next';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
};

const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300 } }
};

const Clients = () => {
    const { t } = useTranslation();
    const projects = useStore(state => state.projects);
    const clients = useStore(state => state.clients);
    const updateClient = useStore(state => state.updateClient);
    const deleteClient = useStore(state => state.deleteClient);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientToDelete, setClientToDelete] = useState(null);

    const navigate = useNavigate();

    const handleSaveClient = (updatedClient) => {
        updateClient(updatedClient.id, updatedClient);
        setSelectedClient(null);
    };

    const handleDeleteClient = (id) => {
        deleteClient(id);
        setSelectedClient(null);
    };

    // Extract unique clients from projects data safely
    const uniqueClientsMap = useMemo(() => {
        const map = new Map();

        // Map manually added clients first
        clients.forEach(c => {
            const name = c.name || c.companyName || 'Unknown';
            map.set(name, { ...c, name });
        });

        projects.forEach(p => {
            const pClient = p.client || 'Unknown';
            if (!map.has(pClient)) {
                map.set(pClient, {
                    id: `client-${pClient.replace(/\s+/g, '-').toLowerCase()}`,
                    name: pClient,
                    contact: p.assignee === 'PT' ? 'Account Team' : p.assignee,
                    email: `contact@${pClient.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
                    phone: '+357 ' + (20000000 + (pClient.length * 123456) + pClient.charCodeAt(0)), // Deterministic Mock CY numbers
                    activeProjects: [p.name],
                    totalProjects: 1,
                    totalValue: `€${p.totalAmount?.toLocaleString() || 0}`
                });
            } else {
                const clientInfo = map.get(pClient);
                if (!Array.isArray(clientInfo.activeProjects)) {
                    clientInfo.activeProjects = [];
                }
                if (!clientInfo.activeProjects.includes(p.name)) {
                    clientInfo.activeProjects.push(p.name);
                }
                clientInfo.totalProjects = (clientInfo.totalProjects || 1) + 1;
                // Optional: summarize value if needed, for now just using the first or simple logic 
            }
        });

        return map;
    }, [clients, projects]);

    const clientsList = Array.from(uniqueClientsMap.values());

    const filteredClients = clientsList
        .filter(client => (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const nameA = a.name || '';
            const nameB = b.name || '';
            if (sortDirection === 'asc') return nameA.localeCompare(nameB);
            if (sortDirection === 'desc') return nameB.localeCompare(nameA);
            return 0;
        });

    return (
        <motion.div
            className="clients-container"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('client_directory', 'Client Directory')}</h1>
                    <p className="page-subtitle">{t('manage_studio_relationships', 'Manage your studio relationships and contact info.')}</p>
                </div>
                <div className="header-actions">
                    <div className="search-wrap">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t('find_client', 'Find client...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="dashboard-select"
                        value={sortDirection}
                        onChange={(e) => setSortDirection(e.target.value)}
                        style={{ height: '36px' }}
                    >
                        <option value="asc">{t('sort_az', 'Sort: A-Z')}</option>
                        <option value="desc">{t('sort_za', 'Sort: Z-A')}</option>
                    </select>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setSelectedClient(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus size={16} />
                        <span>{t('add_client', 'Add Client')}</span>
                    </button>
                </div>
            </header>

            <div className="table-container glass-panel">
                <table className="clients-table">
                    <thead>
                        <tr>
                            <th>{t('company', 'Company').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}</th>
                            <th>{t('total_value', 'Total Value').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}</th>
                            <th>{t('active_projects', 'Active Projects').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}</th>
                            <th className="text-center">{t('total_projects', 'Total Projects').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}</th>
                            <th className="text-right">{t('actions', 'Actions').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr
                                key={client.id}
                                className="table-row cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => navigate(`/client/${client.name}`)}
                            >
                                <td>
                                    <div className="client-brand-group">
                                        <div className="client-avatar">
                                            <Building size={16} />
                                        </div>
                                        <span className="client-name">{client.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="text-accent-cyan font-medium">{client.totalValue}</span>
                                </td>
                                <td>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(client.activeProjects) && client.activeProjects.length > 0 ? (
                                            client.activeProjects.map((pName, idx) => (
                                                <span key={idx} className="badge badge-neutral shadow-sm whitespace-nowrap">{pName}</span>
                                            ))
                                        ) : (
                                            <span className="text-secondary text-sm italic">{t('none', 'None')}</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex justify-center items-center h-full">
                                        <div className="bg-[var(--input-bg)] px-3 py-1 rounded-full text-[var(--text-primary)] font-medium shadow-sm border border-[var(--glass-border)]">
                                            {client.totalProjects || client.activeProjects?.length || 0}
                                        </div>
                                    </div>
                                </td>
                                <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            className="btn-icon hover:bg-accent-cyan/20 hover:text-accent-cyan transition-colors"
                                            title="Edit Client"
                                            onClick={() => {
                                                setSelectedClient(client);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn-icon hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                            title="Delete Client"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setClientToDelete(client);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredClients.length === 0 && (
                    <div className="empty-state">
                        <p className="text-secondary">{t('no_clients_found', 'No clients found matching your search.')}</p>
                    </div>
                )}
            </div>

            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setTimeout(() => setSelectedClient(null), 200);
                }}
                client={selectedClient}
            />

            <DeleteClientModal
                isOpen={!!clientToDelete}
                onClose={() => setClientToDelete(null)}
                clientName={clientToDelete?.name}
                onConfirm={() => {
                    if (clientToDelete) {
                        handleDeleteClient(clientToDelete.id);
                        setClientToDelete(null);
                    }
                }}
            />
        </motion.div>
    );
};

export default Clients;
