import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import GraphVisualizer from './components/GraphVisualizer';

const App = () => {
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);

  const handleFileParsed = (parsedVertices, parsedEdges) => {
    console.log('Hello');
    setVertices(parsedVertices);
    setEdges(parsedEdges);
  };

  return (
    <div>
      <h1>Graph Visualizer</h1>
      <FileUpload onFileParsed={handleFileParsed} />
      <GraphVisualizer vertices={vertices} edges={edges} />
    </div>
  );
};

export default App;

