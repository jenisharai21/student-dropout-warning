import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import MetricCards from './components/MetricCards.jsx';
import StudentTable from './components/StudentTable.jsx';
import StudentDetailModal from './components/StudentDetailModal.jsx';
import InterventionTracker from './components/InterventionTracker.jsx';
import ModelAnalytics from './components/ModelAnalytics.jsx';
import InterventionModal from './components/InterventionModal.jsx';
import DataGeneratorModal from './components/DataGeneratorModal.jsx';
import { 
  getStoredStudents, 
  getStoredInterventions, 
  addIntervention, 
  updateInterventionStatus, 
  resetToDefaultData 
} from './services/storage.js';

export default function App() {
  const [students, setStudents] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [activeTab, setActiveTab] = useState('ranking');
  const [selectedInstitution, setSelectedInstitution] = useState('All Institutions');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [interventionStudent, setInterventionStudent] = useState(null);
  const [preselectedRec, setPreselectedRec] = useState(null);
  const [showDataGenerator, setShowDataGenerator] = useState(false);

  // Initial Load
  useEffect(() => {
    const loadedStudents = getStoredStudents();
    const loadedInterventions = getStoredInterventions();
    setStudents(loadedStudents);
    setInterventions(loadedInterventions);
  }, []);

  // Filter students based on Institution & Search Term
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchInst = selectedInstitution === 'All Institutions' || student.institution_type === selectedInstitution;
      const term = searchTerm.toLowerCase();
      const matchSearch = !term || 
        student.name.toLowerCase().includes(term) ||
        student.id.toLowerCase().includes(term) ||
        student.department.toLowerCase().includes(term);
      return matchInst && matchSearch;
    });
  }, [students, selectedInstitution, searchTerm]);

  // High Risk Count for Navbar Badge
  const highRiskCount = useMemo(() => {
    return filteredStudents.filter(s => s.risk_tier === 'High').length;
  }, [filteredStudents]);

  // Handle Log New Intervention
  const handleSaveIntervention = (newIntervention) => {
    const updatedList = addIntervention(newIntervention);
    setInterventions(updatedList);
  };

  // Handle Update Status
  const handleUpdateStatus = (interventionId, newStatus, notes) => {
    const updatedList = updateInterventionStatus(interventionId, newStatus, notes);
    setInterventions(updatedList);
    // Reload students as risk scores may decrease on resolution
    setStudents(getStoredStudents());
  };

  // Handle Generated Cohort
  const handleCohortGenerated = (newStudents) => {
    setStudents(prev => [...newStudents, ...prev]);
  };

  // Handle Data Reset
  const handleResetData = () => {
    if (window.confirm('Reset student records and intervention logs to default data?')) {
      const reset = resetToDefaultData();
      setStudents(reset.students);
      setInterventions(reset.interventions);
    }
  };

  const handleOpenInterventionModal = (student, recommendation = null) => {
    setInterventionStudent(student);
    setPreselectedRec(recommendation);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans pb-16">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedInstitution={selectedInstitution}
        setSelectedInstitution={setSelectedInstitution}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenDataGenerator={() => setShowDataGenerator(true)}
        onResetData={handleResetData}
        totalHighRiskCount={highRiskCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Executive Metric Cards Overview */}
        <MetricCards 
          students={filteredStudents} 
          interventions={interventions} 
        />

        {/* Tab 1: At-Risk Ranking Table */}
        {activeTab === 'ranking' && (
          <StudentTable
            students={filteredStudents}
            onSelectStudent={(student) => setSelectedStudent(student)}
            onOpenInterventionModal={handleOpenInterventionModal}
          />
        )}

        {/* Tab 2: Intervention Outcome Tracking */}
        {activeTab === 'outcomes' && (
          <InterventionTracker
            interventions={interventions}
            onUpdateStatus={handleUpdateStatus}
            onOpenNewInterventionModal={() => {
              if (filteredStudents.length > 0) {
                handleOpenInterventionModal(filteredStudents[0]);
              }
            }}
          />
        )}

        {/* Tab 3: Gradient Boosting Model Analytics */}
        {activeTab === 'analytics' && (
          <ModelAnalytics />
        )}
      </main>

      {/* Modals */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onOpenInterventionModal={handleOpenInterventionModal}
          interventions={interventions}
        />
      )}

      {interventionStudent && (
        <InterventionModal
          student={interventionStudent}
          preselectedRecommendation={preselectedRec}
          onClose={() => setInterventionStudent(null)}
          onSave={handleSaveIntervention}
        />
      )}

      {showDataGenerator && (
        <DataGeneratorModal
          onClose={() => setShowDataGenerator(false)}
          onGenerate={handleCohortGenerated}
        />
      )}
    </div>
  );
}
