import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import type { BorrowSummaryItem, ApiResponse } from '../types';

const BorrowSummary = () => {
  const [borrowSummary, setBorrowSummary] = useState<BorrowSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBorrowSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Configure axios with better error handling
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get<ApiResponse<BorrowSummaryItem[]>>(
        `${apiBaseUrl}/borrow`,
        {
          timeout: 15000, // 15 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      setBorrowSummary(response.data.data || []);
    } catch (err: unknown) {
      console.error('Error fetching borrow summary:', err);
      
      const axiosError = err as { code?: string; response?: { status?: number } };
      
      if (axiosError.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection and try again.');
      } else if (axiosError.code === 'ECONNABORTED') {
        setError('Request timeout. The server is taking too long to respond.');
      } else if (axiosError.response?.status === 404) {
        setError('API endpoint not found. Please check the server configuration.');
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load borrow summary. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowSummary();
  }, []);

  if (isLoading) return <Loading text="Loading borrow summary..." />;
  
  if (error) {
    return <ErrorMessage message="Failed to load borrow summary" onRetry={fetchBorrowSummary} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Borrow Summary</h1>
        <Link
          to="/books"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          📚 Browse Books
        </Link>
      </div>

      {borrowSummary.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No borrowed books</h3>
          <p className="text-gray-500 mb-4">
            No books have been borrowed yet. Start by borrowing your first book.
          </p>
          <Link
            to="/books"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Total Borrowed Books: {borrowSummary.length}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Summary of all books that have been borrowed from the library
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISBN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Quantity Borrowed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {borrowSummary.map((item, index) => (
                  <tr key={`${item.book.isbn}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.book.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.book.isbn}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.totalQuantity} {item.totalQuantity === 1 ? 'copy' : 'copies'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total copies borrowed: {borrowSummary.reduce((total, item) => total + item.totalQuantity, 0)}
              </div>
              <Link
                to="/books"
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
              >
                Borrow more books →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowSummary;
