import { useCallback } from 'react';
import { 
  useGetBooksQuery,
  useGetBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useBorrowBookMutation,
  useGetBorrowSummaryQuery,
} from './libraryApi';
import type { 
  CreateBookRequest, 
  UpdateBookRequest, 
  BorrowRequest
} from '../types';


export const useBooks = (params?: {
  filter?: string;
  sortBy?: string;
  sort?: 'asc' | 'desc';
  limit?: number;
}) => {
  const { data, error, isLoading, isFetching, refetch } = useGetBooksQuery(params || {});
  
  return {
    books: data?.data || [],
    error: error ? (error as { data?: { message?: string } })?.data?.message || 'Failed to fetch books' : null,
    isLoading,
    isFetching,
    refetch,
    success: data?.success || false,
  };
};


export const useBook = (bookId: string) => {
  const { data, error, isLoading, isFetching, refetch } = useGetBookQuery(bookId);
  
  return {
    book: data?.data,
    error: error ? (error as { data?: { message?: string } })?.data?.message || 'Failed to fetch book' : null,
    isLoading,
    isFetching,
    refetch,
    success: data?.success || false,
  };
};


export const useCreateBook = () => {
  const [createBook, { isLoading, error }] = useCreateBookMutation();
  
  const create = useCallback(async (bookData: CreateBookRequest) => {
    try {
      const result = await createBook(bookData).unwrap();
      return {
        success: result.success,
        data: result.data,
        message: result.message,
      };
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; errors?: Array<{ field: string; message: string }> } };
      return {
        success: false,
        data: null,
        message: error?.data?.message || 'Failed to create book',
        errors: error?.data?.errors,
      };
    }
  }, [createBook]);
  
  return {
    createBook: create,
    isLoading,
    error: error ? (error as { data?: { message?: string } })?.data?.message : null,
  };
};


export const useUpdateBook = () => {
  const [updateBook, { isLoading, error }] = useUpdateBookMutation();
  
  const update = useCallback(async (bookId: string, updates: UpdateBookRequest) => {
    try {
      const result = await updateBook({ bookId, updates }).unwrap();
      return {
        success: result.success,
        data: result.data,
        message: result.message,
      };
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; errors?: Array<{ field: string; message: string }> } };
      return {
        success: false,
        data: null,
        message: error?.data?.message || 'Failed to update book',
        errors: error?.data?.errors,
      };
    }
  }, [updateBook]);
  
  return {
    updateBook: update,
    isLoading,
    error: error ? (error as { data?: { message?: string } })?.data?.message : null,
  };
};


export const useDeleteBook = () => {
  const [deleteBook, { isLoading, error }] = useDeleteBookMutation();
  
  const deleteBookById = useCallback(async (bookId: string) => {
    try {
      const result = await deleteBook(bookId).unwrap();
      return {
        success: result.success,
        message: result.message,
      };
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      return {
        success: false,
        message: error?.data?.message || 'Failed to delete book',
      };
    }
  }, [deleteBook]);
  
  return {
    deleteBook: deleteBookById,
    isLoading,
    error: error ? (error as { data?: { message?: string } })?.data?.message : null,
  };
};


export const useBorrowBook = () => {
  const [borrowBook, { isLoading, error }] = useBorrowBookMutation();
  
  const borrow = useCallback(async (borrowData: BorrowRequest) => {
    try {
      const result = await borrowBook(borrowData).unwrap();
      return {
        success: result.success,
        data: result.data,
        message: result.message,
      };
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; errors?: Array<{ field: string; message: string }> } };
      return {
        success: false,
        data: null,
        message: error?.data?.message || 'Failed to borrow book',
        errors: error?.data?.errors,
      };
    }
  }, [borrowBook]);
  
  return {
    borrowBook: borrow,
    isLoading,
    error: error ? (error as { data?: { message?: string } })?.data?.message : null,
  };
};


export const useBorrowSummary = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetBorrowSummaryQuery();
  
  return {
    borrowSummary: data?.data || [],
    error: error ? (error as { data?: { message?: string } })?.data?.message || 'Failed to fetch borrow summary' : null,
    isLoading,
    isFetching,
    refetch,
    success: data?.success || false,
  };
}; 