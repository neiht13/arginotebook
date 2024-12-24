// components/CustomSelect.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import classNames from 'classnames';

interface Option {
  value: string;
  label: string;
  prefix?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isSuffix?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = '', className, isSuffix }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(option =>
    option.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={classNames('relative', className)} ref={selectRef}>
      <button
        type="button"
        className={classNames(
          "flex h-12 justify-between items-center w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none",
          isSuffix ? "rounded-r-2xl border-l-none" : "rounded-2xl",
          isOpen ? "border border-1 border-[tomato]": ""
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={classNames('text-gray-700', { 'text-gray-400': !selectedOption })}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto transition ease-in-out duration-200">
          <div className="px-4 py-2 border-b border-gray-300">
            <div className="flex items-center">
              <input
                type="text"
                placeholder={"🔍"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-1 border border-gray-100 rounded-md focus:outline-none focus:border-[tomato]"
              />
            </div>
          </div>
          <ul>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <li
                  key={option.value}
                  className={classNames(
                    'flex items-center justify-between px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100',
                    { 'bg-gray-100': option.value === value }
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >


                  <span>{option.prefix} {"   "} {option.label}</span>
                  {option.value === value && <Check className="w-4 h-4 text-tomato" />}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500 text-3xl text-center">∅</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;