import React, { useState } from 'react';
import { MonitorPlay, ArrowLeft, Image as ImageIcon, Map, Globe, Calendar, Settings, Plus, UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import './Presentations.css';

// Placeholder Components for the CMS Modules
function RenderFoldersModule({ projectId }) {
  return (
    <div className="cms-empty-state">
      <ImageIcon size={48} />
      <h3>Categorized Renders</h3>
      <p>Create folders and upload exterior, interior, and amenity renders for the interactive gallery.</p>
      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Plus size={16} /> Create Folder
      </button>
    </div>
  );
}

function FloorplanModule({ projectId }) {
  return (
    <div className="cms-empty-state">
      <Map size={48} />
      <h3>Multi-Floorplan Management</h3>
      <p>Upload layout plans and assign them custom labels (e.g., "Penthouse", "Ground Floor").</p>
      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <UploadCloud size={16} /> Upload Floorplan
      </button>
    </div>
  );
}

function VirtualTourModule({ projectId }) {
  return (
    <div className="cms-empty-state">
      <Globe size={48} />
      <h3>360° Virtual Tour Builder</h3>
      <p>Upload panoramic spheres and use the hotspot editor to link rooms together.</p>
      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <UploadCloud size={16} /> Upload Panorama
      </button>
    </div>
  );
}

function AvailabilityModule({ projectId }) {
  return (
    <div className="cms-empty-state">
      <Calendar size={48} />
      <h3>Real-Time Availability</h3>
      <p>Manage the inventory data grid (Unit #, Beds, Baths, Price, Status) for the presentation app.</p>
      <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Plus size={16} /> Add Unit
      </button>
    </div>
  );
}

export default function Presentations() {
  const { t } = useTranslation();
  const projects = useStore(state => state.projects) || [];
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('renders');

  if (selectedProject) {
    return (
      <div className="presentations-page">
        <div className="cms-dashboard">
          <div className="cms-header">
            <button className="cms-back-btn" onClick={() => setSelectedProject(null)}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 4px 0' }}>{selectedProject.name}</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Presentation CMS Editor</p>
            </div>
          </div>

          <div className="cms-tabs">
            <button className={`cms-tab ${activeTab === 'renders' ? 'active' : ''}`} onClick={() => setActiveTab('renders')}>
              <ImageIcon size={16} /> Renders
            </button>
            <button className={`cms-tab ${activeTab === 'floorplans' ? 'active' : ''}`} onClick={() => setActiveTab('floorplans')}>
              <Map size={16} /> Floorplans
            </button>
            <button className={`cms-tab ${activeTab === 'tours' ? 'active' : ''}`} onClick={() => setActiveTab('tours')}>
              <Globe size={16} /> 360° Tours
            </button>
            <button className={`cms-tab ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>
              <Calendar size={16} /> Availability
            </button>
            <button className={`cms-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={16} /> AI Settings
            </button>
          </div>

          <div className="cms-content">
            {activeTab === 'renders' && <RenderFoldersModule projectId={selectedProject.id} />}
            {activeTab === 'floorplans' && <FloorplanModule projectId={selectedProject.id} />}
            {activeTab === 'tours' && <VirtualTourModule projectId={selectedProject.id} />}
            {activeTab === 'availability' && <AvailabilityModule projectId={selectedProject.id} />}
            {activeTab === 'settings' && (
              <div className="cms-empty-state">
                <Settings size={48} />
                <h3>AI Configuration</h3>
                <p>Manage Gemini API keys and Emma's system context prompt here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="presentations-page">
      <div className="presentations-header">
        <h1>Presentation CMS</h1>
        <p>Manage the content, 3D assets, and interactive elements for your Standalone 3D Viewers.</p>
      </div>

      <div className="presentations-grid">
        {projects.map(project => (
          <div key={project.id} className="presentation-card" onClick={() => setSelectedProject(project)}>
            <div className="presentation-card-header">
              <div className="presentation-card-icon">
                <MonitorPlay size={24} />
              </div>
              <span className="presentation-card-status">Active</span>
            </div>
            <h3>{project.name}</h3>
            <p>{project.address || 'No address specified'}</p>
            <div className="presentation-card-footer">
              <span>{project.client_name || 'Internal'}</span>
              <span>Open CMS &rarr;</span>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>No projects found. Create a project in the Dashboard first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
