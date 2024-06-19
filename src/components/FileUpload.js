import React, { useState } from 'react';

const FileUpload = ({ onFileParsed }) => {
  const [fileContent, setFileContent] = useState('');

  const handleFileRead = (event) => {
    const content = event.target.result;
    setFileContent(content);
    const { vertices, edges } = parseGraphData(content);
    onFileParsed(vertices, edges);
  };

  const handleFileChosen = (file) => {
    const fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  const parseGraphData = (data) => {
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
  
    // Combine edges to make them undirected if both directions exist
    const undirectedEdges = [];

    edges.forEach(edge => {
      const { source, target, weight } = edge;
      if (edges.some(e => e.source === target && e.target === source && e.weight === weight)){
        undirectedEdges.push({ source, target, weight, directed: false });
      } else {
        undirectedEdges.push({ source, target, weight, directed: true });
      }
      
    });
  
    return { vertices, edges: undirectedEdges };
  };
  
  
  return (
    <div>
      <input type="file" accept=".txt" onChange={e => handleFileChosen(e.target.files[0])} />
      <pre>{fileContent}</pre>
    </div>
  );
};

export default FileUpload;


