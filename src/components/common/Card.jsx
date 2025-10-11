export const Card = ({
                         children,
                         className = '',
                         hover = true,
                         padding = true,
                         onClick
                     }) => {
    return (
        <div
            onClick={onClick}
            className={`
        rounded-lg bg-gray-800
        ${padding ? 'p-6' : ''}
        ${hover ? 'transition-all hover:bg-gray-750 hover:shadow-lg' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};