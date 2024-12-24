// components/Button.tsx
'use client';

import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={classNames(
        "relative border-none bg-transparent p-0 cursor-pointer outline-none transition filter duration-250 user-select-none touch-manipulation group",
        className
      )}
      {...props}
    >
      <span className="absolute top-0 left-0 w-full h-full rounded-2xl bg-black bg-opacity-20 transform translate-y-0 transition-transform duration-600 ease-custom group-hover:translate-y-1 group-active:translate-y-1"></span>

      <span className="absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-l from-red-700 via-red-500 to-red-700"></span>

      <span className="block relative px-7 py-3 rounded-2xl text-lg text-white bg-[tomato] transform -translate-y-1 transition-transform duration-600 ease-custom group-hover:-translate-y-2 group-active:-translate-y-0">
        {children}
      </span>
    </button>
  );
};

export default Button;