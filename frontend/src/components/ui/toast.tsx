'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { Button } from './button';

export interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'info' | 'loading';
    title: string;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const toastIcons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    loading: Loader2,
};

const toastColors = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800/50 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800/50 dark:text-red-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800/50 dark:text-blue-200',
    loading: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800/50 dark:text-yellow-200',
};

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const Icon = toastIcons[type];

    useEffect(() => {
        if (type === 'loading') return; // Don't auto-hide loading toasts

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose, type]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300);
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className={`rounded-lg border p-4 shadow-lg ${toastColors[type]}`}>
                <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${type === 'loading' ? 'animate-spin' : ''
                        }`} />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{title}</h4>
                        <p className="text-sm mt-1 opacity-90">{message}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: ToastProps = {
            ...toast,
            id,
            onClose: removeToast,
        };
        setToasts(prev => [...prev, newToast]);
        return id; // Return the toast ID so it can be referenced later
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const updateToast = (id: string, updates: Partial<Omit<ToastProps, 'id' | 'onClose'>>) => {
        setToasts(prev => prev.map(toast =>
            toast.id === id ? { ...toast, ...updates } : toast
        ));
    };

    // Expose toast functions globally
    useEffect(() => {
        (window as any).showToast = addToast;
        (window as any).removeToast = removeToast;
        (window as any).updateToast = updateToast;
        return () => {
            delete (window as any).showToast;
            delete (window as any).removeToast;
            delete (window as any).updateToast;
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
} 