import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import {Input} from "./Input";
import {Button} from "./Button";
import {Spinner} from "./Spinner";
import {Modal} from "./Modal";
import {Card} from "./Card";

export const Alert = ({
                          type = 'info',
                          title,
                          children,
                          onClose,
                          className = ''
                      }) => {
    const types = {
        success: {
            bg: 'bg-green-900/20 border-green-600',
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            text: 'text-green-200'
        },
        error: {
            bg: 'bg-red-900/20 border-red-600',
            icon: <XCircle className="h-5 w-5 text-red-500" />,
            text: 'text-red-200'
        },
        warning: {
            bg: 'bg-yellow-900/20 border-yellow-600',
            icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
            text: 'text-yellow-200'
        },
        info: {
            bg: 'bg-blue-900/20 border-blue-600',
            icon: <Info className="h-5 w-5 text-blue-500" />,
            text: 'text-blue-200'
        }
    };

    const config = types[type];

    return (
        <div className={`rounded-lg border p-4 ${config.bg} ${className}`}>
            <div className="flex gap-3">
                <div className="flex-shrink-0">{config.icon}</div>

                <div className="flex-1">
                    {title && (
                        <h3 className={`mb-1 font-semibold ${config.text}`}>{title}</h3>
                    )}
                    <div className={`text-sm ${config.text}`}>{children}</div>
                </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className={`flex-shrink-0 ${config.text} hover:opacity-75`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

// Export all as default for individual imports
export default {
    Button,
    Spinner,
    Modal,
    Card,
    Input,
    Alert
};