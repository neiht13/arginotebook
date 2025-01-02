// components/Button.tsx
'use client';

import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className, icon, ...props}) => {
  return (
    <button
      className={classNames(
        "relative border-none bg-transparent p-0 cursor-pointer outline-none transition filter duration-250 user-select-none touch-manipulation group",
        className
      )}
      {...props}
    >
      <span className="absolute top-0 left-0 w-full h-full rounded-2xl bg-black bg-opacity-20 transform translate-y-0 transition-transform duration-600 ease-custom group-hover:translate-y-1 group-active:translate-y-1"></span>

      <span className="absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-l from-lime-700 via-lime-500 to-lime-700"></span>

      <span className="flex items-center gap-2 justify-center relative p-2.5 rounded-2xl  text-white bg-lime-500 transform -translate-y-1 transition-transform duration-600 ease-custom group-hover:-translate-y-2 group-active:-translate-y-0">
        {icon}{children}
      </span>
    </button>
  );
};

export default Button;