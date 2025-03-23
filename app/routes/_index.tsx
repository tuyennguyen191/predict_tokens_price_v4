import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getUser } from "~/utils/session.server";
import { Button } from "~/components/Button";
import TokenDetail from "~/components/TokenDetail";

export const meta: MetaFunction = () => {
  return [
    { title: "Crypto Dashboard" },
    { name: "description", content: "Cryptocurrency price tracker and authentication demo" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json({ user });
};

interface TokenPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenPrice | null>(null);

  useEffect(() => {
    if (user) {
      fetchTokenPrices();
    }
  }, [user]);

  const fetchTokenPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch token prices");
      }
      
      const data = await response.json();
      setTokenPrices(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching token prices:", err);
      setError("Failed to load token prices. Please try again later.");
      setLoading(false);
    }
  };

  const openTokenDetail = (token: TokenPrice) => {
    setSelectedToken(token);
  };

  const closeTokenDetail = () => {
    setSelectedToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {user ? "Crypto Dashboard" : "Authentication Demo"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {user 
              ? "Track live cryptocurrency prices" 
              : "A simple authentication system with Remix"}
          </p>
        </div>

        {user ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Welcome, {user.username}!</h2>
                <p className="mt-1 text-sm text-gray-500">You are logged in with {user.email}</p>
              </div>
              <form action="/logout" method="post">
                <Button type="submit">
                  Logout
                </Button>
              </form>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Live Token Prices</h3>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (USD)</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tokenPrices.map((token) => (
                          <tr key={token.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-full" src={token.image} alt={token.name} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{token.name}</div>
                                  <div className="text-sm text-gray-500">{token.symbol.toUpperCase()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${token.current_price.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                token.price_change_percentage_24h >= 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {token.price_change_percentage_24h >= 0 ? "+" : ""}
                                {token.price_change_percentage_24h.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => openTokenDetail(token)}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                View Chart
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={fetchTokenPrices}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Prices
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col space-y-4 max-w-md mx-auto">
            <Link to="/login">
              <Button className="w-full">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="w-full bg-green-500 hover:bg-green-700">
                Create an account
              </Button>
            </Link>
          </div>
        )}
      </div>

      {selectedToken && (
        <TokenDetail token={selectedToken} onClose={closeTokenDetail} />
      )}
    </div>
  );
}
