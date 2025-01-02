// components/FormulaText.tsx
import React from 'react';

interface FormulaTextProps {
  children: React.ReactNode;
}

const FormulaText: React.FC<FormulaTextProps> = ({ children }) => {
  return (
    <div className="text-sm text-slate-800 mb-5 p-3 bg-slate-100 rounded-md ">
      {children}
    </div>
  );
};

export default FormulaText;