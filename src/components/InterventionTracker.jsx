import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserCheck, 
  Award, 
  TrendingUp, 
  Plus,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDate } from '../utils/formatters.js';

export default function InterventionTracker({ 
  interventions, 
  onUpdateStatus, 
  onOpenNewInterventionModal 
}) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [newStatus, setNewStatus] = useState('Resolved & Retained');
  const [counselorNotes, setCounselorNotes] = useState('');

  // Summary Metrics
  const totalCount = interventions.length;
  const retainedCount = interventions.filter(i => i.status === 'Resolved & Retained').length;
  const inProgressCount = interventions.filter(i => i.status === 'In Progress').length;
  const droppedCount = interventions.filter(i => i.status === 'Student Dropped').length;
  const successRate = (retainedCount + droppedCount) > 0 
    ? Math.round((retainedCount / (retainedCount + droppedCount)) * 100) 
    : 85;

  // Filtered interventions
  const filteredList = filterStatus === 'All' 
    ? interventions 
    : interventions.filter(i => i.status === filterStatus);

  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (!editingIntervention) return;

    onUpdateStatus(editingIntervention.id, newStatus, counselorNotes);

    if (newStatus === 'Resolved & Retained') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    setEditingIntervention(null);
    setCounselorNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Retention Impact Summary */}
      <div className="retention-summary-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Award className="w-5 h-5" />
              <span>Intervention Outcome & Retention Tracking</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              Measuring Retention Impact Over Time
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Track student risk score reduction pre and post counselor intervention. Real-time metrics measure whether emergency financial aid, tutoring, and wellness check-ins successfully retain students.
            </p>
          </div>

          <button 
            onClick={onOpenNewInterventionModal}
            className="btn-primary shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Intervention</span>
          </button>
        </div>

        {/* 4 Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-700/60">
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400">Total Interventions Logged</p>
            <p className="text-xl font-bold text-slate-100 mt-0.5">{totalCount}</p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400">Successfully Retained</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{retainedCount} <span className="text-xs text-emerald-500 font-normal">students</span></p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400">In Active Counseling</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{inProgressCount} <span className="text-xs text-amber-500 font-normal">active</span></p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400">Retention Success Rate</p>
            <p className="text-xl font-bold text-indigo-400 mt-0.5">{successRate}%</p>
          </div>
        </div>
      </div>

      {/* Intervention Pipeline & Table */}
      <div className="table-card-container">
        {/* Filter Tabs */}
        <div className="table-toolbar">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-200">Pipeline Status:</span>

            {['All', 'In Progress', 'Resolved & Retained', 'Student Dropped'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredList.length} of {interventions.length} records
          </span>
        </div>

        {/* Interventions Table */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student & Institution</th>
                <th>Assigned Action Plan</th>
                <th>Counselor Lead</th>
                <th>Date Logged</th>
                <th>Pre vs. Post Risk %</th>
                <th>Outcome Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No interventions found for status "{filterStatus}".
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const preRisk = item.initialRiskProb || 80;
                  const postRisk = item.currentRiskProb || (item.status === 'Resolved & Retained' ? 25 : preRisk);
                  const isSuccess = item.status === 'Resolved & Retained';
                  const isDropped = item.status === 'Student Dropped';

                  return (
                    <tr key={item.id} className="table-row-hover">
                      {/* Student */}
                      <td>
                        <p className="font-semibold text-slate-100 text-sm">{item.studentName}</p>
                        <p className="text-xs text-slate-400">{item.studentId} • {item.department}</p>
                      </td>

                      {/* Intervention Type */}
                      <td>
                        <p className="text-xs font-medium text-slate-200">{item.interventionType}</p>
                        {item.notes && (
                          <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                            "{item.notes}"
                          </p>
                        )}
                      </td>

                      {/* Counselor */}
                      <td>
                        <span className="text-xs font-medium text-slate-300">{item.counselorName}</span>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="text-xs text-slate-400">{formatDate(item.dateAssigned)}</span>
                      </td>

                      {/* Pre vs Post Risk */}
                      <td>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-rose-400 font-bold">{preRisk}%</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className={`font-bold ${isSuccess ? 'text-emerald-400' : isDropped ? 'text-rose-500' : 'text-amber-400'}`}>
                            {postRisk}%
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span className={`status-badge ${
                          isSuccess ? 'status-resolved' :
                          isDropped ? 'status-dropped' : 'status-progress'
                        }`}>
                          {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                          {isDropped && <XCircle className="w-3 h-3" />}
                          {!isSuccess && !isDropped && <Clock className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          onClick={() => {
                            setEditingIntervention(item);
                            setNewStatus(item.status);
                            setCounselorNotes(item.notes || '');
                          }}
                          className="btn-action-ghost text-xs"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status Modal */}
      {editingIntervention && (
        <div className="modal-overlay">
          <div className="modal-container max-w-md">
            <div className="modal-header">
              <h3 className="text-lg font-bold text-white">Update Intervention Outcome</h3>
              <button onClick={() => setEditingIntervention(null)} className="modal-close-btn">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="modal-body space-y-4">
              <div>
                <p className="text-xs text-slate-400">Student:</p>
                <p className="text-sm font-semibold text-white">{editingIntervention.studentName} ({editingIntervention.studentId})</p>
                <p className="text-xs text-indigo-400 mt-0.5">{editingIntervention.interventionType}</p>
              </div>

              <div>
                <label className="input-label">Outcome Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="custom-input"
                >
                  <option value="In Progress">In Progress (Ongoing Counseling)</option>
                  <option value="Resolved & Retained">Resolved & Retained (Student Risk Reduced)</option>
                  <option value="Student Dropped">Student Dropped Out (Unsuccessful)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Counselor Notes & Impact Log</label>
                <textarea
                  rows="3"
                  value={counselorNotes}
                  onChange={(e) => setCounselorNotes(e.target.value)}
                  placeholder="Record peer tutoring hours, emergency aid approved, or attendance improvements..."
                  className="custom-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingIntervention(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
