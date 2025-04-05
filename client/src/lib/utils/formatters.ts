import { format, formatDistanceToNow } from "date-fns";

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`;
}

export function formatTimestamp(timestamp: string | Date): string {
  if (typeof timestamp === 'string') {
    timestamp = new Date(timestamp);
  }
  
  return formatDistanceToNow(timestamp, { addSuffix: true });
}

export function formatDateForChart(date: Date): string {
  return format(date, 'MMM d');
}

export function formatTimeForChart(date: Date): string {
  return format(date, 'HH:mm');
}

export function getProjectStatusFromHealthScore(score: number): 'healthy' | 'warning' | 'alert' {
  if (score >= 90) return 'healthy';
  if (score >= 75) return 'warning';
  return 'alert';
}

export function getStatusLabel(status: 'healthy' | 'warning' | 'alert'): string {
  switch (status) {
    case 'healthy': return 'Healthy';
    case 'warning': return 'Warning';
    case 'alert': return 'Alert';
    default: return 'Unknown';
  }
}
