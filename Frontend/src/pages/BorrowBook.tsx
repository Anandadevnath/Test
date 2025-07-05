import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../slices/notificationSlice';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import type { BorrowRequest, Book, ApiResponse, BorrowRecord } from '../types';

interface FormData {
  quantity: number;
  dueDate: string;
}

const BorrowBook = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>({
    defaultValues: {
      quantity: 1,
      dueDate: ''
    }
  });

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get<ApiResponse<Book>>(`${apiBaseUrl}/books/${bookId}`);
      setBook(response.data.data);
    } catch (err) {
      setError('Failed to load book details');
      console.error('Error fetching book:', err);
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const quantityValue = watch('quantity');

  const onSubmit = async (data: FormData) => {
    if (!bookId || !book) return;

    // Validate quantity against available copies
    if (data.quantity > book.copies) {
      dispatch(addNotification({
        type: 'error',
        title: 'Invalid Quantity',
        message: `Only ${book.copies} copies are available`,
        duration: 7000
      }));
      return;
    }

    try {
      setIsBorrowing(true);
      const borrowData: BorrowRequest = {
        book: bookId,
        quantity: data.quantity,
        dueDate: new Date(data.dueDate).toISOString()
      };
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await axios.post<ApiResponse<BorrowRecord>>(`${apiBaseUrl}/borrow`, borrowData);
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Book borrowed successfully!',
        duration: 5000
      }));
      navigate('/borrow-summary');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to borrow book. Please try again.';
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message,
        duration: 7000
      }));
    } finally {
      setIsBorrowing(false);
    }
  };

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (isLoading) return <Loading text="Loading book details..." />;
  
  if (error) {
    return <ErrorMessage message="Failed to load book details" onRetry={fetchBook} />;
  }

  if (!book) {
    return <ErrorMessage message="Book not found" />;
  }

  if (!book.available || book.copies === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to={`/books/${bookId}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Book Details
          </Link>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Available</h2>
          <p className="text-gray-600 mb-6">
            Sorry, "{book.title}" is currently not available for borrowing.
          </p>
          <Link
            to="/books"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Other Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/books/${bookId}`}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Book Details
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Borrow Book</h1>

        {/* Book Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-start space-x-4">
            {book.image ? (
              <img
                src={book.image}
                alt={book.title}
                className="w-16 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📚</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{book.title}</h3>
              <p className="text-gray-600">by {book.author}</p>
              <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
              <p className="text-sm text-green-600 font-medium mt-1">
                {book.copies} copies available
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' },
                max: { value: book.copies, message: `Only ${book.copies} copies available` },
                valueAsNumber: true
              })}
              type="number"
              id="quantity"
              min="1"
              max={book.copies}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.quantity ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter quantity"
              required
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Maximum: {book.copies} copies
            </p>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              {...register('dueDate', { required: 'Due date is required' })}
              type="date"
              id="dueDate"
              min={minDate}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dueDate ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Please select a date after today
            </p>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Borrowing Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Book: {book.title}</p>
              <p>Quantity: {quantityValue || 1} copy/copies</p>
              <p>Remaining after borrow: {book.copies - (quantityValue || 1)} copies</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Link
              to={`/books/${bookId}`}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isBorrowing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBorrowing ? 'Borrowing...' : 'Borrow Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowBook;
