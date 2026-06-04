import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Check, Loader2, AlertCircle, Unlink } from 'lucide-react';
import { useN8nConnection } from '../../hooks/useN8nConnection.js';

interface ConnectN8nPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectN8nPanel({ isOpen, onClose }: ConnectN8nPanelProps) {
  const { connection, connect, disconnect, testing, testError } = useN8nConnection();
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  async function handleConnect() {
    if (!baseUrl.trim() || !apiKey.trim()) return;
    const ok = await connect(baseUrl.trim(), apiKey.trim());
    if (ok) {
      setBaseUrl('');
      setApiKey('');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--glass-floating)',
    backdropFilter: 'var(--glass-blur-floating)',
    WebkitBackdropFilter: 'var(--glass-blur-floating)',
    border: '1px solid var(--glass-border)',
    borderTopColor: 'var(--glass-border-bright)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text)',
    outline: 'none',
    boxShadow: 'var(--shadow-inset-top)',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '360px',
              background: 'var(--glass-elevated)',
              backdropFilter: 'var(--glass-blur-elevated)',
              WebkitBackdropFilter: 'var(--glass-blur-elevated)',
              borderLeft: '1px solid var(--glass-border)',
              borderLeftColor: 'var(--glass-border-bright)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lift)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-inset-top)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link size={14} style={{ color: 'var(--tint-mint)' }} />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  Connect n8n
                </span>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--glass-floating)',
                  border: '1px solid var(--glass-border)',
                  borderTopColor: 'var(--glass-border-bright)',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-inset-top)',
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {connection ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(74,222,128,0.07)',
                      border: '1px solid rgba(74,222,128,0.22)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                    }}
                  >
                    <Check size={13} style={{ color: 'var(--color-success)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-success)' }}>
                      Connected
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {connection.baseUrl}
                  </div>
                  <button
                    onClick={disconnect}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--glass-floating)',
                      border: '1px solid var(--glass-border)',
                      borderTopColor: 'var(--glass-border-bright)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 14px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-inset-top)',
                    }}
                  >
                    <Unlink size={12} />
                    Disconnect
                  </button>
                </div>
              ) : (
                <>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                    }}
                  >
                    Connect your n8n instance to deploy workflows directly. Credentials are stored in session memory only — never sent to this server.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        n8n Base URL
                      </span>
                      <input
                        type="url"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://your-n8n-instance.com"
                        style={inputStyle}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        API Key
                      </span>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="n8n_api_…"
                        style={inputStyle}
                      />
                    </label>
                  </div>

                  {testError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--color-danger)',
                      }}
                    >
                      <AlertCircle size={12} />
                      {testError}
                    </div>
                  )}

                  <button
                    onClick={handleConnect}
                    disabled={!baseUrl.trim() || !apiKey.trim() || testing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'var(--glass-floating)',
                      backdropFilter: 'var(--glass-blur-floating)',
                      color: 'var(--text)',
                      border: '1px solid var(--glass-border)',
                      borderTopColor: 'var(--glass-border-bright)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '9px 16px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: testing ? 'not-allowed' : 'pointer',
                      opacity: !baseUrl.trim() || !apiKey.trim() ? 0.5 : 1,
                      letterSpacing: '0.03em',
                      boxShadow: 'var(--shadow-inset-top), var(--shadow-rest)',
                    }}
                  >
                    {testing ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Testing connection…
                      </>
                    ) : (
                      <>
                        <Link size={12} />
                        Connect
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
