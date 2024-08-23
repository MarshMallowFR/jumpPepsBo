'use client';

import { ToastType, useToastContext } from '@/app/lib/contexts/toastContext';
import { useEffect } from 'react';

const ToastWrapper = ({
  visible,
  message,
  toastType,
}: {
  visible: boolean;
  message?: string | null;
  toastType: ToastType;
}) => {
  const { setIsVisible, setToastType, setToastMessage } = useToastContext();

  useEffect(() => {
    if (visible && message) {
      setIsVisible(visible);
      setToastMessage(message);
      setToastType(toastType);
    }
  }, [visible]);

  return null;
};

export default ToastWrapper;
