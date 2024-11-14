// ProgressIndicator.js
import React from "react";

const ProgressIndicator = ({ step }) => {
  return (
    <div className="flex justify-between mb-8">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div
          key={stepNumber}
          className={`flex flex-col items-center w-1/4 ${
            step >= stepNumber ? "text-blue-600" : "text-gray-400"
          }`}
        >
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${
              step >= stepNumber
                ? "bg-blue-100 border-2 border-blue-600"
                : "bg-gray-100 border-2 border-gray-400"
            }`}
          >
            {stepNumber}
          </div>
          <div className="text-xs text-center">
            {stepNumber === 1 && "Permintaan"}
            {stepNumber === 2 && "Evaluasi"}
            {stepNumber === 3 && "Input"}
            {stepNumber === 4 && "Konfirmasi"}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressIndicator;
