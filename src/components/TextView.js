import React from 'react';

const TextView = ({ text }) => {
  return (
    <div className="text-container">
      <pre>{text}</pre>
    </div>
  );
};

export default TextView;