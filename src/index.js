import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

// Sopprimi l'errore benigno di ResizeObserver
const resizeObserverError = /ResizeObserver loop completed with undelivered notifications|ResizeObserver loop limit exceeded/;

const originalConsoleError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' && resizeObserverError.test(args[0])) {
        return;
    }
    originalConsoleError.apply(console, args);
};

window.addEventListener('error', e => {
    if (resizeObserverError.test(e.message)) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);