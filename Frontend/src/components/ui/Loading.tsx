interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Loading = ({ size = 'md', text = 'Loading...' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-2`}
        ></div>
        <p className="text-gray-600 text-sm">{text}</p>
      </div>
    </div>
  );
};

export default Loading;
