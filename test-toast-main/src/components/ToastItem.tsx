import { useCallback, useEffect, useRef, useState } from 'react';
import type { Toast } from '../types/types';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const DEFAULT_DURATION = 3000;
const EXIT_ANIMATION_MS = 220;

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimeRef = useRef(0);
  const endAtRef = useRef(0);
  const remainingTimeRef = useRef(toast.duration ?? DEFAULT_DURATION);

  const [leftMs, setLeftMs] = useState<number>(toast.duration ?? DEFAULT_DURATION);
  const [isLeaving, setIsLeaving] = useState(false);
  const isLeavingRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const beginClose = useCallback(() => {
    if (isLeavingRef.current) return; 
    isLeavingRef.current = true;
    setIsLeaving(true);
    clearTimers();
    setTimeout(() => {
      onRemove(toast.id);
    }, EXIT_ANIMATION_MS);
  }, [clearTimers, onRemove, toast.id]);

  const startTicking = useCallback(() => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const left = Math.max(0, endAtRef.current - Date.now());
      setLeftMs(left);

      if (left === 0 && intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 200);
  }, []);

  const startTimer = useCallback(
    (delay: number) => {
      if (isLeavingRef.current) return;

      clearTimers();

      startTimeRef.current = Date.now();
      endAtRef.current = startTimeRef.current + delay;
      remainingTimeRef.current = delay;
      setLeftMs(delay);

      startTicking();

      timeoutRef.current = setTimeout(() => {
        beginClose();
      }, delay);
    },
    [beginClose, clearTimers, startTicking]
  );

  useEffect(() => {
    isLeavingRef.current = false;
    setIsLeaving(false);

    const duration = toast.duration ?? DEFAULT_DURATION;
    startTimer(duration);

    return () => {
      clearTimers();
    };
  }, [toast.id, toast.duration, startTimer, clearTimers]);

  const handleMouseEnter = () => {
    if (isLeavingRef.current) return;
    if (timeoutRef.current === null) return;

    const elapsed = Date.now() - startTimeRef.current;
    const left = Math.max(0, remainingTimeRef.current - elapsed);

    remainingTimeRef.current = left;
    setLeftMs(left);
    clearTimers();
  };

  const handleMouseLeave = () => {
    if (isLeavingRef.current) return;
    startTimer(remainingTimeRef.current);
  };

  const handleClose = () => {
    beginClose();
  };

  const secondsLeft = Math.ceil(leftMs / 1000);

  return (
    <div
      className={`toast toast-${toast.type} ${isLeaving ? 'isLeaving' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="status"
    >
      <span>
        {toast.message}{' '}
        <span style={{ opacity: 0.8, fontVariantNumeric: 'tabular-nums' }}>
          ({secondsLeft}s)
        </span>
      </span>

      <button type="button" aria-label="Закрыть уведомление" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};