import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './context/ToastContext';

const EXIT_ANIMATION_MS = 220;

const Demo = () => {
  const { addToast } = useToast();

  return (
    <>
      <button
        onClick={() =>
          addToast({
            message: 'Пауза по наведению',
            type: 'success',
            duration: 3000,
          })
        }
      >
        open-paused
      </button>

      <button
        onClick={() =>
          addToast({
            message: 'Дубликат тоста',
            type: 'warning',
            duration: 3000,
          })
        }
      >
        open-duplicate
      </button>

      <button
        onClick={() =>
          addToast({
            message: 'Короткий тост',
            type: 'error',
            duration: 1000,
          })
        }
      >
        open-short
      </button>
    </>
  );
};

describe('Тосты: бизнес-логика (Vitest)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('ставит таймер на паузу при наведении и продолжает с остатка', () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('open-paused'));

    const toastMessage = screen.getByText('Пауза по наведению');
    const toastElement = toastMessage.closest('.toast');
    if (!toastElement) throw new Error('Не найден корневой элемент тоста (.toast)');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    fireEvent.mouseEnter(toastElement);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Пауза по наведению')).not.toBeNull();

    fireEvent.mouseLeave(toastElement);

    act(() => {
      vi.advanceTimersByTime(1000 + EXIT_ANIMATION_MS);
    });

    expect(screen.queryByText('Пауза по наведению')).toBeNull();
  });

  it('не создаёт дубликат и продлевает существующий тост', () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    );

    const btn = screen.getByText('open-duplicate');
    fireEvent.click(btn);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    fireEvent.click(btn);

    expect(screen.getAllByText('Дубликат тоста')).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.queryByText('Дубликат тоста')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1500 + EXIT_ANIMATION_MS);
    });

    expect(screen.queryByText('Дубликат тоста')).toBeNull();
  });

  it('перед удалением из DOM проигрывает анимацию скрытия', () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('open-short'));

    const toastMessage = screen.getByText('Короткий тост');
    const toastElement = toastMessage.closest('.toast');
    if (!toastElement) throw new Error('Не найден корневой элемент тоста (.toast)');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Короткий тост')).not.toBeNull();
    expect(toastElement.classList.contains('isLeaving')).toBe(true);

    act(() => {
      vi.advanceTimersByTime(EXIT_ANIMATION_MS - 1);
    });
    expect(screen.queryByText('Короткий тост')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('Короткий тост')).toBeNull();
  });
});