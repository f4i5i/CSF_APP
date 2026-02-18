/**
 * Unit Tests for cssStyles.js utility functions
 * Tests: bgBlur, bgGradient, textGradient, filterStyles, hideScrollbarY, hideScrollbarX
 */

// Mock MUI alpha function
jest.mock('@mui/material/styles', () => ({
  alpha: (color: string, opacity: number) => `rgba(${color},${opacity})`,
}));

import { bgBlur, bgGradient, textGradient, filterStyles, hideScrollbarY, hideScrollbarX } from '../../../utils/cssStyles';

describe('cssStyles utilities', () => {
  // ==========================================
  // bgBlur
  // ==========================================
  describe('bgBlur', () => {
    it('should return blur styles without image URL', () => {
      const result = bgBlur({});
      expect(result.backdropFilter).toBe('blur(6px)');
      expect(result.WebkitBackdropFilter).toBe('blur(6px)');
      expect(result.backgroundColor).toBeDefined();
    });

    it('should use default values when no props provided', () => {
      const result = bgBlur(undefined);
      expect(result.backdropFilter).toBe('blur(6px)');
    });

    it('should accept custom blur value', () => {
      const result = bgBlur({ blur: 10 });
      expect(result.backdropFilter).toBe('blur(10px)');
    });

    it('should accept custom color', () => {
      const result = bgBlur({ color: '#ffffff' });
      expect(result.backgroundColor).toBeDefined();
    });

    it('should accept custom opacity', () => {
      const result = bgBlur({ opacity: 0.5 });
      expect(result.backgroundColor).toBeDefined();
    });

    it('should return image-based blur styles when imgUrl is provided', () => {
      const result = bgBlur({ imgUrl: '/bg.jpg' });
      expect(result.position).toBe('relative');
      expect(result.backgroundImage).toBe('url(/bg.jpg)');
      expect(result['&:before']).toBeDefined();
      expect(result['&:before'].backdropFilter).toBe('blur(6px)');
    });
  });

  // ==========================================
  // bgGradient
  // ==========================================
  describe('bgGradient', () => {
    it('should return gradient styles', () => {
      const result = bgGradient({ startColor: '#000', endColor: '#fff' });
      expect(result.background).toContain('linear-gradient');
      expect(result.background).toContain('#000');
      expect(result.background).toContain('#fff');
    });

    it('should use default direction "to bottom"', () => {
      const result = bgGradient({ startColor: '#000', endColor: '#fff' });
      expect(result.background).toContain('to bottom');
    });

    it('should accept custom direction', () => {
      const result = bgGradient({ direction: 'to right', startColor: '#000', endColor: '#fff' });
      expect(result.background).toContain('to right');
    });

    it('should include image URL when provided', () => {
      const result = bgGradient({ imgUrl: '/bg.jpg', startColor: '#000', endColor: '#fff' });
      expect(result.background).toContain('url(/bg.jpg)');
      expect(result.backgroundSize).toBe('cover');
      expect(result.backgroundRepeat).toBe('no-repeat');
      expect(result.backgroundPosition).toBe('center center');
    });

    it('should use color as fallback for start/end colors with image', () => {
      const result = bgGradient({ imgUrl: '/bg.jpg', color: '#333' });
      expect(result.background).toContain('#333');
    });
  });

  // ==========================================
  // textGradient
  // ==========================================
  describe('textGradient', () => {
    it('should return text gradient styles', () => {
      const result = textGradient('45deg, #000, #fff');
      expect(result.background).toContain('-webkit-linear-gradient');
      expect(result.WebkitBackgroundClip).toBe('text');
      expect(result.WebkitTextFillColor).toBe('transparent');
    });
  });

  // ==========================================
  // filterStyles
  // ==========================================
  describe('filterStyles', () => {
    it('should return filter styles with all vendor prefixes', () => {
      const result = filterStyles('blur(5px)');
      expect(result.filter).toBe('blur(5px)');
      expect(result.WebkitFilter).toBe('blur(5px)');
      expect(result.MozFilter).toBe('blur(5px)');
    });
  });

  // ==========================================
  // hideScrollbarY
  // ==========================================
  describe('hideScrollbarY', () => {
    it('should have scrollbar hiding styles for Y axis', () => {
      expect(hideScrollbarY.msOverflowStyle).toBe('none');
      expect(hideScrollbarY.scrollbarWidth).toBe('none');
      expect(hideScrollbarY.overflowY).toBe('scroll');
      expect(hideScrollbarY['&::-webkit-scrollbar']).toEqual({ display: 'none' });
    });
  });

  // ==========================================
  // hideScrollbarX
  // ==========================================
  describe('hideScrollbarX', () => {
    it('should have scrollbar hiding styles for X axis', () => {
      expect(hideScrollbarX.msOverflowStyle).toBe('none');
      expect(hideScrollbarX.scrollbarWidth).toBe('none');
      expect(hideScrollbarX.overflowX).toBe('scroll');
      expect(hideScrollbarX['&::-webkit-scrollbar']).toEqual({ display: 'none' });
    });
  });
});
