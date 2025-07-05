import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import Layout from './components/Layout';
import NotificationContainer from './components/ui/NotificationContainer';
import BookList from './pages/BookList';
import BookListGrid from './pages/BookList_new';
import BookDetail from './pages/BookDetail';
import CreateBook from './pages/CreateBook';
import EditBook from './pages/EditBook';
import BorrowBook from './pages/BorrowBook';
import BorrowSummary from './pages/BorrowSummary';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/books" replace />} />
              <Route path="books" element={<BookListGrid />} />
              <Route path="books-table" element={<BookList />} />
              <Route path="books/:id" element={<BookDetail />} />
              <Route path="create-book" element={<CreateBook />} />
              <Route path="edit-book/:id" element={<EditBook />} />
              <Route path="borrow/:bookId" element={<BorrowBook />} />
              <Route path="borrow-summary" element={<BorrowSummary />} />
            </Route>
          </Routes>
          <NotificationContainer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
