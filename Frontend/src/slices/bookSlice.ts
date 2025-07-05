import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Book } from '../types';

interface BookState {
  selectedBooks: string[];
  bookFilters: {
    genre: string;
    availability: 'all' | 'available' | 'unavailable';
    searchTerm: string;
    sortBy: keyof Book;
    sortOrder: 'asc' | 'desc';
  };
  viewMode: 'table' | 'grid' | 'list';
  selectedBookForEdit: Book | null;
  recentlyViewed: string[];
  favorites: string[];
}

const initialState: BookState = {
  selectedBooks: [],
  bookFilters: {
    genre: '',
    availability: 'all',
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  viewMode: 'grid',
  selectedBookForEdit: null,
  recentlyViewed: [],
  favorites: [],
};

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    
    setGenreFilter: (state, action: PayloadAction<string>) => {
      state.bookFilters.genre = action.payload;
    },
    setAvailabilityFilter: (state, action: PayloadAction<'all' | 'available' | 'unavailable'>) => {
      state.bookFilters.availability = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.bookFilters.searchTerm = action.payload;
    },
    setSortBy: (state, action: PayloadAction<keyof Book>) => {
      state.bookFilters.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.bookFilters.sortOrder = action.payload;
    },
    resetFilters: (state) => {
      state.bookFilters = {
        genre: '',
        availability: 'all',
        searchTerm: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
    },
   
    setViewMode: (state, action: PayloadAction<'table' | 'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSelectedBookForEdit: (state, action: PayloadAction<Book | null>) => {
      state.selectedBookForEdit = action.payload;
    },
    
    addToRecentlyViewed: (state, action: PayloadAction<string>) => {
      const bookId = action.payload;
      state.recentlyViewed = state.recentlyViewed.filter(id => id !== bookId);
      state.recentlyViewed.unshift(bookId);
      state.recentlyViewed = state.recentlyViewed.slice(0, 10);
    },
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },
   
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const bookId = action.payload;
      if (state.favorites.includes(bookId)) {
        state.favorites = state.favorites.filter(id => id !== bookId);
      } else {
        state.favorites.push(bookId);
      }
    },
  },
});

export const {
  setGenreFilter,
  setAvailabilityFilter,
  setSearchTerm,
  setSortBy,
  setSortOrder,
  resetFilters,
  setViewMode,
  setSelectedBookForEdit,
  addToRecentlyViewed,
  clearRecentlyViewed,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
} = bookSlice.actions;

export default bookSlice.reducer;
