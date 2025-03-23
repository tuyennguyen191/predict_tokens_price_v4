import { useState } from 'react';
import TokenPriceChart from './TokenPriceChart';

interface TokenDetailProps {
  token: {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    total_volume: number;
    image: string;
  };
  onClose: () => void;
}

const TokenDetail = ({ token, onClose }: TokenDetailProps) => {
  const [timeRange, setTimeRange] = useState<number>(30); // Default to 30 days

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <img src={token.image} alt={token.name} className="w-10 h-10 mr-3" />
            <h2 className="text-2xl font-bold">{token.name} ({token.symbol.toUpperCase()})</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Price</h3>
            <p className="text-2xl font-bold">${token.current_price.toLocaleString()}</p>
            <p className={`text-sm ${token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {token.price_change_percentage_24h >= 0 ? '↑' : '↓'} {Math.abs(token.price_change_percentage_24h).toFixed(2)}% (24h)
            </p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Market Cap</h3>
            <p className="text-2xl font-bold">${token.market_cap.toLocaleString()}</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">24h Volume</h3>
            <p className="text-2xl font-bold">${token.total_volume.toLocaleString()}</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Volume / Market Cap</h3>
            <p className="text-2xl font-bold">
              {(token.total_volume / token.market_cap).toFixed(4)}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setTimeRange(7)} 
              className={`px-3 py-1 rounded ${timeRange === 7 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              7D
            </button>
            <button 
              onClick={() => setTimeRange(30)} 
              className={`px-3 py-1 rounded ${timeRange === 30 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              30D
            </button>
            <button 
              onClick={() => setTimeRange(90)} 
              className={`px-3 py-1 rounded ${timeRange === 90 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              90D
            </button>
            <button 
              onClick={() => setTimeRange(365)} 
              className={`px-3 py-1 rounded ${timeRange === 365 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              1Y
            </button>
            <button 
              onClick={() => setTimeRange(1825)} 
              className={`px-3 py-1 rounded ${timeRange === 1825 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              5Y
            </button>
          </div>
          
          <TokenPriceChart 
            tokenId={token.id} 
            days={timeRange} 
            title={`${token.name} Price History (${timeRange} days)`} 
          />
        </div>
      </div>
    </div>
  );
};

export default TokenDetail;
