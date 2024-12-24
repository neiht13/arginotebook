// components/Tabs.tsx
import React, { useState } from 'react';
import Tab from './Tab';

interface TabsProps {
  children: React.ReactElement[];
}

const Tabs: React.FC<TabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(children[0].props.label);

  const handleTabClick = (label: string) => {
    setActiveTab(label);
  };

  return (
    <div>
      <div className="flex mb-5">
        {children.map((child) => (
          <Tab
            key={child.props.label}
            label={child.props.label}
            active={child.props.label === activeTab}
            onClick={() => handleTabClick(child.props.label)}
          />
        ))}
      </div>
      {children.map((child) => {
        if (child.props.label !== activeTab) return undefined;
        return child.props.children;
      })}
    </div>
  );
};

export default Tabs;