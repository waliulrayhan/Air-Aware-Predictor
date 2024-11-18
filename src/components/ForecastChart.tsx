import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ForecastDataPoint {
  day: string;
  avg: number;
  max: number;
  min: number;
}

interface ForecastChartProps {
  data: ForecastDataPoint[];
  title: string;
  color: string;
}

export default function ForecastChart({ data, title, color }: ForecastChartProps) {
  const chartData: ChartData<'line'> = {
    labels: data.map(point => point.day),
    datasets: [
      {
        label: 'Average',
        data: data.map(point => point.avg),
        borderColor: color,
        backgroundColor: color,
        tension: 0.1,
        fill: false,
      },
      {
        label: 'Maximum',
        data: data.map(point => point.max),
        borderColor: color,
        backgroundColor: `${color}88`,
        borderDash: [5, 5],
        tension: 0.1,
        fill: false,
      },
      {
        label: 'Minimum',
        data: data.map(point => point.min),
        borderColor: color,
        backgroundColor: `${color}44`,
        borderDash: [2, 2],
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
} 