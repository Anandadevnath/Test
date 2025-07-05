import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  Book, 
  CreateBookRequest, 
  UpdateBookRequest, 
  BorrowRequest, 
  BorrowRecord, 
  BorrowSummaryItem,
  ApiResponse 
} from '../types';


export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://library-eight-brown.vercel.app/api',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Book', 'Borrow'],
  endpoints: (builder) => ({
   
    getBooks: builder.query<ApiResponse<Book[]>, {
      filter?: string;
      sortBy?: string;
      sort?: 'asc' | 'desc';
      limit?: number;
    }>({
      query: (params) => ({
        url: '/books',
        params,
      }),
      providesTags: ['Book'],
    }),

    getBook: builder.query<ApiResponse<Book>, string>({
      query: (bookId) => `/books/${bookId}`,
      providesTags: (_result, _error, bookId) => [{ type: 'Book', id: bookId }],
    }),

    createBook: builder.mutation<ApiResponse<Book>, CreateBookRequest>({
      query: (book) => ({
        url: '/books',
        method: 'POST',
        body: book,
      }),
      invalidatesTags: ['Book'],
    }),

    updateBook: builder.mutation<ApiResponse<Book>, { bookId: string; updates: UpdateBookRequest }>({
      query: ({ bookId, updates }) => ({
        url: `/books/${bookId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { bookId }) => [
        'Book',
        { type: 'Book', id: bookId }
      ],
    }),

    deleteBook: builder.mutation<ApiResponse<null>, string>({
      query: (bookId) => ({
        url: `/books/${bookId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Book'],
    }),

   
    borrowBook: builder.mutation<ApiResponse<BorrowRecord>, BorrowRequest>({
      query: (borrowRequest) => ({
        url: '/borrow',
        method: 'POST',
        body: borrowRequest,
      }),
      invalidatesTags: ['Book', 'Borrow'],
    }),

    getBorrowSummary: builder.query<ApiResponse<BorrowSummaryItem[]>, void>({
      query: () => '/borrow',
      providesTags: ['Borrow'],
    }),
  }),
});


export const {
  useGetBooksQuery,
  useGetBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useBorrowBookMutation,
  useGetBorrowSummaryQuery,
} = libraryApi; 