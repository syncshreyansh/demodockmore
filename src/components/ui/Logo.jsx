import React from 'react';
import { Link } from 'react-router-dom';
import logoBlack from '../../assets/logo/logo-black.png';

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
        className="w-[200px] h-auto object-contain block"
      />
    </Link>
  );
}

