import React, { useState } from 'react';
import { IconChevronUpDown } from './icons'; // Import your dropdown icon

// Define the props interface
interface DropdownProps {
  actions: { label: string; onClick: () => void }[];
}

const Dropdown: React.FC<DropdownProps> = ({ actions }) => {


  return (
    <div className="relative">      
        <div className="shadow-lg rounded-md mt-1">
          <div className="p-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="block w-full text-left text-sm text-type-600 hover:bg-gray-100 p-2"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      
    </div>
  );
};

export default Dropdown;
