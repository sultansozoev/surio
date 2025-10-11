import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
                          isOpen,
                          onClose,
                          title,
                          children,
                          size = 'md',
                          showCloseButton = true,
                          closeOnOverlayClick = true,
                          className = ''
                      }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === modalRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-full mx-4'
    };

    return (
        <div
            ref={modalRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
            <div
                className={`
          relative w-full animate-scale-in rounded-lg bg-gray-800 shadow-2xl
          ${sizes[size]}
          ${className}
        `}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
                        {title && (
                            <h2 className="text-2xl font-bold text-white">{title}</h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="px-6 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
