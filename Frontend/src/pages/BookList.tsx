import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  setSortBy, 
  setSortOrder
} from '../slices/bookSlice';
import { addNotification } from '../slices/notificationSlice';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import type { Book, ApiResponse } from '../types';

const BookList = () => {
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const dispatch = useAppDispatch();
  const { bookFilters } = useAppSelector((state) => state.books);
  const { sortBy: reduxSortBy, sortOrder: reduxSortOrder } = bookFilters;

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get<ApiResponse<Book[]>>(
        '/api/books', 
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      setBooks(response.data.data || []);
    } catch (err: unknown) {
      console.error('Error fetching books:', err);
      
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
        setError('Failed to load books. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDeleteClick = (bookId: string) => {
    setDeleteBookId(bookId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBookId) return;

    try {
      setIsDeleting(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      await axios.delete(`${apiBaseUrl}/books/${deleteBookId}`, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Book deleted successfully!',
        duration: 5000
      }));
      setDeleteBookId(null);
      // Refresh the books list
      await fetchBooks();
    } catch (err: unknown) {
      console.error('Error deleting book:', err);
      
      const axiosError = err as { code?: string; response?: { status?: number; data?: { message?: string } } };
      let errorMessage = 'Failed to delete book. Please try again.';
      
      if (axiosError.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }
      
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
        duration: 7000
      }));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSortChange = (field: string) => {
    if (reduxSortBy === field) {
      dispatch(setSortOrder(reduxSortOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(field as keyof Book));
      dispatch(setSortOrder('asc'));
    }
  };

  const getSortIcon = (field: string) => {
    if (reduxSortBy !== field) return '↕️';
    return reduxSortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  // Sort books based on Redux state
  const sortedBooks = [...books].sort((a, b) => {
    const aValue = String(a[reduxSortBy as keyof Book] || '');
    const bValue = String(b[reduxSortBy as keyof Book] || '');
    
    if (aValue < bValue) return reduxSortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return reduxSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  if (isLoading) return <Loading text="Loading books..." />;
  
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBooks} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Books</h1>
        <Link
          to="/create-book"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          ➕ Add New Book
        </Link>
      </div>

      {sortedBooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No books found</h3>
          <p className="text-gray-500 mb-4">Start by adding your first book to the library.</p>
          <Link
            to="/create-book"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add First Book
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('title')}
                  >
                    Title {getSortIcon('title')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('author')}
                  >
                    Author {getSortIcon('author')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('genre')}
                  >
                    Genre {getSortIcon('genre')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISBN
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('copies')}
                  >
                    Copies {getSortIcon('copies')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBooks.map((book: Book) => (
                  <tr key={book._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{book.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {book.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.isbn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.copies}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {book.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/books/${book._id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        👁️ View
                      </Link>
                      <Link
                        to={`/edit-book/${book._id}`}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors"
                      >
                        ✏️ Edit
                      </Link>
                      {book.available && book.copies > 0 && (
                        <Link
                          to={`/borrow/${book._id}`}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          📖 Borrow
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteClick(book._id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        disabled={isDeleting}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteBookId}
        title="Delete Book"
        message="Are you sure you want to delete this book? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteBookId(null)}
      />
    </div>
  );
};

export default BookList;
