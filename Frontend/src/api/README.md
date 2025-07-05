# RTK Query Implementation for Library Management System

This directory contains the RTK Query implementation for the Library Management System API. RTK Query is a powerful data fetching and caching tool that eliminates the need to hand-write data fetching & caching logic.

## Overview

The implementation includes:
- **`libraryApi.ts`** - Main API slice with all endpoints
- **`hooks.ts`** - Custom hooks with better error handling
- **`index.ts`** - Export file for easy importing
- **`examples/`** - Example components showing usage

## Features

✅ **Automatic Caching** - Data is cached and automatically updated  
✅ **Loading States** - Built-in loading and error states  
✅ **Optimistic Updates** - UI updates immediately while request is in flight  
✅ **Automatic Refetching** - Data refetches when window regains focus  
✅ **Cache Invalidation** - Automatic cache updates when data changes  
✅ **TypeScript Support** - Full type safety throughout  
✅ **Error Handling** - Consistent error handling across all endpoints  

## API Endpoints

### Books
- `GET /api/books` - Get all books with filtering and sorting
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book
- `PATCH /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Borrow
- `POST /api/borrow` - Borrow a book
- `GET /api/borrow` - Get borrow summary

## Usage

### Basic Usage with Generated Hooks

```tsx
import { useGetBooksQuery, useCreateBookMutation } from '../api';

const BookList = () => {
  // Query hook - automatically fetches data
  const { data, error, isLoading } = useGetBooksQuery();
  
  // Mutation hook - for creating books
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();

  const handleCreate = async (bookData) => {
    try {
      const result = await createBook(bookData).unwrap();
      console.log('Book created:', result.data);
    } catch (error) {
      console.error('Failed to create book:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data?.map(book => (
        <div key={book._id}>{book.title}</div>
      ))}
    </div>
  );
};
```

### Using Custom Hooks (Recommended)

```tsx
import { useBooks, useCreateBook } from '../api';

const BookList = () => {
  // Custom hook with better error handling
  const { books, error, isLoading, refetch } = useBooks({
    filter: 'FICTION',
    sortBy: 'title',
    sort: 'asc',
    limit: 10
  });
  
  const { createBook, isLoading: isCreating } = useCreateBook();

  const handleCreate = async (bookData) => {
    const result = await createBook(bookData);
    
    if (result.success) {
      // Success - cache is automatically invalidated
      console.log('Book created:', result.data);
    } else {
      // Error handling
      console.error('Failed to create book:', result.message);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {books.map(book => (
        <div key={book._id}>{book.title}</div>
      ))}
    </div>
  );
};
```

## Available Hooks

### Query Hooks (Read Operations)

```tsx
// Get all books with optional parameters
const { books, error, isLoading, refetch } = useBooks({
  filter?: string;        // Filter by genre
  sortBy?: string;        // Field to sort by
  sort?: 'asc' | 'desc';  // Sort direction
  limit?: number;         // Number of books to return
});

// Get single book
const { book, error, isLoading, refetch } = useBook(bookId);

// Get borrow summary
const { borrowSummary, error, isLoading, refetch } = useBorrowSummary();
```

### Mutation Hooks (Write Operations)

```tsx
// Create book
const { createBook, isLoading, error } = useCreateBook();
const result = await createBook(bookData);

// Update book
const { updateBook, isLoading, error } = useUpdateBook();
const result = await updateBook(bookId, updates);

// Delete book
const { deleteBook, isLoading, error } = useDeleteBook();
const result = await deleteBook(bookId);

// Borrow book
const { borrowBook, isLoading, error } = useBorrowBook();
const result = await borrowBook(borrowData);
```

## Response Format

All hooks return data in a consistent format:

### Query Hooks Return
```tsx
{
  data: T[],           // The actual data
  error: string | null, // Error message if any
  isLoading: boolean,   // Loading state
  isFetching: boolean,  // Fetching state (for background updates)
  refetch: () => void,  // Function to manually refetch
  success: boolean      // Success status
}
```

### Mutation Hooks Return
```tsx
{
  mutate: (data) => Promise<Result>, // Function to trigger mutation
  isLoading: boolean,                 // Loading state
  error: string | null               // Error message if any
}
```

### Mutation Result Format
```tsx
{
  success: boolean,     // Whether the operation succeeded
  data: T | null,      // Response data (null for delete operations)
  message: string,     // Success/error message
  errors?: Array<{     // Validation errors (if any)
    field: string;
    message: string;
  }>
}
```

## Cache Management

RTK Query automatically manages cache invalidation:

- **Books cache** is invalidated when:
  - A book is created, updated, or deleted
  - A book is borrowed (affects available copies)

- **Borrow cache** is invalidated when:
  - A book is borrowed

### Manual Cache Invalidation

```tsx
import { libraryApi } from '../api';

// Invalidate all books
dispatch(libraryApi.util.invalidateTags(['Book']));

// Invalidate specific book
dispatch(libraryApi.util.invalidateTags([{ type: 'Book', id: bookId }]));
```

## Error Handling

The custom hooks provide consistent error handling:

```tsx
const { books, error, isLoading } = useBooks();

if (error) {
  // error is a string message
  return <div>Error: {error}</div>;
}

// For mutations
const { createBook } = useCreateBook();

const handleSubmit = async (data) => {
  const result = await createBook(data);
  
  if (result.success) {
    // Success case
    console.log(result.data);
  } else {
    // Error case
    console.error(result.message);
    
    // Handle validation errors
    if (result.errors) {
      result.errors.forEach(error => {
        console.error(`${error.field}: ${error.message}`);
      });
    }
  }
};
```

## Configuration

The API is configured in `libraryApi.ts`:

```tsx
export const libraryApi = createApi({
  reducerPath: 'libraryApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://librarymanagement2.vercel.app/api',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Book', 'Borrow'],
  endpoints: (builder) => ({
    // ... endpoint definitions
  }),
});
```

## Store Integration

The API is integrated into the Redux store in `store.ts`:

```tsx
import { libraryApi } from '../api/libraryApi';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    // ... other reducers
    [libraryApi.reducerPath]: libraryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(libraryApi.middleware),
});

