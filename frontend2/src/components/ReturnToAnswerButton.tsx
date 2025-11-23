import { useState } from 'react'

interface ReturnToAnswerButtonProps {
  onReturnToAnswer: () => void
  isDemoMode?: boolean
}

export default function ReturnToAnswerButton({ onReturnToAnswer, isDemoMode = false }: ReturnToAnswerButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
      <button
        className="return-to-answer-button"
        onClick={onReturnToAnswer}
        title="Return to answer"
        aria-label="Return to answer node"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Reset/restart icon - circular arrow */}
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
        </svg>
      </button>

      {isDemoMode && (
        <div
          className="demo-mode-indicator"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          style={{ position: 'relative' }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255, 193, 7, 0.2)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 193, 7, 0.5)',
              borderRadius: '6px',
              color: '#ffc107',
              cursor: 'help',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              zIndex: 100,
              boxShadow: '0 4px 16px rgba(255, 193, 7, 0.2)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Warning triangle icon */}
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>

          {showTooltip && (
            <div
              style={{
                position: 'absolute',
                left: '60px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 193, 7, 0.95)',
                color: '#000',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
              }}
            >
              ⚠️ Demo Mode: Showing sample data (backend unavailable)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
