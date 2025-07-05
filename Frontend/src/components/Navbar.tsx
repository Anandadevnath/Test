import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/books" className="text-xl font-bold text-gray-800">
              📚 Library Management
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link
              to="/books"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/books')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Books
            </Link>
            
            <Link
              to="/create-book"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/create-book')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Add Book
            </Link>
            
            <Link
              to="/borrow-summary"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/borrow-summary')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Borrow Summary
            </Link>

            {/* View Toggle - Only show on books pages */}
            {(location.pathname === '/books' || location.pathname === '/books-table') && (
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <Link
                  to="/books"
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    isActive('/books')
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Grid View"
                >
                  ⊞
                </Link>
                <Link
                  to="/books-table"
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    isActive('/books-table')
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Table View"
                >
                  ☰
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
