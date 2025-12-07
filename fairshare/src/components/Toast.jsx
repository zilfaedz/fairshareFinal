import React, { useEffect } from 'react';
import { AlertCircle, X, CheckCircle } from 'lucide-react';

const Toast = ({ message, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const text = typeof message === 'string' ? message : (message.text || '');
    const type = typeof message === 'string' ? (message.toLowerCase().includes('success') ? 'success' : 'info') : (message.type || 'info');

    let backgroundColor = '#2b6cb0'; // info (blue)
    let Icon = AlertCircle;
    if (type === 'success') {
        backgroundColor = '#38a169';
        Icon = CheckCircle;
    } else if (type === 'error') {
        backgroundColor = '#FF4D4F';
        Icon = AlertCircle;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor,
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
        }}>
            <Icon size={20} />
            <span>{text}</span>
            <button onClick={onClose} style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                marginLeft: '10px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <X size={16} />
            </button>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Toast;
