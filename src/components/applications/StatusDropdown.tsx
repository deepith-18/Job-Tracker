import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { APPLICATION_STATUSES, type ApplicationStatus } from '../../types';

interface StatusDropdownProps {
  current: ApplicationStatus;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (status: ApplicationStatus) => void;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  current,
  isOpen,
  onOpen,
  onClose,
  onSelect,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Compute fixed coordinates relative to viewport whenever dropdown opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - 216);
      const top = rect.bottom + 6;
      setCoords({ top, left });
    }
  }, [isOpen]);

  // Handle outside click & update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleReposition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const left = Math.min(Math.max(8, rect.left), window.innerWidth - 216);
        const top = rect.bottom + 6;
        setCoords({ top, left });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={buttonRef} className="inline-block" style={{ position: 'relative' }}>
      <Badge status={current} interactive onClick={isOpen ? onClose : onOpen} />

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                className="dropdown-menu"
                style={{
                  position: 'fixed',
                  top: coords.top,
                  left: coords.left,
                  minWidth: 200,
                  zIndex: 999999,
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: 6,
                  boxShadow: '0 10px 38px rgba(15,23,42,0.18), 0 4px 12px rgba(15,23,42,0.08)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {APPLICATION_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.12s',
                      }}
                      className="dropdown-item-hover"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(status);
                        onClose();
                      }}
                    >
                      <Badge status={status} />
                      {status === current && (
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="var(--accent)"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

