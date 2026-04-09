import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import AIChatWidget from './components/AIChatWidget';
import { useStore } from './store';
import './index.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const layoutContent = document.querySelector('.layout-content');
    if (layoutContent) {
      layoutContent.scrollTo(0, 0);
    }
    // Fallback for document scrolling just in case
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Pages
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Production from './pages/Production';
import Assets from './pages/Assets';
import Auth from './pages/Auth';
import Clients from './pages/Clients';

import ProjectDetails from './pages/ProjectDetails';
import ClientProfile from './pages/ClientProfile';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import Financials from './pages/Financials';
import Help from './pages/Help';
import Messenger from './pages/Messenger';
import LeadGenerator from './pages/LeadGenerator';

const AnimatedRoutes = ({ role }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* If logged in, /auth should redirect to dashboard */}
        <Route path="/auth" element={<Navigate to="/dashboard" replace />} />

        {/* Protected Routes */}
        {role !== 'guest' ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            {role !== 'client' && <Route path="/pipeline" element={<Pipeline />} />}
            {role !== 'client' && <Route path="/production" element={<Production />} />}
            {role !== 'client' && <Route path="/clients" element={<Clients />} />}
            {role !== 'client' && <Route path="/client/:id" element={<ClientProfile />} />}
            {role !== 'client' && <Route path="/tasks" element={<Tasks />} />}
            {role === 'admin' && <Route path="/financials" element={<Financials />} />}
            {role !== 'client' && <Route path="/messenger" element={<Messenger />} />}
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/leads" element={<LeadGenerator />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            {/* Redirect root to dashboard if authenticated */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          // If guest, any path not /auth will hit this and redirect to /auth
          <Route path="/" element={<Navigate to="/auth" replace />} />
        )}

        {/* Catch-all for any other unmatched routes */}
        <Route path="*" element={<Navigate to={role === 'guest' ? "/auth" : "/dashboard"} replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const currentUser = useStore(state => state.currentUser);
  const role = useStore(state => state.userRole) || 'guest';
  const fetchProjects = useStore(state => state.fetchProjects);
  const fetchLeads = useStore(state => state.fetchLeads);
  const fetchClients = useStore(state => state.fetchClients);
  const fetchTasks = useStore(state => state.fetchTasks);
  const fetchFolders = useStore(state => state.fetchFolders);
  const fetchAssets = useStore(state => state.fetchAssets);
  const fetchChannels = useStore(state => state.fetchChannels);
  const fetchMessages = useStore(state => state.fetchMessages);
  const fetchEmployees = useStore(state => state.fetchEmployees);
  const fetchPreferences = useStore(state => state.fetchPreferences);

  // Global Data Re-hydration
  // If the user refreshes the page, pull down fresh cloud data automatically.
  useEffect(() => {
    if (currentUser) {
      fetchProjects();
      fetchLeads();
      fetchClients();
      fetchTasks();
      fetchFolders();
      fetchAssets();
      fetchChannels();
      fetchMessages();
      fetchEmployees();
      fetchPreferences();
    }
  }, [currentUser, fetchProjects, fetchLeads, fetchClients, fetchTasks, fetchFolders, fetchAssets, fetchChannels, fetchMessages, fetchEmployees, fetchPreferences]);

  // Render auth outside of the layout and router when not logged in
  if (!currentUser) {
    return <Auth onLogin={() => { window.location.href = '/dashboard' }} />;
  }

  return (
    <div className="app-root relative w-full h-full min-h-screen">
      <div className="auth-background fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>
      <div className="relative z-10 w-full min-h-screen overflow-x-hidden">
        <BrowserRouter>
          <ScrollToTop />
          <Layout role={role}>
            <AnimatedRoutes role={role} />
          </Layout>
          <AIChatWidget />
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
