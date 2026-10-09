import React, { useState } from 'react';
import { X, Database, Upload, Sparkles, CheckCircle } from 'lucide-react';
import { calculateStudentRisk } from '../services/mlEngine.js';

export default function DataGeneratorModal({ onClose, onGenerate }) {
  const [cohortType, setCohortType] = useState('Engineering College');
  const [sampleSize, setSampleSize] = useState(25);
  const [riskBias, setRiskBias] = useState('Realistic (25% High Risk)');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const generated = [];
      const depts = cohortType === 'University' 
        ? ['Computer Science', 'Business Admin', 'Psychology', 'Biotechnology', 'Economics']
        : cohortType === 'Engineering College'
        ? ['Computer Science & Eng', 'Mechanical Eng', 'Electrical Eng', 'Civil Eng', 'AI & Data Science']
        : ['Full-Stack Web Dev', 'Solar Energy Tech', 'CNC Operations', 'Cybersecurity', 'Cloud Ops'];

      const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Rahul', 'Sneha', 'Karan', 'Pooja', 'Arjun', 'Diya'];
      const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Rao', 'Nair', 'Joshi', 'Das'];

      for (let i = 1; i <= sampleSize; i++) {
        const id = `STU-GEN-${1000 + i}`;
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const department = depts[Math.floor(Math.random() * depts.length)];

        // Generate synthetic risk factors
        const isHigh = Math.random() < 0.28;
        const isMed = !isHigh && Math.random() < 0.45;

        const gpa = isHigh ? (1.8 + Math.random() * 0.6) : isMed ? (2.5 + Math.random() * 0.5) : (3.4 + Math.random() * 0.5);
        const gpaTrend = isHigh ? (-0.4 - Math.random() * 0.5) : isMed ? (-0.1 - Math.random() * 0.2) : (0.1 + Math.random() * 0.2);
        const attOverall = isHigh ? (55 + Math.random() * 15) : isMed ? (75 + Math.random() * 10) : (92 + Math.random() * 6);
        const attDrop = isHigh ? (20 + Math.random() * 20) : isMed ? (8 + Math.random() * 10) : (1 + Math.random() * 4);
        const consecAbs = isHigh ? Math.floor(5 + Math.random() * 6) : isMed ? Math.floor(2 + Math.random() * 2) : 0;
        const missedTasks = isHigh ? Math.floor(4 + Math.random() * 4) : isMed ? Math.floor(1 + Math.random() * 2) : 0;
        const duesDays = isHigh ? Math.floor(35 + Math.random() * 40) : 0;

        const student = {
          id,
          name,
          institution_type: cohortType,
          department,
          semester: cohortType === 'Skill Development Program' ? 'Batch 4 (Month 2)' : 'Semester 4',
          email: `${name.toLowerCase().replace(' ', '.')}@edu-gen.org`,
          phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
          avatar: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=150&q=80`,
          gpa: parseFloat(gpa.toFixed(2)),
          gpa_trend: parseFloat(gpaTrend.toFixed(2)),
          failed_credits: isHigh ? 3 : 0,
          quiz_completion_rate: parseFloat((attOverall * 0.9).toFixed(1)),
          attendance_overall_pct: parseFloat(attOverall.toFixed(1)),
          attendance_recent_30d_drop_pct: parseFloat(attDrop.toFixed(1)),
          consecutive_absences: consecAbs,
          assignment_ontime_rate: parseFloat((100 - missedTasks * 12).toFixed(1)),
          assignment_delay_avg_hours: isHigh ? 72 : 12,
          missed_assignments_count: missedTasks,
          lms_weekly_logins: isHigh ? 2 : 14,
          library_checkout_count: isHigh ? 1 : 6,
          digital_research_hours: isHigh ? 3 : 20,
          tuition_due_days: duesDays,
          scholarship_warning: isHigh && Math.random() > 0.4 ? 1 : 0,
          admin_hold: duesDays > 40 ? 1 : 0,
          financial_aid_status: duesDays > 0 ? 'Pending Dues' : 'Full Aid / Paid',
          attendance_history: [90, 84, 76, 68, Math.round(attOverall)],
          gpa_history: [3.2, 2.9, parseFloat(gpa.toFixed(2))]
        };

        const ml = calculateStudentRisk(student);
        generated.push({
          ...student,
          dropout_prob: ml.probability,
          risk_tier: ml.riskTier,
          months_advance: ml.monthsAdvance,
          shap_values: ml.shapValues,
          recommended_interventions: ml.interventions
        });
      }

      onGenerate(generated);
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-md">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Synthetic Cohort Generator</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <p className="text-xs text-slate-300">
            Simulate anonymized student dataset with realistic academic, attendance, assignment, and financial parameters for model testing.
          </p>

          <div>
            <label className="input-label">Target Institution Type</label>
            <select
              value={cohortType}
              onChange={(e) => setCohortType(e.target.value)}
              className="custom-input text-xs"
            >
              <option value="University">State University</option>
              <option value="Engineering College">Engineering & Tech Institute</option>
              <option value="Skill Development Program">Government Skill Development Program</option>
            </select>
          </div>

          <div>
            <label className="input-label">Cohort Sample Size</label>
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="custom-input text-xs"
            >
              <option value={15}>15 Students (Quick Test)</option>
              <option value={30}>30 Students (Standard Batch)</option>
              <option value={60}>60 Students (Full Cohort)</option>
            </select>
          </div>

          <div>
            <label className="input-label">Risk Distribution Preset</label>
            <select
              value={riskBias}
              onChange={(e) => setRiskBias(e.target.value)}
              className="custom-input text-xs"
            >
              <option value="Realistic (25% High Risk)">Realistic Distribution (~28% High Risk, 40% Med Risk)</option>
              <option value="High Risk Heavy (50% High Risk)">High Risk Heavy (~50% High Risk Alerts)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isProcessing}
              className="btn-primary text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Generating Cohort...' : 'Generate & Process ML'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
