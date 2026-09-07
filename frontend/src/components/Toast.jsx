import React, { useEffect } from 'react';
import { CircleCheck, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === 'error' || message.toLowerCase().includes('fail') || message.toLowerCase().includes('error');
  const isInfo = type === 'info';

  const bgColor = isError ? 'var(--danger-light, #fef2f2)' : isInfo ? 'var(--secondary-light, #e0f2fe)' : 'var(--success-light, #ecfdf5)';
  const textColor = isError ? 'var(--danger, #ef4444)' : isInfo ? 'var(--secondary, #0284c7)' : 'var(--success, #10b981)';
  const borderColor = isError ? 'rgba(239, 68, 68, 0.3)' : isInfo ? 'rgba(2, 132, 199, 0.3)' : 'rgba(16, 185, 129, 0.3)';

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 20px',
      backgroundColor: bgColor,
      color: textColor,
      borderRadius: '12px',
      border: `1px solid ${borderColor}`,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(10px)',
      minWidth: '280px',
      maxWidth: '450px',
      fontSize: '0.9rem',
      fontWeight: '600',
      animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {isError ? (
        <AlertTriangle size={20} style={{ flexShrink: 0 }} />
      ) : isInfo ? (
        <Info size={20} style={{ flexShrink: 0 }} />
      ) : (
        <CircleCheck size={20} style={{ flexShrink: 0 }} />
      )}

      <span style={{ flex: 1, lineHeight: '1.4' }}>{message}</span>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: textColor,
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          opacity: 0.85,
          transition: 'opacity 0.2s'
        }}
        title="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
