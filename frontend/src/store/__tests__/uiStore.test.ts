import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ theme: 'light', mobileMenuOpen: false });
  });

  it('defaults to light theme', () => {
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('toggleTheme flips between light and dark', () => {
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('dark');
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('setTheme sets an explicit value', () => {
    useUIStore.getState().setTheme('dark');
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('setMobileMenuOpen toggles the mobile menu flag', () => {
    useUIStore.getState().setMobileMenuOpen(true);
    expect(useUIStore.getState().mobileMenuOpen).toBe(true);
  });
});
