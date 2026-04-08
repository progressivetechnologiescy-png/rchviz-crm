import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, DollarSign, TrendingUp, CreditCard, ChevronDown, CheckCircle, AlertCircle, X, PlusCircle, RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import './Financials.css';
import { useTranslation } from 'react-i18next';

const toGreekCaps = (str) => {
    if (!str) return '';
    return str.toString().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

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

const Financials = () => {
    const { t } = useTranslation();
    const { projects, updateProjectField } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, Outstanding, Paid
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, project: null, amount: '' });

    // Calculations
    const totalRevenue = projects.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
    const totalDeposits = projects.reduce((sum, p) => sum + (Number(p.deposit) || 0), 0);
    const totalOutstanding = projects.reduce((sum, p) => sum + (Number(p.balance) || 0), 0);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.client.toLowerCase().includes(searchTerm.toLowerCase());

        const isPaid = (Number(p.balance) || 0) <= 0;
        const matchesFilter = filterStatus === 'all' ? true :
            filterStatus === 'paid' ? isPaid : !isPaid;

        return matchesSearch && matchesFilter;
    });



    const handleMarkUnpaid = (project) => {
        updateProjectField(project.id, 'deposit', 0);
        updateProjectField(project.id, 'balance', project.totalAmount);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        const { project, amount } = paymentModal;
        const payment = Number(amount) || 0;
        const currentDeposit = Number(project.deposit) || 0;
        const currentBalance = Number(project.balance) || 0;

        updateProjectField(project.id, 'deposit', currentDeposit + payment);
        updateProjectField(project.id, 'balance', currentBalance - payment);
        setPaymentModal({ isOpen: false, project: null, amount: '' });
    };

    return (
        <motion.div
            className="financials-container"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <header className="page-header mb-8">
                <div>
                    <h1 className="page-title">{t('financial_overview', 'Financial Overview')}</h1>
                    <p className="page-subtitle">{t('financial_subtitle', 'Track project billing, deposits, and outstanding balances.')}</p>
                </div>
            </header>

            {/* Metrics Row */}
            <div className="metrics-grid mb-8">
                <div className="metric-card glass-panel">
                    <div className="metric-icon bg-info bg-opacity-20 text-info">
                        <TrendingUp size={24} />
                    </div>
                    <div className="metric-content">
                        <h3 className="metric-label">{t('total_pipeline_revenue', 'Total Pipeline Revenue')}</h3>
                        <p className="metric-value" style={{ color: 'var(--status-success)' }}>€{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                <div className="metric-card glass-panel">
                    <div className="metric-icon bg-success bg-opacity-20 text-success">
                        <DollarSign size={24} />
                    </div>
                    <div className="metric-content">
                        <h3 className="metric-label">{t('deposits_collected', 'Deposits Collected')}</h3>
                        <p className="metric-value">€{totalDeposits.toLocaleString()}</p>
                    </div>
                </div>

                <div className="metric-card glass-panel border-l-4 border-l-danger">
                    <div className="metric-icon bg-danger bg-opacity-20 text-danger">
                        <CreditCard size={24} />
                    </div>
                    <div className="metric-content">
                        <h3 className="metric-label">{t('outstanding_balances', 'Outstanding Balances')}</h3>
                        <p className="metric-value" style={{ color: 'var(--status-danger)' }}>€{totalOutstanding.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="table-controls mb-4 flex justify-between items-center gap-4 flex-wrap">
                <div className="search-wrap flex-1 max-w-md">
                    <Search className="search-icon" size={16} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t('search_projects_clients', 'Search projects or clients...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group flex gap-2">
                    <button
                        className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilterStatus('all')}
                    >{t('all', 'All')}</button>
                    <button
                        className={`btn btn-sm ${filterStatus === 'outstanding' ? 'btn-primary bg-danger text-white border-none hover:bg-red-500' : 'btn-ghost'}`}
                        onClick={() => setFilterStatus('outstanding')}
                    >{t('outstanding', 'Outstanding')}</button>
                    <button
                        className={`btn btn-sm ${filterStatus === 'paid' ? 'btn-primary bg-success text-white border-none hover:bg-emerald-500' : 'btn-ghost'}`}
                        onClick={() => setFilterStatus('paid')}
                    >{t('fully_paid', 'Fully Paid')}</button>
                </div>
            </div>

            {/* Financials Table */}
            <div className="table-container glass-panel">
                <table className="financials-table w-full text-left">
                    <thead>
                        <tr>
                            <th>{toGreekCaps(t('project', 'Project'))}</th>
                            <th>{toGreekCaps(t('client', 'Client'))}</th>
                            <th className="text-right">{toGreekCaps(t('total_value', 'Total Value'))}</th>
                            <th className="text-right">{toGreekCaps(t('deposit_paid', 'Deposit Paid'))}</th>
                            <th className="text-right">{toGreekCaps(t('balance', 'Balance'))}</th>
                            <th className="text-center">{toGreekCaps(t('status', 'Status'))}</th>
                            <th className="text-right">{toGreekCaps(t('actions', 'Actions'))}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => {
                            const isPaid = (Number(project.balance) || 0) <= 0;
                            return (
                                <tr key={project.id} className="table-row hover:bg-[var(--hover-bg)] transition-colors border-b border-[var(--glass-border)] last:border-0">
                                    <td className="py-4 px-4">
                                        <div className="font-medium text-[var(--text-primary)]">{project.name}</div>
                                        <div className="text-xs text-[var(--text-secondary)] mt-1 tracking-wide">{project.reference}</div>
                                    </td>
                                    <td className="py-4 px-4 text-secondary">{project.client}</td>
                                    <td className="py-4 px-4 text-right font-medium">
                                        €{Number(project.totalAmount)?.toLocaleString() || 0}
                                    </td>
                                    <td className="py-4 px-4 text-right text-emerald-400/80">
                                        €{Number(project.deposit)?.toLocaleString() || 0}
                                    </td>
                                    <td className={`py-4 px-4 text-right font-semibold ${isPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        €{Number(project.balance)?.toLocaleString() || 0}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {isPaid ? (
                                            <span className="inline-flex items-center gap-1 text-xs badge badge-success w-full justify-center">
                                                <CheckCircle size={12} /> {t('settled', 'Settled')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs badge badge-danger w-full justify-center opacity-90">
                                                <AlertCircle size={12} /> {t('pending', 'Pending')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {!isPaid ? (
                                                <button
                                                    className="btn btn-sm btn-ghost hover:bg-success/20 hover:text-success text-xs py-1 px-2 rounded-lg transition-colors border border-glass/30 shadow-sm"
                                                    onClick={() => setPaymentModal({ isOpen: true, project, amount: Number(project.balance) || 0 })}
                                                    title={t('add_payment', 'Add Payment')}
                                                >
                                                    <PlusCircle size={14} /> {t('add_payment', 'Add Payment')}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-sm btn-ghost hover:bg-danger/20 hover:text-danger text-xs py-1 px-2 rounded-lg transition-colors border border-glass/30 shadow-sm"
                                                    onClick={() => handleMarkUnpaid(project)}
                                                    title={t('mark_unpaid', 'Mark Unpaid')}
                                                >
                                                    <RotateCcw size={14} /> {t('unpaid', 'Unpaid')}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredProjects.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-secondary">
                                    {t('no_financial_records', 'No financial records found matching your criteria.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* Payment Modal */}
            <AnimatePresence>
                {paymentModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPaymentModal({ isOpen: false, project: null, amount: '' })}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-4 border-b border-[var(--glass-border)] bg-[var(--hover-bg)]">
                                <h3 className="font-semibold text-[var(--text-primary)]">{t('record_payment', 'Record Payment')}</h3>
                                <X
                                    size={24}
                                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                                    onClick={() => setPaymentModal({ isOpen: false, project: null, amount: '' })}
                                />
                            </div>
                            <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
                                <div>
                                    <p className="text-sm text-[var(--text-secondary)] mb-1">{t('project_colon', 'Project:')} <span className="text-[var(--text-primary)] font-medium">{paymentModal.project?.name}</span></p>
                                    <p className="text-sm text-[var(--text-secondary)] mb-4">{t('current_balance_colon', 'Current Balance:')} <span className="text-[var(--status-danger)] font-medium">€{Number(paymentModal.project?.balance)?.toLocaleString() || 0}</span></p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-secondary font-medium tracking-wide">{toGreekCaps(t('amount_received_eur', 'Amount Received (€)'))}</label>
                                    <input
                                        type="number"
                                        autoFocus
                                        required
                                        min="0.01"
                                        step="0.01"
                                        max={paymentModal.project?.balance || 0}
                                        className="modal-input text-lg w-full"
                                        placeholder="0.00"
                                        value={paymentModal.amount}
                                        onChange={e => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                                    />
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button type="button" className="btn btn-ghost flex-1" onClick={() => setPaymentModal({ isOpen: false, project: null, amount: '' })}>{t('cancel', 'Cancel')}</button>
                                    <button type="submit" className="btn btn-primary flex-1">{t('save_payment', 'Save Payment')}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default Financials;
