import React, { useState } from 'react';
import { X, UserCheck, Calendar, FileText, Send, Sparkles } from 'lucide-react';

export default function InterventionModal({ 
  student, 
  preselectedRecommendation, 
  onClose, 
  onSave 
}) {
  const [interventionType, setInterventionType] = useState(
    preselectedRecommendation ? preselectedRecommendation.type : 'Emergency Financial Aid Grant & Installment Plan'
  );
  const [counselorName, setCounselorName] = useState('Dr. Ramesh Sundaram');
  const [targetDate, setTargetDate] = useState('2026-11-15');
  const [notes, setNotes] = useState(
    preselectedRecommendation 
      ? `Action: ${preselectedRecommendation.action}. Focus on resolving ${preselectedRecommendation.departmentResponsible}.`
      : 'Initial counselor intake scheduled to review attendance drop and academic support.'
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const newIntervention = {
      id: `INT-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentId: student.id,
      studentName: student.name,
      institutionType: student.institution_type,
      department: student.department,
      interventionType,
      counselorName,
      dateAssigned: new Date().toISOString().split('T')[0],
      targetDate,
      status: 'In Progress',
      initialRiskProb: student.dropout_prob,
      currentRiskProb: student.dropout_prob,
      notes,
      outcome: 'Pending Evaluation'
    };

    onSave(newIntervention);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-lg">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Log Counselor Intervention</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-4">
          {/* Target Student */}
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <p className="text-xs text-slate-400">Target Student:</p>
            <p className="text-sm font-bold text-white">{student.name} ({student.id})</p>
            <p className="text-xs text-slate-300">{student.department} • {student.institution_type}</p>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-rose-400 font-semibold">Current Risk: {student.dropout_prob}% ({student.risk_tier})</span>
              <span className="text-amber-300">Est. Window: ~{student.months_advance} mo.</span>
            </div>
          </div>

          {/* Intervention Strategy */}
          <div>
            <label className="input-label">Select Intervention Type</label>
            <select
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value)}
              className="custom-input text-xs"
            >
              <option value="Emergency Financial Aid Grant & Installment Plan">Emergency Financial Aid Grant & Installment Plan</option>
              <option value="1-on-1 Academic Tutoring & Remediation">1-on-1 Academic Tutoring & Remediation</option>
              <option value="Attendance & Wellness Check-in Counseling">Attendance & Wellness Check-in Counseling</option>
              <option value="Submission & Workload Grace Extension">Submission & Workload Grace Extension</option>
              <option value="LMS Digital Re-activation & Hardware Support">LMS Digital Re-activation & Hardware Support</option>
            </select>
          </div>

          {/* Lead Counselor */}
          <div>
            <label className="input-label">Assigned Lead Counselor / Faculty Advisor</label>
            <input
              type="text"
              value={counselorName}
              onChange={(e) => setCounselorName(e.target.value)}
              placeholder="e.g. Dr. Ramesh Sundaram"
              className="custom-input text-xs"
              required
            />
          </div>

          {/* Target Resolution Date */}
          <div>
            <label className="input-label">Target Completion Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="custom-input text-xs"
              required
            />
          </div>

          {/* Counselor Notes */}
          <div>
            <label className="input-label">Counselor Action Plan & Notes</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Outline specific steps (e.g. peer tutoring schedule, fee waiver submission)..."
              className="custom-input text-xs"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log & Trigger Intervention</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
