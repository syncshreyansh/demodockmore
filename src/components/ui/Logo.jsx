import React from 'react';
import { Link } from 'react-router-dom';
import logoBlack from '../../assets/logo/logo-black.png';

/**
 * Logo Component
 * Renders the official logo image (src/assets/logo/logo-black.png)
 * inside a react-router Link.
 */
export default function Logo({ className = '', to = '/' }) {
  return (
    <Link
      to={to}
      className={`inline-block select-none focus:outline-none ${className}`}
      aria-label="dockMore Home"
    >
      <img
        src={logoBlack}
        alt="dockMore."
        className="w-[132px] h-auto object-contain block"
      />
    </Link>
  );
}
