import React, { createContext, useContext, useState, useCallback } from 'react';
import { CircleCheck, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

const GlobalUIContext = createContext(null);

export const useGlobalUI = () => {
  const context = useContext(GlobalUIContext);
  if (!context) {
    throw new Error('useGlobalUI must be used within a GlobalUIProvider');
  }
  return context;
};

export const GlobalUIProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    options: {},
    resolve: null,
  });

  // Unique ID generator for toasts
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    // Auto-remove toast
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options: {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          type: 'danger', // 'danger' | 'primary' | 'success'
          isAlert: false,
          ...options,
        },
        resolve,
      });
    });
  }, []);

  const showAlert = useCallback((message, type = 'success', title = null) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options: {
          title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification'),
          message,
          confirmText: 'OK',
          type: type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary',
          isAlert: true,
        },
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
      setConfirmState(prev => ({ ...prev, isOpen: false }));
    }
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
      setConfirmState(prev => ({ ...prev, isOpen: false }));
    }
  }, [confirmState]);

  return (
    <GlobalUIContext.Provider value={{ showToast, confirm, showAlert }}>
      {children}
      
      {/* Toast Container */}
      <div 
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none' // Let clicks pass through container
        }}
      >
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      {/* Global Confirm Modal */}
      {confirmState.isOpen && (
        <ConfirmModal 
          options={confirmState.options} 
          onConfirm={handleConfirm} 
          onCancel={handleCancel} 
        />
      )}
    </GlobalUIContext.Provider>
  );
};

/* --- Toast Item Component --- */
const ToastItem = ({ toast, onRemove }) => {
  const isError = toast.type === 'error' || toast.message.toLowerCase().includes('fail') || toast.message.toLowerCase().includes('error');
  const isInfo = toast.type === 'info';

  const bgColor = isError ? 'var(--danger-light, #fef2f2)' : isInfo ? 'var(--secondary-light, #e0f2fe)' : 'var(--success-light, #ecfdf5)';
  const textColor = isError ? 'var(--danger, #ef4444)' : isInfo ? 'var(--secondary, #0284c7)' : 'var(--success, #10b981)';
  const borderColor = isError ? 'rgba(239, 68, 68, 0.3)' : isInfo ? 'rgba(2, 132, 199, 0.3)' : 'rgba(16, 185, 129, 0.3)';

  return (
    <div 
      style={{
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
        pointerEvents: 'auto', // Enable clicks on individual toasts
        animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {isError ? (
        <AlertTriangle size={20} style={{ flexShrink: 0 }} />
      ) : isInfo ? (
        <Info size={20} style={{ flexShrink: 0 }} />
      ) : (
        <CircleCheck size={20} style={{ flexShrink: 0 }} />
      )}

      <span style={{ flex: 1, lineHeight: '1.4' }}>{toast.message}</span>

      <button
        onClick={() => onRemove(toast.id)}
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

/* --- Confirm Modal Component --- */
const ConfirmModal = ({ options, onConfirm, onCancel }) => {
  const isDanger = options.type === 'danger';
  const isSuccess = options.type === 'success';
  
  const Icon = isDanger ? AlertTriangle : isSuccess ? CircleCheck : AlertCircle;
  const iconColor = isDanger ? 'var(--danger, #ef4444)' : isSuccess ? 'var(--success, #10b981)' : 'var(--primary, #3b82f6)';
  const iconBg = isDanger ? 'var(--danger-light, #fef2f2)' : isSuccess ? 'var(--success-light, #ecfdf5)' : 'var(--primary-light, #eff6ff)';

  // Handle keyboard events (Esc to cancel, Enter to confirm)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, onConfirm]);

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999, // Ensure it is above everything
      animation: 'modalFadeIn 0.2s ease-out forwards'
    }}>
      <div className="modal-content glass-panel" style={{
        backgroundColor: 'var(--bg-surface, #ffffff)',
        padding: '24px',
        borderRadius: '16px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={24} color={iconColor} />
          </div>

          <div style={{ paddingTop: '4px' }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--text-primary, #0f172a)'
            }}>
              {options.title}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.95rem',
              color: 'var(--text-secondary, #64748b)',
              lineHeight: '1.5'
            }}>
              {options.message}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '24px'
        }}>
          {!options.isAlert && (
            <button
              onClick={onCancel}
              className="btn btn-secondary"
              style={{
                padding: '10px 20px',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              {options.cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`btn ${isDanger ? 'btn-danger' : isSuccess ? 'btn-success' : 'btn-primary'}`}
            style={{
              padding: '10px 20px',
              fontWeight: '600',
              fontSize: '0.95rem',
              backgroundColor: isDanger ? 'var(--danger)' : isSuccess ? 'var(--success)' : 'var(--primary)',
              color: 'white',
              border: 'none'
            }}
          >
            {options.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
