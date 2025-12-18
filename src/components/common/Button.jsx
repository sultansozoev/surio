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
        primary: 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 focus:ring-red-500 shadow-lg shadow-red-600/50 border border-white/10',
        secondary: 'bg-gray-700/50 text-white hover:bg-gradient-to-r hover:from-orange-900/30 hover:to-red-900/30 focus:ring-gray-500 backdrop-blur-sm border border-orange-900/30',
        outline: 'border-2 border-orange-600 text-orange-600 hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 hover:text-white focus:ring-orange-500',
        ghost: 'text-white hover:bg-gray-800 focus:ring-gray-500',
        danger: 'bg-gradient-to-r from-orange-600 to-red-700 text-white hover:from-orange-700 hover:to-red-800 focus:ring-red-600 shadow-lg shadow-red-700/50 border border-white/10'
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