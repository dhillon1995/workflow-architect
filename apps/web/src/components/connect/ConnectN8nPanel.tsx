import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Check, Loader2, AlertCircle, Unlink, ShieldCheck } from 'lucide-react';
import { useN8nConnection } from '../../hooks/useN8nConnection.js';
import Ticks from '../ui/Ticks.js';

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
              background: 'color-mix(in srgb, var(--paper-deep) 65%, transparent)',
              backdropFilter: 'blur(3px)',
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
              maxWidth: '100vw',
              background: 'var(--paper)',
              borderLeft: '1px solid var(--line-strong)',
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
                padding: '16px 18px',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Link size={13} style={{ color: 'var(--accent)' }} />
                <span className="bp-label bp-label--bright" style={{ fontSize: '10px' }}>
                  Connect n8n instance
                </span>
              </div>
              <button
                onClick={onClose}
                className="btn-ghost"
                aria-label="Close panel"
                style={{ padding: '5px', display: 'flex' }}
              >
                <X size={13} />
              </button>
            </div>

            <div style={{ padding: '20px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {connection ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      background: 'var(--success-dim)',
                      border: '1px solid var(--success)',
                      borderLeftWidth: '3px',
                      padding: '10px 14px',
                    }}
                  >
                    <Check size={12} style={{ color: 'var(--success)' }} />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--success)',
                      }}
                    >
                      Connected
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--ink-muted)',
                      wordBreak: 'break-all',
                      lineHeight: 1.6,
                    }}
                  >
                    {connection.baseUrl}
                  </div>
                  <button
                    onClick={disconnect}
                    className="btn-ghost"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '8px 14px',
                      fontSize: '9px',
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Unlink size={11} />
                    Disconnect
                  </button>
                </div>
              ) : (
                <>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'var(--ink-muted)',
                      lineHeight: 1.65,
                    }}
                  >
                    Connect your n8n instance to deploy drafted workflows in one click.
                  </p>

                  {/* Security note */}
                  <div
                    style={{
                      position: 'relative',
                      border: '1px dashed var(--accent-line)',
                      padding: '10px 12px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Ticks color="var(--accent-line)" size={5} />
                    <ShieldCheck size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                      Credentials are held in this browser tab only — your browser calls n8n
                      directly. Nothing is ever sent to this server.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <span className="bp-label" style={{ fontSize: '8px' }}>n8n base URL</span>
                      <input
                        type="url"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://your-instance.app.n8n.cloud"
                        className="bp-input"
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <span className="bp-label" style={{ fontSize: '8px' }}>API key</span>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="n8n_api_…"
                        className="bp-input"
                      />
                    </label>
                  </div>

                  {testError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--danger)',
                      }}
                    >
                      <AlertCircle size={11} style={{ flexShrink: 0 }} />
                      {testError}
                    </div>
                  )}

                  <button
                    onClick={handleConnect}
                    disabled={!baseUrl.trim() || !apiKey.trim() || testing}
                    className="btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px',
                      padding: '10px 16px',
                      fontSize: '10px',
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
                        Test &amp; connect
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Footer note */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)' }}>
              <span className="bp-label" style={{ fontSize: '7.5px' }}>
                n8n cloud → settings → n8n API → create key
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
