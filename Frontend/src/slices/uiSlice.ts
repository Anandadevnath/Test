import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isLoading: boolean;
  sidebarOpen: boolean;
  currentPage: string;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedGenre: string;
  itemsPerPage: number;
  currentPageNumber: number;
}

const initialState: UiState = {
  isLoading: false,
  sidebarOpen: false,
  currentPage: 'books',
  searchQuery: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  selectedGenre: '',
  itemsPerPage: 10,
  currentPageNumber: 1,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPageNumber = 1;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    setSelectedGenre: (state, action: PayloadAction<string>) => {
      state.selectedGenre = action.payload;
      state.currentPageNumber = 1;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPageNumber = 1;
    },
    setCurrentPageNumber: (state, action: PayloadAction<number>) => {
      state.currentPageNumber = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.selectedGenre = '';
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
      state.currentPageNumber = 1;
    },
  },
});

export const {
  setLoading,
  toggleSidebar,
  setSidebarOpen,
  setCurrentPage,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setSelectedGenre,
  setItemsPerPage,
  setCurrentPageNumber,
  resetFilters,
} = uiSlice.actions;

export default uiSlice.reducer;
