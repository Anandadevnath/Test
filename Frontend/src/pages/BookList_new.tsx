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

const BookListGrid = () => {
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const dispatch = useAppDispatch();
  const { bookFilters } = useAppSelector((state) => state.books);
  const { sortBy: reduxSortBy, sortOrder: reduxSortOrder } = bookFilters;

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get<ApiResponse<Book[]>>(
        `${apiBaseUrl}/books`,
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
      
      
      await fetchBooks();
      setDeleteBookId(null);
    } catch (error: unknown) {
      console.error('Error deleting book:', error);
      
      let errorMessage = 'Failed to delete book. Please try again.';
      const axiosError = error as { response?: { data?: { message?: string } } };
      
      if (axiosError.response?.data?.message) {
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

  const filteredAndSortedBooks = books
    .filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
    )
    .filter(book => selectedGenre === '' || book.genre === selectedGenre)
    .sort((a, b) => {
      const aValue = String(a[reduxSortBy as keyof Book] || '');
      const bValue = String(b[reduxSortBy as keyof Book] || '');
      
      if (aValue < bValue) return reduxSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return reduxSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  
  const genres = [...new Set(books.map(book => book.genre))];

  if (isLoading) return <Loading text="Loading books..." />;
  
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBooks} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Library</h1>
          <p className="text-gray-600">Discover and manage your collection</p>
        </div>
        <Link
          to="/create-book"
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
        >
          <span className="text-xl">➕</span>
          Add New Book
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Books
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Genre Filter */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Genre
            </label>
            <select
              id="genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <div className="flex gap-2">
              <select
                value={reduxSortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Sort books by"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="genre">Genre</option>
                <option value="copies">Copies</option>
              </select>
              <button
                onClick={() => dispatch(setSortOrder(reduxSortOrder === 'asc' ? 'desc' : 'asc'))}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title={`Sort ${reduxSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {reduxSortOrder === 'asc' ? '⬆️' : '⬇️'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredAndSortedBooks.length} of {books.length} books
        </p>
      </div>

      {/* Books Grid */}
      {filteredAndSortedBooks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-8xl mb-6">📚</div>
          <h3 className="text-2xl font-semibold text-gray-600 mb-4">
            {books.length === 0 ? 'No books in library' : 'No books match your search'}
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {books.length === 0 
              ? 'Start building your library by adding your first book.'
              : 'Try adjusting your search terms or filters to find what you\'re looking for.'
            }
          </p>
          {books.length === 0 ? (
            <Link
              to="/create-book"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Add First Book
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('');
              }}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedBooks.map((book: Book) => (
            <div key={book._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              {/* Book Image */}
              <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                {book.image ? (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`text-6xl ${book.image ? 'hidden' : ''}`}>📖</div>
              </div>

              {/* Book Info */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {book.genre}
                  </span>
                </div>

                {/* Book Stats */}
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Copies: {book.copies}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {book.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/books/${book._id}`}
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors text-center text-sm font-medium"
                  >
                    👁️ View
                  </Link>
                  {book.available && book.copies > 0 ? (
                    <Link
                      to={`/borrow/${book._id}`}
                      className="bg-green-100 text-green-700 px-3 py-2 rounded-md hover:bg-green-200 transition-colors text-center text-sm font-medium"
                    >
                      📖 Borrow
                    </Link>
                  ) : (
                    <div className="bg-gray-50 text-gray-400 px-3 py-2 rounded-md text-center text-sm font-medium cursor-not-allowed">
                      Unavailable
                    </div>
                  )}
                </div>

                {/* Additional Actions */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link
                    to={`/edit-book/${book._id}`}
                    className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md hover:bg-yellow-200 transition-colors text-center text-sm font-medium"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(book._id)}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                    disabled={isDeleting}
                  >
                    🗑️ Delete
                  </button>
                </div>

                {/* ISBN */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
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

export default BookListGrid;
