import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');

window.onerror = function(msg, url, line, col, error) {
    console.error('Global error:', msg, line, col, error);
    if (rootElement) {
        rootElement.innerHTML = `
            <div style="background: #020617; color: #f43f5e; padding: 2rem; font-family: sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Error Loading Application</h1>
                <p style="color: rgba(255,255,255,0.6); max-width: 600px;">${msg}</p>
                <pre style="margin-top: 2rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 0.5rem; font-family: monospace; font-size: 0.8rem; text-align: left; overflow: auto; max-width: 90vw; max-height: 300px; color: #818cf8;">${error?.stack || 'No stack trace available'}</pre>
                <button onclick="window.location.reload()" style="margin-top: 2rem; padding: 0.75rem 2rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">Reload Page</button>
            </div>
        `;
    }
    return false;
};

window.onunhandledrejection = function(event) {
    console.error('Unhandled promise rejection:', event.reason);
};

if (!rootElement) {
    document.body.innerHTML = '<div style="padding: 2rem; text-align: center; color: red;">Error: Root element not found!</div>';
} else {
    try {
        console.log('RelxPrep AI: Initializing application...');
        ReactDOM.createRoot(rootElement).render(
            <React.StrictMode>
                <BrowserRouter>
                    <ErrorBoundary>
                        <AuthProvider>
                            <App />
                        </AuthProvider>
                    </ErrorBoundary>
                </BrowserRouter>
            </React.StrictMode>
        );
        console.log('RelxPrep AI: Application mounted successfully');
    } catch (error) {
        console.error('Fatal render error:', error);
        rootElement.innerHTML = `
            <div style="background: #020617; color: #f43f5e; padding: 2rem; font-family: sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Application Crash Detected</h1>
                <p style="color: rgba(255,255,255,0.6); max-width: 400px;">${error.message}</p>
                <pre style="margin-top: 2rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 0.5rem; font-family: monospace; font-size: 0.8rem; text-align: left; overflow: auto; max-width: 90vw; max-height: 300px; color: #818cf8;">${error.stack}</pre>
                <button onclick="window.location.reload()" style="margin-top: 2rem; padding: 0.75rem 2rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">Reload Page</button>
            </div>
        `;
    }
}
