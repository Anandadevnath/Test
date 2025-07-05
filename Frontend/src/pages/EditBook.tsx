import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../slices/notificationSlice';
import { GENRE_OPTIONS } from '../types';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import type { UpdateBookRequest, Book, ApiResponse } from '../types';

interface FormData {
  title: string;
  author: string;
  genre: typeof GENRE_OPTIONS[number];
  isbn: string;
  description: string;
  image: string;
  copies: number;
  available: boolean;
}

const EditBook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>();

  const fetchBook = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get<ApiResponse<Book>>(`${apiBaseUrl}/books/${id}`);
      setBook(response.data.data);
    } catch (err) {
      setError('Failed to load book details');
      console.error('Error fetching book:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  useEffect(() => {
    if (book) {
      reset({
        title: book.title,
        author: book.author,
        genre: book.genre,
        isbn: book.isbn,
        description: book.description || '',
        image: book.image || '',
        copies: book.copies,
        available: book.available
      });
    }
  }, [book, reset]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;

    try {
      setIsUpdating(true);
      const updateData: UpdateBookRequest = {
        title: data.title.trim(),
        author: data.author.trim(),
        genre: data.genre,
        isbn: data.isbn.trim(),
        copies: data.copies,
        available: data.available,
        description: data.description.trim() || undefined,
        image: data.image.trim() || undefined
      };
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await axios.patch<ApiResponse<Book>>(`${apiBaseUrl}/books/${id}`, updateData);
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Book updated successfully!',
        duration: 5000
      }));
      navigate(`/books/${id}`);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update book. Please try again.';
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message,
        duration: 7000
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <Loading text="Loading book details..." />;
  
  if (error) {
    return <ErrorMessage message="Failed to load book details" onRetry={fetchBook} />;
  }

  if (!book) {
    return <ErrorMessage message="Book not found" />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to={`/books/${id}`}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Book Details
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Book</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              id="title"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter book title"
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author *
            </label>
            <input
              {...register('author', { required: 'Author is required' })}
              type="text"
              id="author"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.author ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter author name"
              required
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
              Genre *
            </label>
            <select
              {...register('genre', { required: 'Genre is required' })}
              id="genre"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.genre ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select a genre</option>
              {GENRE_OPTIONS.map((genre) => (
                <option key={genre} value={genre}>
                  {genre.replace('_', ' ')}
                </option>
              ))}
            </select>
            {errors.genre && (
              <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
              ISBN *
            </label>
            <input
              {...register('isbn', { required: 'ISBN is required' })}
              type="text"
              id="isbn"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.isbn ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter ISBN"
              required
            />
            {errors.isbn && (
              <p className="mt-1 text-sm text-red-600">{errors.isbn.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="copies" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Copies *
            </label>
            <input
              {...register('copies', { 
                required: 'Number of copies is required',
                min: { value: 0, message: 'Copies cannot be negative' },
                valueAsNumber: true
              })}
              type="number"
              id="copies"
              min="0"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.copies ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter number of copies"
              required
            />
            {errors.copies && (
              <p className="mt-1 text-sm text-red-600">{errors.copies.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL
            </label>
            <input
              {...register('image')}
              type="url"
              id="image"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter image URL (optional)"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter book description (optional)"
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('available')}
              type="checkbox"
              id="available"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
              Available for borrowing
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Link
              to={`/books/${id}`}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
