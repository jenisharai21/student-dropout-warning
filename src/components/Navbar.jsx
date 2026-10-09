import React from 'react';
import { 
  GraduationCap, 
  ShieldAlert, 
  TrendingUp, 
  Cpu, 
  Database, 
  RotateCcw,
  Search,
  School,
  Building2,
  Briefcase
} from 'lucide-react';
import { INSTITUTION_TYPES } from '../services/mockData.js';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  selectedInstitution, 
  setSelectedInstitution, 
  searchTerm, 
  setSearchTerm,
  onOpenDataGenerator,
  onResetData,
  totalHighRiskCount
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-top">
        <div className="brand-header">
          <div className="brand-logo-icon">
            <GraduationCap className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="brand-title">EDURAIL Early Warning System</h1>
            <p className="brand-subtitle">Predictive Analytics & Student Retention Platform (2-3 Months Advance Horizon)</p>
          </div>
        </div>

        {/* Institution Type Selector Pills */}
        <div className="institution-pills">
          {INSTITUTION_TYPES.map(inst => {
            const isActive = selectedInstitution === inst;
            return (
              <button
                key={inst}
                onClick={() => setSelectedInstitution(inst)}
                className={`inst-pill ${isActive ? 'active' : ''}`}
              >
                {inst === 'University' && <School className="w-3.5 h-3.5" />}
                {inst === 'Engineering College' && <Building2 className="w-3.5 h-3.5" />}
                {inst === 'Skill Development Program' && <Briefcase className="w-3.5 h-3.5" />}
                {inst === 'All Institutions' && <GraduationCap className="w-3.5 h-3.5" />}
                <span>{inst}</span>
              </button>
            );
          })}
        </div>

        {/* Top Actions */}
        <div className="navbar-actions">
          <button 
            onClick={onOpenDataGenerator}
            className="btn-secondary"
            title="Generate Cohorts or Upload CSV"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Cohort Generator</span>
          </button>

          <button 
            onClick={onResetData}
            className="btn-ghost"
            title="Reset to default dataset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navbar Tabs & Search */}
      <div className="navbar-bottom">
        <nav className="tab-navigation">
          <button
            onClick={() => setActiveTab('ranking')}
            className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>At-Risk Student Ranking</span>
            {totalHighRiskCount > 0 && (
              <span className="count-badge animate-pulse-slow">{totalHighRiskCount}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('outcomes')}
            className={`tab-btn ${activeTab === 'outcomes' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Intervention Outcome Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <Cpu className="w-4 h-4" />
            <span>Gradient Boosting Analytics</span>
          </button>
        </nav>

        {/* Global Search Bar */}
        {activeTab === 'ranking' && (
          <div className="search-bar-wrapper">
            <Search className="w-4 h-4 search-icon" />
            <input
              type="text"
              placeholder="Search student name, ID, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        )}
      </div>
    </header>
  );
}
