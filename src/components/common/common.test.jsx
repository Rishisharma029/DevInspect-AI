import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TerminalBlock from './TerminalBlock';
import GlitchText from './GlitchText';

// Mock Framer Motion since it can cause issues in jsdom environment with animations
vi.mock('motion/react', () => {
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>),
      span: React.forwardRef(({ children, ...props }, ref) => <span ref={ref} {...props}>{children}</span>),
      circle: React.forwardRef(({ children, ...props }, ref) => <circle ref={ref} {...props}>{children}</circle>),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

// Mock the context provider
vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    state: { settings: {} },
  }),
}));

describe('DevInspect AI Common UI Components', () => {
  describe('TerminalBlock', () => {
    it('renders the header title and child content', () => {
      render(
        <TerminalBlock title="SYS_LOG">
          <p>Kernel loaded</p>
        </TerminalBlock>
      );
      expect(screen.getByText('SYS_LOG')).toBeInTheDocument();
      expect(screen.getByText('Kernel loaded')).toBeInTheDocument();
    });
  });

  describe('GlitchText', () => {
    it('renders text with appropriate tags', () => {
      render(<GlitchText text="JUDGMENT" tag="h1" />);
      const heading = screen.getByRole('heading', { name: 'JUDGMENT' });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });
  });
});
