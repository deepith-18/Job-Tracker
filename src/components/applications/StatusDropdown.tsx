import React, { useRef, useEffect } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative inline-block">
      <Badge status={current} interactive onClick={isOpen ? onClose : onOpen} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown-menu absolute z-50 mt-2"
            style={{ left: 0, minWidth: 200 }}
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: 'spring', damping: 28, stiffness: 420 }}
          >
            <div className="p-1.5">
              {APPLICATION_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  className="dropdown-item w-full text-left rounded-lg"
                  onClick={() => {
                    onSelect(status);
                    onClose();
                  }}
                >
                  <Badge status={status} />
                  {status === current && (
                    <svg
                      className="ml-auto w-3.5 h-3.5 flex-shrink-0"
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
      </AnimatePresence>
    </div>
  );
};
