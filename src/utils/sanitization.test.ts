import { describe, it, expect } from 'vitest';
import { sanitizeInput, isValidTextInput } from './sanitization';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeInput('<p>Hello</p>')).toBe('Hello');
    expect(sanitizeInput('<div><span>Test</span></div>')).toBe('Test');
    expect(sanitizeInput('<strong>Bold text</strong>')).toBe('Bold text');
  });

  it('should remove script tags and content', () => {
    expect(sanitizeInput('<script>alert("XSS")</script>')).toBe('');
    expect(sanitizeInput('Normal text<script>malicious()</script>more text')).toBe('Normal textmore text');
  });

  it('should remove event handlers', () => {
    expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('');
    expect(sanitizeInput('Click <a onclick="steal()">here</a>')).toBe('Click here');
  });

  it('should remove javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('');
    expect(sanitizeInput('Click <a href="javascript:void(0)">here</a>')).toBe('Click here');
  });

  it('should remove data: protocol', () => {
    expect(sanitizeInput('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('should preserve safe text', () => {
    expect(sanitizeInput('This is a normal comment')).toBe('This is a normal comment');
    expect(sanitizeInput('Great service today! 123')).toBe('Great service today! 123');
    expect(sanitizeInput('Count was higher than expected.')).toBe('Count was higher than expected.');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  Hello  ')).toBe('Hello');
    expect(sanitizeInput('\n\tTest\n\t')).toBe('Test');
  });

  it('should handle empty input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput('   ')).toBe('');
  });

  it('should handle mixed safe and unsafe content', () => {
    expect(sanitizeInput('Good service <script>bad()</script> today!')).toBe('Good service  today!');
    expect(sanitizeInput('Click <a href="">here</a> for more')).toBe('Click here for more');
  });
});

describe('isValidTextInput', () => {
  it('should return true for safe text', () => {
    expect(isValidTextInput('This is a normal comment')).toBe(true);
    expect(isValidTextInput('Great service today!')).toBe(true);
    expect(isValidTextInput('Count: 100')).toBe(true);
  });

  it('should return false for script tags', () => {
    expect(isValidTextInput('<script>alert(1)</script>')).toBe(false);
    expect(isValidTextInput('Normal <SCRIPT>bad()</SCRIPT> text')).toBe(false);
  });

  it('should return false for event handlers', () => {
    expect(isValidTextInput('<img onerror="alert(1)">')).toBe(false);
    expect(isValidTextInput('onclick="steal()"')).toBe(false);
    expect(isValidTextInput('onload="malicious()"')).toBe(false);
  });

  it('should return false for javascript: protocol', () => {
    expect(isValidTextInput('javascript:alert(1)')).toBe(false);
    expect(isValidTextInput('JAVASCRIPT:void(0)')).toBe(false);
  });

  it('should return false for data: protocol', () => {
    expect(isValidTextInput('data:text/html,<script>bad()</script>')).toBe(false);
    expect(isValidTextInput('DATA:application/json')).toBe(false);
  });

  it('should return true for empty input', () => {
    expect(isValidTextInput('')).toBe(true);
    expect(isValidTextInput('   ')).toBe(true);
  });
});
