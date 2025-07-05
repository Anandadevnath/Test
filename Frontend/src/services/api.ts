import axios from 'axios';
import type { 
  Book, 
  CreateBookRequest, 
  UpdateBookRequest, 
  BorrowRequest, 
  BorrowRecord, 
  BorrowSummaryItem, 
  ApiResponse 
} from '../types';

const api = axios.create({
  baseURL: 'https://library-eight-brown.vercel.app/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
     
      console.error('No response received:', error.request);
    } else {
     
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

export const bookApi = {
 
  getAllBooks: async (params?: {
    filter?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
    limit?: number;
  }): Promise<ApiResponse<Book[]>> => {
    const response = await api.get('/books', { params });
    return response.data;
  },


  getBookById: async (bookId: string): Promise<ApiResponse<Book>> => {
    const response = await api.get(`/books/${bookId}`);
    return response.data;
  },

  
  createBook: async (bookData: CreateBookRequest): Promise<ApiResponse<Book>> => {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  
  updateBook: async (
    bookId: string, 
    bookData: UpdateBookRequest
  ): Promise<ApiResponse<Book>> => {
    const response = await api.patch(`/books/${bookId}`, bookData);
    return response.data;
  },

  deleteBook: async (bookId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/books/${bookId}`);
    return response.data;
  },
};


export const borrowApi = {

  borrowBook: async (borrowData: BorrowRequest): Promise<ApiResponse<BorrowRecord>> => {
    const response = await api.post('/borrow', borrowData);
    return response.data;
  },

  getBorrowedBooksSummary: async (): Promise<ApiResponse<BorrowSummaryItem[]>> => {
    const response = await api.get('/borrow');
    return response.data;
  },
};


export default api;
