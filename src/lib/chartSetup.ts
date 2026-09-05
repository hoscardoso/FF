import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const chartColors = {
  blue: '#1e40af',
  blueLight: '#3b82f6',
  green: '#16a34a',
  red: '#dc2626',
  amber: '#f59e0b',
  slate: '#64748b',
  cyan: '#0891b2',
  purple: '#7c3aed',
  orange: '#ea580c',
  teal: '#0d9488',
};

export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 16,
        font: { size: 12 },
      },
    },
  },
};
