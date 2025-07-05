import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../slices/notificationSlice';
import { useCreateBook } from '../api/hooks';
import { GENRE_OPTIONS } from '../types';
import type { CreateBookRequest } from '../types';

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

const CreateBook = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { createBook, isLoading } = useCreateBook();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      available: true,
      copies: 1,
      description: '',
      image: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const bookData: CreateBookRequest = {
        title: data.title.trim(),
        author: data.author.trim(),
        genre: data.genre,
        isbn: data.isbn.trim(),
        copies: data.copies,
        available: data.available,
        description: data.description.trim() || undefined,
        image: data.image.trim() || undefined
      };
      
      console.log('Creating book with data:', bookData);
      const result = await createBook(bookData);
      console.log('Create book result:', result);
      
      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: 'Book created successfully!',
          duration: 5000
        }));
        navigate('/books');
      } else {
        dispatch(addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to create book. Please try again.',
          duration: 7000
        }));
      }
    } catch (error: unknown) {
      console.error('Exception during book creation:', error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create book. Please try again.';
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message,
        duration: 7000
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/books"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Books
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Book</h1>

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
              placeholder="https://example.com/book-cover.jpg"
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
              placeholder="Enter book description..."
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('available')}
              type="checkbox"
              id="available"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
              Available for borrowing
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to="/books"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBook;
