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

interface Prediction {
  dates: string[];
  predictions: number[];
}

interface PredictionChartProps {
  data: Prediction;
}

export default function PredictionChart({ data }: PredictionChartProps) {
  const chartData: ChartData<'line'> = {
    labels: data.dates.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'PM2.5 Predictions',
        data: data.predictions,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.3,
        fill: true,
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
        text: 'PM2.5 7-Day Forecast',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `PM2.5: ${context.raw.toFixed(1)} µg/m³`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'PM2.5 (µg/m³)',
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