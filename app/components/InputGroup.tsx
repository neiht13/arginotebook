// components/InputGroup.tsx
import React from 'react';

interface InputGroupProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  className?: string;
  required?: boolean;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  required = false,
  suffix,
  prefix,
}) => {
  return (
    <div className="w-full">
      <label className="w-full block h-6 mb-1 font-bold text-slate-700">{label}</label>
      <div className='flex'>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
          className={className}
          required={required}
        />
        {suffix}
      </div>
    </div>
  );
};

export default InputGroup;
