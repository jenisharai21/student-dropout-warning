import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ChevronRight, 
  UserPlus, 
  Filter, 
  ArrowUpDown,
  BookOpen,
  Calendar,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getRiskBadgeClass } from '../utils/formatters.js';

export default function StudentTable({ 
  students, 
  onSelectStudent, 
  onOpenInterventionModal 
}) {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All');
  const [sortBy, setSortBy] = useState('probability_desc');

  // Extract unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const depts = new Set(students.map(s => s.department));
    return ['All', ...Array.from(depts)];
  }, [students]);

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Filter by Risk Tier
    if (selectedRiskFilter !== 'All') {
      result = result.filter(s => s.risk_tier === selectedRiskFilter);
    }

    // Filter by Department
    if (selectedDepartmentFilter !== 'All') {
      result = result.filter(s => s.department === selectedDepartmentFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'probability_desc') return b.dropout_prob - a.dropout_prob;
      if (sortBy === 'probability_asc') return a.dropout_prob - b.dropout_prob;
      if (sortBy === 'attendance_asc') return a.attendance_overall_pct - b.attendance_overall_pct;
      if (sortBy === 'gpa_asc') return a.gpa - b.gpa;
      if (sortBy === 'dues_desc') return b.tuition_due_days - a.tuition_due_days;
      return 0;
    });

    return result;
  }, [students, selectedRiskFilter, selectedDepartmentFilter, sortBy]);

  return (
    <div className="table-card-container">
      {/* Table Filter Toolbar */}
      <div className="table-toolbar">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-200">Filter By:</span>
          
          {/* Risk Tier Filters */}
          <div className="flex items-center gap-1.5">
            {['All', 'High', 'Medium', 'Low'].map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedRiskFilter(tier)}
                className={`filter-btn ${selectedRiskFilter === tier ? 'active' : ''}`}
              >
                {tier === 'High' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block mr-1"></span>}
                {tier === 'Medium' && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1"></span>}
                {tier === 'Low' && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span>}
                {tier} {tier !== 'All' ? 'Risk' : ''}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartmentFilter}
            onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Departments</option>
            {uniqueDepartments.filter(d => d !== 'All').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="probability_desc">Dropout Probability (Highest First)</option>
            <option value="probability_asc">Dropout Probability (Lowest First)</option>
            <option value="attendance_asc">Attendance Rate (Lowest First)</option>
            <option value="gpa_asc">GPA (Lowest First)</option>
            <option value="dues_desc">Tuition Overdue Days (Highest First)</option>
          </select>
        </div>
      </div>

      {/* Student Ranking Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Rank & Student</th>
              <th>Institution / Dept</th>
              <th>Dropout Risk & Probability</th>
              <th>Est. Dropout Window</th>
              <th>Key Risk Factors (SHAP)</th>
              <th>Financial & Dues</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-slate-400">
                  No students match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, index) => {
                const badgeClass = getRiskBadgeClass(student.risk_tier);
                const topDrivers = student.shap_values?.filter(s => s.direction === 'negative').slice(0, 2) || [];
                
                return (
                  <tr key={student.id} className="table-row-hover">
                    {/* Student Name & Avatar */}
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="rank-number">#{index + 1}</span>
                        <img 
                          src={student.avatar} 
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                        />
                        <div>
                          <p 
                            onClick={() => onSelectStudent(student)}
                            className="student-name clickable-link"
                          >
                            {student.name}
                          </p>
                          <p className="student-id-text">{student.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Institution & Department */}
                    <td>
                      <p className="text-sm font-medium text-slate-200">{student.department}</p>
                      <p className="text-xs text-slate-400">{student.institution_type}</p>
                    </td>

                    {/* Risk Tier & Probability Progress Bar */}
                    <td>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`risk-badge ${badgeClass}`}>
                            {student.risk_tier === 'High' && <AlertTriangle className="w-3 h-3" />}
                            {student.risk_tier} Risk
                          </span>
                          <span className="text-sm font-bold text-slate-100">
                            {student.dropout_prob}%
                          </span>
                        </div>
                        <div className="prob-progress-bg">
                          <div 
                            className={`prob-progress-bar ${
                              student.risk_tier === 'High' ? 'bg-rose-500' :
                              student.risk_tier === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${student.dropout_prob}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Est 2-3 Month Advance Dropout Window */}
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 w-fit">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>~{student.months_advance} months away</span>
                      </div>
                    </td>

                    {/* Top SHAP Risk Drivers */}
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {topDrivers.length === 0 ? (
                          <span className="text-xs text-emerald-400 font-medium">No critical drivers</span>
                        ) : (
                          topDrivers.map((driver, idx) => (
                            <span key={idx} className="driver-tag">
                              {driver.title}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Financial Status */}
                    <td>
                      <div className="text-xs">
                        <p className={`font-medium ${student.tuition_due_days > 30 ? 'text-rose-400' : 'text-slate-300'}`}>
                          {student.financial_aid_status}
                        </p>
                        {student.tuition_due_days > 0 && (
                          <p className="text-slate-400 text-[11px]">{student.tuition_due_days} days overdue</p>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenInterventionModal(student)}
                          className="btn-action-primary"
                          title="Assign Recommended Intervention"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Intervene</span>
                        </button>

                        <button
                          onClick={() => onSelectStudent(student)}
                          className="btn-action-ghost"
                          title="View Full Risk Profile & SHAP Breakdown"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
