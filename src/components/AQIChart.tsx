import { Line } from 'react-chartjs-2';
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

interface AQIDataPoint {
  timestamp: string;
  aqi: number;
}

interface AQIChartProps {
  data: AQIDataPoint[];
}

export default function AQIChart({ data }: AQIChartProps) {
  const chartData: ChartData<'line'> = {
    labels: data.map(point => new Date(point.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Air Quality Index',
        data: data.map(point => point.aqi),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'AQI Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'AQI Value',
        },
      },
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
} 