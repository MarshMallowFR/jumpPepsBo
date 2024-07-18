// import { useEffect } from 'react';

// interface ToastProps {
//   message: string;
//   duration?: number;
//   onClose: () => void;
// }

// export const Toast: React.FC<ToastProps> = ({
//   message,
//   duration = 4000,
//   onClose,
// }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, duration);
//     return () => clearTimeout(timer);
//   }, [duration, onClose]);

//   return <div style={toastStyle}>{message}</div>;
// };

// const toastStyle: React.CSSProperties = {
//   position: 'fixed',
//   bottom: '20px',
//   left: '50%',
//   transform: 'translateX(-50%)',
//   backgroundColor: '#333',
//   color: '#fff',
//   padding: '10px 20px',
//   borderRadius: '5px',
//   boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
//   zIndex: 1000,
// };

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
}

export const Toast = ({ message }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-md shadow-lg bg-green-500 text-white">
      {message}
    </div>
  );
};
