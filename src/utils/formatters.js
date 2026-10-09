/**
 * Formatter Helpers for Risk Metrics, Dates, and Badges
 */

export function formatPercent(val) {
  if (val === undefined || val === null) return '0%';
  return `${Math.round(val)}%`;
}

export function getRiskBadgeClass(tier) {
  switch (tier) {
    case 'High':
      return 'badge-high-risk';
    case 'Medium':
      return 'badge-medium-risk';
    case 'Low':
      return 'badge-low-risk';
    default:
      return 'badge-low-risk';
  }
}

export function getRiskColorHex(tier) {
  switch (tier) {
    case 'High':
      return '#ef4444'; // Red
    case 'Medium':
      return '#f59e0b'; // Amber
    case 'Low':
      return '#10b981'; // Emerald
    default:
      return '#6b7280';
  }
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
