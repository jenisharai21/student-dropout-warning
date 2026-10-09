import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  UserCheck, 
  Award,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

export default function MetricCards({ students, interventions }) {
  const totalEnrolled = students.length;
  const highRiskCount = students.filter(s => s.risk_tier === 'High').length;
  const mediumRiskCount = students.filter(s => s.risk_tier === 'Medium').length;
  
  const activeInterventionsCount = interventions.filter(i => i.status === 'In Progress').length;
  const resolvedInterventions = interventions.filter(i => i.status === 'Resolved & Retained').length;
  const totalCompletedInterventions = interventions.filter(i => i.status === 'Resolved & Retained' || i.status === 'Student Dropped').length;
  
  const retentionSuccessRate = totalCompletedInterventions > 0 
    ? Math.round((resolvedInterventions / totalCompletedInterventions) * 100) 
    : 85;

  return (
    <div className="metrics-grid">
      {/* Card 1: Total Enrolled */}
      <div className="metric-card border-indigo">
        <div className="metric-header">
          <div>
            <p className="metric-label">Total Monitored Cohort</p>
            <h3 className="metric-value">{totalEnrolled} <span className="metric-unit">students</span></h3>
          </div>
          <div className="metric-icon-bg bg-indigo-500/10 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="metric-footer">
          <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 100% Monitored
          </span>
          <span className="text-slate-400">Across active programs</span>
        </div>
      </div>

      {/* Card 2: High Risk Alerts */}
      <div className="metric-card border-rose">
        <div className="metric-header">
          <div>
            <p className="metric-label">High-Risk Dropout Alerts</p>
            <h3 className="metric-value text-rose-400">{highRiskCount} <span className="metric-unit">students</span></h3>
          </div>
          <div className="metric-icon-bg bg-rose-500/10 text-rose-400 animate-pulse-slow">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="metric-footer">
          <span className="text-rose-400 font-medium inline-flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 2-3 Mo. Advance
          </span>
          <span className="text-slate-400">({mediumRiskCount} Medium Risk)</span>
        </div>
      </div>

      {/* Card 3: Active Interventions */}
      <div className="metric-card border-amber">
        <div className="metric-header">
          <div>
            <p className="metric-label">Active Interventions</p>
            <h3 className="metric-value text-amber-400">{activeInterventionsCount} <span className="metric-unit">ongoing</span></h3>
          </div>
          <div className="metric-icon-bg bg-amber-500/10 text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="metric-footer">
          <span className="text-amber-400 font-medium inline-flex items-center gap-1">
            In Counseling
          </span>
          <span className="text-slate-400">Active counselor tasks</span>
        </div>
      </div>

      {/* Card 4: Retention Success Rate */}
      <div className="metric-card border-emerald">
        <div className="metric-header">
          <div>
            <p className="metric-label">Intervention Retention Rate</p>
            <h3 className="metric-value text-emerald-400">{retentionSuccessRate}% <span className="metric-unit">retained</span></h3>
          </div>
          <div className="metric-icon-bg bg-emerald-500/10 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="metric-footer">
          <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% Boost
          </span>
          <span className="text-slate-400">{resolvedInterventions} students saved</span>
        </div>
      </div>
    </div>
  );
}
