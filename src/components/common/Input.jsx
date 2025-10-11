import { forwardRef } from 'react';

export const Input = forwardRef(({
                                     label,
                                     error,
                                     helperText,
                                     icon,
                                     fullWidth = true,
                                     className = '',
                                     ...props
                                 }, ref) => {
    return (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="mb-2 block text-sm font-medium text-gray-200">
                    {label}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}

                <input
                    ref={ref}
                    className={`
            w-full rounded-lg border bg-gray-700 px-4 py-2.5 text-white
            placeholder-gray-400 transition-colors
            focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500' : 'border-gray-600'}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-400">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
