import { toast } from 'react-toastify';

interface NotificationOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
}

class NotificationService {
  static show(message: string, options: NotificationOptions = {}) {
    const {
      type = 'info',
      position = 'top-right',
      autoClose = 5000,
      hideProgressBar = false,
      closeOnClick = true,
      pauseOnHover = true
    } = options;

    const toastOptions = {
      position,
      autoClose,
      hideProgressBar,
      closeOnClick,
      pauseOnHover,
      theme: 'light' // This will be handled by our theme context
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warn(message, toastOptions);
        break;
      case 'info':
      default:
        toast.info(message, toastOptions);
        break;
    }
  }

  static success(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    this.show(message, { ...options, type: 'success' });
  }

  static error(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    this.show(message, { ...options, type: 'error' });
  }

  static warning(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    this.show(message, { ...options, type: 'warning' });
  }

  static info(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    this.show(message, { ...options, type: 'info' });
  }

  static dismiss(toastId?: string | number) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }
}

export default NotificationService;