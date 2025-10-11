export const Button = ({
                           children,
                           variant = 'primary',
                           size = 'md',
                           fullWidth = false,
                           disabled = false,
                           loading = false,
                           icon,
                           onClick,
                           type = 'button',
                           className = ''
                       }) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
        primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
        outline: 'border-2 border-white text-white hover:bg-white hover:text-black focus:ring-white',
        ghost: 'text-white hover:bg-gray-800 focus:ring-gray-500',
        danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-600'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-2.5 text-base',
        lg: 'px-8 py-3 text-lg'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
        >
            {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : icon ? (
                <span className="flex items-center">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};