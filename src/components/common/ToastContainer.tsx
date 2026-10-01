import React from 'react';
import { Toaster } from 'sonner';

export const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        className: 'font-sans text-sm shadow-xl rounded-2xl border border-slate-200',
        style: {
          padding: '12px 16px',
        },
      }}
    />
  );
};
