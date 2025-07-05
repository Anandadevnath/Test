import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface BorrowFormData {
  bookId: string;
  quantity: number;
  dueDate: string;
}

interface BorrowState {
  borrowForm: BorrowFormData;
  isFormValid: boolean;
  summaryFilters: {
    startDate: string;
    endDate: string;
    status: 'all' | 'active' | 'returned' | 'overdue';
    sortBy: 'borrowDate' | 'dueDate' | 'bookTitle' | 'quantity';
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: BorrowState = {
  borrowForm: {
    bookId: '',
    quantity: 1,
    dueDate: '',
  },
  isFormValid: false,
  summaryFilters: {
    startDate: '',
    endDate: '',
    status: 'all',
    sortBy: 'borrowDate',
    sortOrder: 'desc',
  },
};

const borrowSlice = createSlice({
  name: 'borrow',
  initialState,
  reducers: {
    setBorrowFormBookId: (state, action: PayloadAction<string>) => {
      state.borrowForm.bookId = action.payload;
    },
    setBorrowFormQuantity: (state, action: PayloadAction<number>) => {
      state.borrowForm.quantity = Math.max(1, action.payload);
    },
    setBorrowFormDueDate: (state, action: PayloadAction<string>) => {
      state.borrowForm.dueDate = action.payload;
    },
    resetBorrowForm: (state) => {
      state.borrowForm = {
        bookId: '',
        quantity: 1,
        dueDate: '',
      };
      state.isFormValid = false;
    },
    setFormValid: (state, action: PayloadAction<boolean>) => {
      state.isFormValid = action.payload;
    },
    
    setSummaryStartDate: (state, action: PayloadAction<string>) => {
      state.summaryFilters.startDate = action.payload;
    },
    setSummaryEndDate: (state, action: PayloadAction<string>) => {
      state.summaryFilters.endDate = action.payload;
    },
    setSummaryStatus: (state, action: PayloadAction<'all' | 'active' | 'returned' | 'overdue'>) => {
      state.summaryFilters.status = action.payload;
    },
    setSummarySortBy: (state, action: PayloadAction<'borrowDate' | 'dueDate' | 'bookTitle' | 'quantity'>) => {
      state.summaryFilters.sortBy = action.payload;
    },
    setSummarySortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.summaryFilters.sortOrder = action.payload;
    },
    resetSummaryFilters: (state) => {
      state.summaryFilters = {
        startDate: '',
        endDate: '',
        status: 'all',
        sortBy: 'borrowDate',
        sortOrder: 'desc',
      };
    },
  },
});

export const {
  setBorrowFormBookId,
  setBorrowFormQuantity,
  setBorrowFormDueDate,
  resetBorrowForm,
  setFormValid,
  setSummaryStartDate,
  setSummaryEndDate,
  setSummaryStatus,
  setSummarySortBy,
  setSummarySortOrder,
  resetSummaryFilters,
} = borrowSlice.actions;

export default borrowSlice.reducer;
