import React from 'react';

const TextView = ({ text }) => {
    console.log("The text:", text)
  return (
    <div>
      <pre>{text}</pre>
    </div>
  );
};

export default TextView;