import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../slices/notificationSlice';
import { useBook, useDeleteBook } from '../api/hooks';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  

  const { book, isLoading, refetch } = useBook(id || '');
  const { deleteBook, isLoading: isDeleting } = useDeleteBook();

  const handleDelete = async () => {
    if (!id) return;

    try {
      const result = await deleteBook(id);
      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: 'Book deleted successfully!',
          duration: 5000
        }));
        navigate('/books');
      } else {
        dispatch(addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to delete book. Please try again.',
          duration: 7000
        }));
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete book. Please try again.',
        duration: 7000
      }));
    }
  };

  if (isLoading) return <Loading text="Loading book details..." />;
  
  if (!book) {
    return <ErrorMessage message="Book not found" onRetry={refetch} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/books"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Books
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            {book.image ? (
              <img
                src={book.image}
                alt={book.title}
                className="h-64 w-full object-cover md:h-full"
              />
            ) : (
              <div className="h-64 md:h-full bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-6xl">📚</div>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {book.available ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Author:</span>
                <p className="text-lg text-gray-900">{book.author}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Genre:</span>
                <span className="ml-2 inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  {book.genre}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">ISBN:</span>
                <p className="text-gray-900">{book.isbn}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Copies Available:</span>
                <p className="text-lg font-semibold text-gray-900">{book.copies}</p>
              </div>

              {book.description && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-gray-700 mt-1 leading-relaxed">{book.description}</p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Created: {new Date(book.createdAt).toLocaleDateString()}</p>
                <p>Last Updated: {new Date(book.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/edit-book/${book._id}`}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                ✏️ Edit Book
              </Link>
              
              {book.available && book.copies > 0 && (
                <Link
                  to={`/borrow/${book._id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  📖 Borrow Book
                </Link>
              )}
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                disabled={isDeleting}
              >
                🗑️ Delete Book
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BookDetail;
