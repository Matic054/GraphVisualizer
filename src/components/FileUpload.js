// src/components/FileUpload.js

import React, { useState } from 'react';

const FileUpload = ({ onFileParsed }) => {
  const [fileContent, setFileContent] = useState('');

  const handleFileRead = (event) => {
    const content = event.target.result;
    setFileContent(content);
    const { vertices, edges } = parseGraphData(content);
    console.log('Parsed vertices:', vertices); // Logging parsed vertices
    console.log('Parsed edges:', edges);
    onFileParsed(vertices, edges);
  };

  const handleFileChosen = (file) => {
    console.log('File chosen:', file);
    const fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  const parseGraphData = (data) => {
    console.log('Parsing graph data'); // Logging parsing start
    const vertexPattern = /V=\{([^}]+)\}/;
    const edgePattern = /E=\{([^}]+)\}/;
  
    const verticesMatch = data.match(vertexPattern);
    const edgesMatch = data.match(edgePattern);
  
    const vertices = verticesMatch ? verticesMatch[1].split(',').map(v => ({ id: v.trim() })) : [];
    const edges = edgesMatch
      ? edgesMatch[1].split('),').map(edge => {
          const parts = edge.replace(/[()]/g, '').split(',');
          return { source: parts[0].trim(), target: parts[2].trim(), weight: parseFloat(parts[1]) };
        })
      : [];
  
    console.log('Parsed vertices in function:', vertices); // Logging parsed vertices inside function
    console.log('Parsed edges in function:', edges); // Logging parsed edges inside function
  
    return { vertices, edges };
  };
  
  return (
    <div>
      <input type="file" accept=".txt" onChange={e => handleFileChosen(e.target.files[0])} />
      <pre>{fileContent}</pre>
    </div>
  );
};

export default FileUpload;

