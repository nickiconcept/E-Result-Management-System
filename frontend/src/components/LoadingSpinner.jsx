import React from 'react';

export default function LoadingSpinner({ message = "Loading dashboard data..." }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      width: '100%'
    }}>
      <div className="wave-loader">
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
      </div>
      <h3 style={{ 
        marginTop: '25px', 
        color: 'var(--text-secondary)',
        fontWeight: '600',
        fontSize: '1rem',
        letterSpacing: '0.5px'
      }}>
        {message}
      </h3>
      <style>{`
        .wave-loader {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 6px;
          height: 40px;
        }
        .wave-bar {
          width: 6px;
          height: 10px;
          background-color: var(--primary);
          border-radius: 4px;
          animation: wave 1.2s cubic-bezier(0.8, 0, 0.2, 1) infinite;
        }
        .wave-bar:nth-child(1) { animation-delay: 0.0s; }
        .wave-bar:nth-child(2) { animation-delay: 0.1s; }
        .wave-bar:nth-child(3) { animation-delay: 0.2s; }
        .wave-bar:nth-child(4) { animation-delay: 0.3s; }
        .wave-bar:nth-child(5) { animation-delay: 0.4s; }
        
        @keyframes wave {
          0%, 100% {
            height: 10px;
            opacity: 0.4;
          }
          50% {
            height: 40px;
            opacity: 1;
            background-color: #3b82f6; /* bright blue */
          }
        }
      `}</style>
    </div>
  );
}
