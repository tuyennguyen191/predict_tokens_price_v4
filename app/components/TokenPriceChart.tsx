import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns'; // Import the date adapter

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface PriceData {
  timestamp: number;
  price: number;
}

interface TokenPriceChartProps {
  tokenId: string;
  days?: number;
  title?: string;
}

const TokenPriceChart = ({ tokenId, days = 30, title = 'Token Price History' }: TokenPriceChartProps) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS>(null);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the data for our chart
        const formattedData = data.prices.map((item: [number, number]) => ({
          timestamp: item[0],
          price: item[1]
        }));
        
        setPriceData(formattedData);
      } catch (err) {
        console.error('Error fetching price data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch price data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPriceData();
  }, [tokenId, days]);

  const chartData = {
    datasets: [
      {
        label: `${tokenId.toUpperCase()} Price (USD)`,
        data: priceData.map(item => ({
          x: item.timestamp,
          y: item.price
        })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: days <= 7 ? 'day' : days <= 30 ? 'week' : 'month',
          tooltipFormat: 'PP'
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}`
        }
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading price data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 border border-red-300 rounded">Error: {error}</div>;
  }

  return (
    <div className="w-full h-64 md:h-96">
      <Line ref={chartRef} data={chartData} options={chartOptions} />
    </div>
  );
};

export default TokenPriceChart;
