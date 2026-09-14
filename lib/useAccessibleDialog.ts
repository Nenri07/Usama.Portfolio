'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

interface AccessibleDialogOptions {
  open: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Keep body lock and opener restoration, but suspend this dialog's keyboard
   *  handling while a nested, topmost dialog is open. */
  suspended?: boolean;
}

/**
 * Shared modal lifecycle with nested-dialog support.
 *
 * Body locking/restoration lives for the whole open lifetime. Focus and key
 * handling can be suspended independently, preventing a parent Escape/focus
 * trap from racing a child lightbox while preserving the parent's opener.
 */
export function useAccessibleDialog({
  open,
  onClose,
  containerRef,
  initialFocusRef,
  suspended = false,
}: AccessibleDialogOptions): void {
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      hasFocusedRef.current = false;
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth,
    );

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      hasFocusedRef.current = false;
      previouslyFocused?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || suspended || typeof document === 'undefined') return;

    let focusFrame = 0;
    if (!hasFocusedRef.current) {
      hasFocusedRef.current = true;
      focusFrame = window.requestAnimationFrame(() => {
        const container = containerRef.current;
        const target =
          initialFocusRef?.current ??
          container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
          container;
        target?.focus();
      });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          !element.hasAttribute('disabled') &&
          element.getAttribute('aria-hidden') !== 'true' &&
          element.getClientRects().length > 0,
      );

      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !container.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (focusFrame) window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, initialFocusRef, onClose, open, suspended]);
}
