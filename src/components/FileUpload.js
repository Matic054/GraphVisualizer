import React from 'react';

const FileUpload = ({ onGraphParsed, onSentenceGraphParsed }) => {

  const handleFileRead = (event) => {
    const content = event.target.result;

    if (content.startsWith('V={')) {
      const { vertices, edges } = parseGraphData(content);
      onGraphParsed(vertices, edges, {}, content, false);
    } else {
      const { vertices, edges, sentenceMapping } = parseSentenceGraph(content);
      onGraphParsed(vertices, edges, sentenceMapping, content, true);
    }
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

  const parseSentenceGraph = (content) => {
    const sentences = content.split(/(?<=[.?!])\s+/);
    const vertices = sentences.map((sentence, index) => ({ id: `v${index}` }));
    const sentenceMapping = vertices.reduce((map, vertex, index) => {
      map[vertex.id] = sentences[index];
      return map;
    }, {});

    const edges = [];
    const wordPattern = /\b\w{4,}\b/g;

    for (let i = 0; i < sentences.length; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        const words1 = new Set(sentences[i].match(wordPattern));
        const words2 = new Set(sentences[j].match(wordPattern));
        const commonWords = [...words1].filter(word => words2.has(word)).length;
        if (commonWords > 0) {
          edges.push({ source: `v${i}`, target: `v${j}`, weight: commonWords, directed: false });
          edges.push({ source: `v${j}`, target: `v${i}`, weight: commonWords, directed: false });
        }
      }
    }

    return { vertices, edges, sentenceMapping };
  };

  return (
    <div>
      <input type="file" accept=".txt" onChange={e => handleFileChosen(e.target.files[0])} />
    </div>
  );
};
export default FileUpload;



