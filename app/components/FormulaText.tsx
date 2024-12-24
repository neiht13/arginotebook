// components/FormulaText.tsx
import React from 'react';

interface FormulaTextProps {
  children: React.ReactNode;
}

const FormulaText: React.FC<FormulaTextProps> = ({ children }) => {
  return (
    <div className="text-sm text-gray-800 mb-5 p-3 bg-gray-100 rounded-md ">
      {children}
    </div>
  );
};

export default FormulaText;