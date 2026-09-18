import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * MagneticButton: Physics-based cursor-following button with radial sheen,
 * spring inertia, and micro-motion.
 */
export default function MagneticButton({ 
  children, 
  to, 
  href, 
  onClick, 
  variant = 'primary', // 'primary' | 'secondary' | 'glass' | 'sage'
  className = '',
  style = {},
  icon: Icon,
  badge
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [sheenPosition, setSheenPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    
    // Magnetic pull distance relative to button center (up to 12px translation)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.28;
    const distanceY = (e.clientY - centerY) * 0.28;

    setPosition({ x: distanceX, y: distanceY });

    // Local sheen spotlight coordinates inside the button
    const sheenX = ((e.clientX - rect.left) / rect.width) * 100;
    const sheenY = ((e.clientY - rect.top) / rect.height) * 100;
    setSheenPosition({ x: sheenX, y: sheenY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
          color: '#1e293b',
          border: isHovered ? '1px solid #94a3b8' : '1px solid #cbd5e1',
          boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)',
          sheenColor: 'rgba(0, 0, 0, 0.05)'
        };
      case 'glass':
        return {
          background: isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.75)',
          color: '#0f172a',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: isHovered ? '0 12px 28px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.03)',
          backdropFilter: 'blur(16px)',
          sheenColor: 'rgba(78, 135, 115, 0.08)'
        };
      case 'sage':
        return {
          background: isHovered ? '#047857' : '#059669',
          color: '#ffffff',
          border: '1px solid #059669',
          boxShadow: isHovered ? '0 12px 28px rgba(5, 150, 105, 0.3)' : '0 4px 14px rgba(5, 150, 105, 0.2)',
          sheenColor: 'rgba(255, 255, 255, 0.25)'
        };
      case 'primary':
      default:
        return {
          background: isHovered ? '#000000' : '#111827',
          color: '#ffffff',
          border: '1px solid #111827',
          boxShadow: isHovered ? '0 14px 32px rgba(17, 24, 39, 0.28)' : '0 4px 16px rgba(17, 24, 39, 0.12)',
          sheenColor: 'rgba(255, 255, 255, 0.22)'
        };
    }
  };

  const vStyles = getVariantStyles();

  const baseStyles = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '0.95rem 2.2rem',
    borderRadius: isHovered ? '12px' : '10px',
    fontSize: '0.98rem',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
    overflow: 'hidden',
    userSelect: 'none',
    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isPressed ? 0.96 : isHovered ? 1.03 : 1})`,
    transition: isHovered 
      ? 'transform 0.12s cubic-bezier(0.2, 0, 0, 1), background 0.25s, box-shadow 0.25s, border-radius 0.25s' 
      : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s, box-shadow 0.3s, border-radius 0.3s',
    ...vStyles,
    ...style
  };

  const content = (
    <>
      {/* Radial Cursor Spotlight Sheen */}
      {isHovered && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            background: `radial-gradient(circle 120px at ${sheenPosition.x}% ${sheenPosition.y}%, ${vStyles.sheenColor}, transparent 80%)`,
            transition: 'opacity 0.2s',
            opacity: 1
          }}
        />
      )}

      {badge && (
        <span style={{
          fontSize: '0.75rem',
          padding: '0.15rem 0.5rem',
          borderRadius: '9999px',
          background: 'rgba(255,255,255,0.2)',
          fontWeight: 800,
          letterSpacing: '0.02em'
        }}>
          {badge}
        </span>
      )}

      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>

      {Icon && (
        <span style={{
          position: 'relative',
          zIndex: 2,
          display: 'inline-flex',
          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <Icon size={18} />
        </span>
      )}
    </>
  );

  const sharedProps = {
    ref: buttonRef,
    style: baseStyles,
    className: `magnetic-btn ${className}`,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onClick
  };

  if (to) {
    return <Link to={to} {...sharedProps}>{content}</Link>;
  }

  if (href) {
    return <a href={href} {...sharedProps}>{content}</a>;
  }

  return <button {...sharedProps}>{content}</button>;
}
