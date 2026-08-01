'use client';
// Client: maneja el estado independiente del menú móvil y su accesibilidad

import { useState, useEffect, useCallback } from 'react';

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next) setIsCategoriesOpen(false);
      return next;
    });
  }, []);

  const toggleCategories = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsCategoriesOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setIsCategoriesOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMenu]);

  return {
    isOpen,
    isCategoriesOpen,
    toggleMenu,
    toggleCategories,
    closeMenu,
  };
}
