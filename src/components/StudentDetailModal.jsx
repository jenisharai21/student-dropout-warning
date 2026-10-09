import React from 'react';
import { 
  X, 
  AlertTriangle, 
  Calendar, 
  UserCheck, 
  BookOpen, 
  TrendingDown, 
  Banknote, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  Phone,
  Mail,
  Building2,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getRiskBadgeClass } from '../utils/formatters.js';

export default function StudentDetailModal({ 
  student, 
  onClose, 
  onOpenInterventionModal,
  interventions = []
}) {
  if (!student) return null;

  const badgeClass = getRiskBadgeClass(student.risk_tier);
  const studentInterventions = interventions.filter(i => i.studentId === student.id);

  // Recharts attendance dataset
  const attendanceChartData = (student.attendance_history || [90, 85, 78, 70, 62, 54]).map((val, idx) => ({
    month: `Month ${idx + 1}`,
    attendance: val
  }));

  const gpaChartData = (student.gpa_history || [3.2, 2.9, 2.6, student.gpa]).map((val, idx) => ({
    term: `Term ${idx + 1}`,
    gpa: val
  }));

  return (
    <div className="modal-overlay">
      <div className="modal-container student-detail-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-4">
            <img 
              src={student.avatar} 
              alt={student.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{student.name}</h2>
                <span className={`risk-badge ${badgeClass}`}>
                  {student.risk_tier} Risk ({student.dropout_prob}%)
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                {student.id} • {student.department} ({student.institution_type})
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> {student.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> {student.phone}
                </span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body space-y-6">
          
          {/* 1. Predictive 2-3 Month Early Warning Banner */}
          <div className={`early-warning-banner ${student.risk_tier === 'High' ? 'banner-high' : 'banner-medium'}`}>
            <div className="flex items-start gap-3">
              <div className="warning-icon-wrapper">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-100 text-base">Early Warning Alert: 2-3 Month Window</h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Est. Time: ~{student.months_advance} months away
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Gradient Boosting classifier predicts a <strong className="text-white font-bold">{student.dropout_prob}% probability</strong> of student dropout unless targeted intervention is completed within the next 3-4 weeks.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenInterventionModal(student);
              }}
              className="btn-primary mt-3 w-full sm:w-auto"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Log Immediate Counselor Intervention</span>
            </button>
          </div>

          {/* 2. SHAP-style Risk Factor Attribution Breakdown */}
          <div className="detail-section">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">
                <Sparkles className="w-4 h-4 text-indigo-400 inline mr-2" />
                Specific Risk Factors Driving Prediction (SHAP Attribution)
              </h3>
              <span className="text-xs text-slate-400">Order by contribution strength</span>
            </div>

            <div className="shap-list space-y-2.5">
              {student.shap_values?.length === 0 ? (
                <p className="text-sm text-slate-400">No major negative risk factors identified.</p>
              ) : (
                student.shap_values?.map((item, idx) => (
                  <div key={idx} className="shap-item-card">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`shap-direction-dot ${item.direction === 'negative' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        <span className="text-sm font-semibold text-slate-200">{item.title}</span>
                        <span className="text-xs text-slate-400">({item.category})</span>
                      </div>
                      <span className={`text-xs font-bold ${item.direction === 'negative' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.direction === 'negative' ? `+${item.impact}% Risk Driver` : `${item.impact}% Protective`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-1.5">{item.value}</p>

                    {/* Impact Bar */}
                    <div className="shap-bar-bg">
                      <div 
                        className={`shap-bar-fill ${item.direction === 'negative' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(Math.abs(item.impact) * 2.5, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Historical Performance Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attendance Trend Chart */}
            <div className="chart-card">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Attendance Pattern (Last 6 Months)
              </h4>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceChartData}>
                    <defs>
                      <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '6px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="attendance" stroke="#ef4444" fillOpacity={1} fill="url(#attGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GPA Trajectory Chart */}
            <div className="chart-card">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                GPA Trajectory Trend
              </h4>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gpaChartData}>
                    <defs>
                      <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="term" stroke="#94a3b8" fontSize={10} />
                    <YAxis domain={[0, 4.0]} stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '6px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="gpa" stroke="#f59e0b" fillOpacity={1} fill="url(#gpaGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 4. Tailored Intervention Action Recommendations */}
          <div className="detail-section">
            <h3 className="section-title mb-3">
              <UserCheck className="w-4 h-4 text-emerald-400 inline mr-2" />
              Recommended Counselor Action Plan for Risk Profile
            </h3>

            <div className="space-y-3">
              {student.recommended_interventions?.map((rec) => (
                <div key={rec.id} className="recommendation-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`priority-badge ${
                          rec.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          rec.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}>
                          {rec.priority} Priority
                        </span>
                        <h4 className="font-bold text-slate-100 text-sm">{rec.type}</h4>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-1">{rec.action}</p>
                      <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                      <p className="text-[11px] text-indigo-400 mt-1.5 font-medium">
                        Lead Department: {rec.departmentResponsible}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenInterventionModal(student, rec);
                      }}
                      className="btn-secondary text-xs shrink-0"
                    >
                      Assign This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Past Intervention History */}
          {studentInterventions.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title mb-2">Intervention History Log</h3>
              <div className="space-y-2">
                {studentInterventions.map(item => (
                  <div key={item.id} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-xs">
                    <div className="flex justify-between font-semibold text-slate-200">
                      <span>{item.interventionType}</span>
                      <span className="text-amber-400">{item.status}</span>
                    </div>
                    <p className="text-slate-400 mt-1">Counselor: {item.counselorName} • Assigned {item.dateAssigned}</p>
                    {item.notes && <p className="text-slate-300 mt-1 italic">"{item.notes}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
