/**
 * Local Storage Persistence Manager for Student Risk & Intervention Outcomes
 */

import { loadInitialStudents, INITIAL_INTERVENTIONS } from './mockData.js';
import { calculateStudentRisk } from './mlEngine.js';

const STORAGE_KEYS = {
  STUDENTS: 'early_warning_students_v1',
  INTERVENTIONS: 'early_warning_interventions_v1',
  MODEL_PARAMS: 'early_warning_model_params_v1'
};

export function getStoredStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      const initial = loadInitialStudents();
      saveStudents(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load stored students:', e);
    return loadInitialStudents();
  }
}

export function saveStudents(students) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students:', e);
  }
}

export function getStoredInterventions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVENTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(INITIAL_INTERVENTIONS));
      return INITIAL_INTERVENTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load interventions:', e);
    return INITIAL_INTERVENTIONS;
  }
}

export function saveInterventions(interventions) {
  try {
    localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(interventions));
  } catch (e) {
    console.error('Failed to save interventions:', e);
  }
}

export function addIntervention(newIntervention) {
  const current = getStoredInterventions();
  const updated = [newIntervention, ...current];
  saveInterventions(updated);

  // Update student risk status
  const students = getStoredStudents();
  const studentIndex = students.findIndex(s => s.id === newIntervention.studentId);
  if (studentIndex !== -1) {
    students[studentIndex].activeIntervention = newIntervention;
    saveStudents(students);
  }

  return updated;
}

export function updateInterventionStatus(interventionId, newStatus, newNotes = '') {
  const interventions = getStoredInterventions();
  const index = interventions.findIndex(i => i.id === interventionId);

  if (index !== -1) {
    interventions[index].status = newStatus;
    if (newNotes) interventions[index].notes = newNotes;

    // If resolved, lower the student's risk probability by ~45%
    if (newStatus === 'Resolved & Retained') {
      interventions[index].outcome = 'Successfully Retained';

      const students = getStoredStudents();
      const sIndex = students.findIndex(s => s.id === interventions[index].studentId);
      if (sIndex !== -1) {
        // Boost student attendance and GPA parameters to reflect successful retention
        students[sIndex].attendance_recent_30d_drop_pct = Math.max(0, students[sIndex].attendance_recent_30d_drop_pct - 20);
        students[sIndex].consecutive_absences = 0;
        students[sIndex].attendance_overall_pct = Math.min(95, students[sIndex].attendance_overall_pct + 12);
        students[sIndex].missed_assignments_count = 0;

        // Recalculate ML risk score
        const recalculated = calculateStudentRisk(students[sIndex]);
        students[sIndex].dropout_prob = recalculated.probability;
        students[sIndex].risk_tier = recalculated.riskTier;
        students[sIndex].shap_values = recalculated.shapValues;

        interventions[index].currentRiskProb = recalculated.probability;
        saveStudents(students);
      }
    } else if (newStatus === 'Student Dropped') {
      interventions[index].outcome = 'Dropout Occurred';
    }

    saveInterventions(interventions);
  }

  return interventions;
}

export function resetToDefaultData() {
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.INTERVENTIONS);
  const students = loadInitialStudents();
  saveStudents(students);
  saveInterventions(INITIAL_INTERVENTIONS);
  return { students, interventions: INITIAL_INTERVENTIONS };
}