// Enable refetch on focus/reconnect
setupListeners(store.dispatch);
```

## Example Components

See the `examples/` directory for complete working examples:

- `BookListWithRTKQuery.tsx` - Shows how to replace axios with RTK Query
- `CreateBookWithRTKQuery.tsx` - Shows form handling with RTK Query

## Migration from Axios

To migrate from axios to RTK Query:

1. **Replace axios calls with hooks:**
   ```tsx
   // Before (axios)
   const [books, setBooks] = useState([]);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     axios.get('/api/books').then(res => {
       setBooks(res.data.data);
       setLoading(false);
     });
   }, []);

   // After (RTK Query)
   const { books, isLoading } = useBooks();
   ```

2. **Replace mutation calls:**
   ```tsx
   // Before (axios)
   const handleCreate = async (data) => {
     try {
       const res = await axios.post('/api/books', data);
       // Handle success
     } catch (error) {
       // Handle error
     }
   };

   // After (RTK Query)
   const { createBook } = useCreateBook();
   const handleCreate = async (data) => {
     const result = await createBook(data);
     if (result.success) {
       // Handle success
     } else {
       // Handle error
     }
   };
   ```

## Benefits of RTK Query

1. **Automatic Caching** - No need to manually manage cache
2. **Loading States** - Built-in loading and error states
3. **Optimistic Updates** - UI updates immediately
4. **Background Refetching** - Data stays fresh automatically
5. **TypeScript Support** - Full type safety
6. **Reduced Boilerplate** - Less code to write and maintain
7. **Performance** - Efficient caching and request deduplication

## Troubleshooting

### Common Issues

1. **Cache not updating**: Check that `invalidatesTags` is properly configured
2. **Loading states not working**: Ensure you're using the correct hook properties
3. **Type errors**: Make sure your TypeScript types match the API response format

### Debug Tips

```tsx
// Enable RTK Query dev tools
import { libraryApi } from '../api';

// Log cache state
console.log(libraryApi.util.getState());

// Check if data is cached
const isCached = libraryApi.util.getRunningQueriesThunk();
```

## Resources

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [API Documentation](../API_DOCUMENTATION.md) 