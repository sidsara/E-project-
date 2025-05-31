import React from 'react';
import './Stepper.css';

function Stepper({ steps, currentStep }) {
  return (
    <div className="stepper">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div
            key={index}
            className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
          >
            <div className="step-number">
              {isCompleted ? '' : index + 1}
            </div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              {step.description && <div className="step-description">{step.description}</div>}
            </div>
            {index !== steps.length - 1 && <div className="step-line" />}
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
