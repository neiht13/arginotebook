// components/Tab.tsx
import React from 'react';
import classNames from 'classnames';

interface TabProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const Tab: React.FC<TabProps> = ({ label, active, onClick }) => {
  return (
    <div
      className={classNames(
        "flex-1 text-center py-2 cursor-pointer font-semibold border-b-2 transition-colors duration-300",
        {
          "border-[tomato] text-[tomato] text-base": active,
          "border-b-gray-300 hover:text-gray-700 text-gray-500 text-sm": !active,
        }
      )}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default Tab;