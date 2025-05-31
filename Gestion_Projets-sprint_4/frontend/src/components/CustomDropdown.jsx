import React, { useState } from "react";

const CustomDropdown = ({ options, selectedValue, onSelect, placeholder, disabled, required }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container">
      <div
        className={`dropdown-button ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="button"
        tabIndex={0} // Make the div focusable
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            !disabled && setIsOpen(!isOpen);
          }
        }}
      >
        {selectedValue || placeholder}
        <span className="dropdown-arrow">&#9660;</span>
      </div>
      {isOpen && (
        <div className="dropdown-list">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-item ${selectedValue === option.value ? "selected" : ""}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
              {selectedValue === option.value && <span className="selected-indicator"></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;