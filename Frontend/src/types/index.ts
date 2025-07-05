// TypeScript interfaces and types for the library management system

export interface Book {
  _id: string;
  title: string;
  author: string;
  genre: 'FICTION' | 'NON_FICTION' | 'SCIENCE' | 'HISTORY' | 'BIOGRAPHY' | 'FANTASY';
  isbn: string;
  description?: string;
  image?: string;
  copies: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  genre: 'FICTION' | 'NON_FICTION' | 'SCIENCE' | 'HISTORY' | 'BIOGRAPHY' | 'FANTASY';
  isbn: string;
  description?: string;
  image?: string;
  copies: number;
  available?: boolean;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  genre?: 'FICTION' | 'NON_FICTION' | 'SCIENCE' | 'HISTORY' | 'BIOGRAPHY' | 'FANTASY';
  isbn?: string;
  description?: string;
  image?: string;
  copies?: number;
  available?: boolean;
}

export interface BorrowRequest {
  book: string; // MongoDB ObjectId
  quantity: number;
  dueDate: string; // ISO date string
}

export interface BorrowRecord {
  _id: string;
  book: string;
  quantity: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowSummaryItem {
  book: {
    title: string;
    isbn: string;
  };
  totalQuantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export const GENRE_OPTIONS = [
  'FICTION',
  'NON_FICTION', 
  'SCIENCE',
  'HISTORY',
  'BIOGRAPHY',
  'FANTASY'
] as const;
