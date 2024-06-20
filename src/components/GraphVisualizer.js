import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GraphVisualizer = ({ initialVertices, initialEdges }) => {
  const [vertices, setVertices] = useState(initialVertices);
  const [edges, setEdges] = useState(initialEdges);
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [selectedNodeToDelete, setSelectedNodeToDelete] = useState('');
  const [selectedEdgeToDelete, setSelectedEdgeToDelete] = useState('');

  const svgRef = useRef();
  const simulationRef = useRef();

  useEffect(() => {
    setVertices(initialVertices);
    setEdges(initialEdges);
  }, [initialVertices, initialEdges]);

  useEffect(() => {
    if (!vertices.length) {
      return;
    }

    console.log("The edges:", edges);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', 'end')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    simulationRef.current = d3.forceSimulation(vertices)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1)
      .attr('marker-end', d => d.directed ? 'url(#end)' : null);

    const edgeLabels = svg.append('g')
      .selectAll('text')
      .data(edges)
      .enter().append('text')
      .attr('dy', -5)
      .attr('dx', 5)
      .attr('font-size', 12)
      .text(d => d.weight !== 1 ? d.weight : '');

    const node = svg.append('g')
      .selectAll('circle')
      .data(vertices)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    const text = svg.append('g')
      .selectAll('text')
      .data(vertices)
      .enter().append('text')
      .attr('dy', -15)
      .attr('dx', 15)
      .text(d => d.id);

    simulationRef.current.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      text
        .attr('x', d => d.x)
        .attr('y', d => d.y);

      edgeLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);
    });

    function dragstarted(event, d) {
      if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulationRef.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => simulationRef.current.stop();
  }, [vertices, edges]);

  const addNode = () => {
    const newNodeId = `v${vertices.length + 1}`;
    const newVertices = [...vertices, { id: newNodeId }];
    setVertices(newVertices);
  };

  const handleAddEdge = () => {
    // Create the new edge
    const newEdge = { source: sourceNode, target: targetNode, weight: edgeWeight, directed: true };
  
    // Check if the opposite edge exists
    const oppositeEdgeIndex = edges.findIndex(edge => 
      edge.source.id === targetNode && edge.target.id === sourceNode && edge.weight === edgeWeight
    );
  
    console.log('Opposite edge index:', oppositeEdgeIndex); // Log the index of the opposite edge if found
    console.log('Current edges:', edges); // Log the current edges
    console.log('New edge:', newEdge); // Log the new edge being added
  
    if (oppositeEdgeIndex !== -1) {
      // If the opposite edge exists, update both to be undirected
      const updatedEdges = edges.map((edge, index) => {
        if (index === oppositeEdgeIndex || (edge.source.id === sourceNode && edge.target.id === targetNode && edge.weight === edgeWeight)) {
          return { ...edge, directed: false };
        }
        return edge;
      });
      setEdges(updatedEdges);
    } else {
      // If the opposite edge does not exist, just add the new edge
      setEdges([...edges, newEdge]);
    }
  };  

  const deleteNode = () => {
    const newVertices = vertices.filter(vertex => vertex.id !== selectedNodeToDelete);
    const newEdges = edges.filter(edge => edge.source.id !== selectedNodeToDelete && edge.target.id !== selectedNodeToDelete);
    setVertices(newVertices);
    setEdges(newEdges);
  };

  const deleteEdge = () => {
    const [source, target] = selectedEdgeToDelete.split('-');
    const newEdges = edges.filter(edge => !(edge.source.id === source && edge.target.id === target));
    setEdges(newEdges);
  };

  return (
    <div>
      <svg ref={svgRef} width="800" height="600"></svg>
      <div>
        <button onClick={addNode}>Add Node</button>
      </div>
      <div>
        <label>
          Source Node:
          <select value={sourceNode} onChange={e => setSourceNode(e.target.value)}>
            <option value="">Select Source</option>
            {vertices.map(vertex => (
              <option key={vertex.id} value={vertex.id}>{vertex.id}</option>
            ))}
          </select>
        </label>
        <label>
          Target Node:
          <select value={targetNode} onChange={e => setTargetNode(e.target.value)} disabled={!sourceNode}>
            <option value="">Select Target</option>
            {vertices.filter(vertex => vertex.id !== sourceNode).map(vertex => (
              <option key={vertex.id} value={vertex.id}>{vertex.id}</option>
            ))}
          </select>
        </label>
        <label>
          Weight:
          <input type="number" value={edgeWeight} onChange={e => setEdgeWeight(parseFloat(e.target.value))} />
        </label>
        <button onClick={handleAddEdge} disabled={!sourceNode || !targetNode}>Add Edge</button>
      </div>
      <div>
        <label>
          Delete Node:
          <select value={selectedNodeToDelete} onChange={e => setSelectedNodeToDelete(e.target.value)}>
            <option value="">Select Node to Delete</option>
            {vertices.map(vertex => (
              <option key={vertex.id} value={vertex.id}>{vertex.id}</option>
            ))}
          </select>
        </label>
        <button onClick={deleteNode}>Delete Node</button>
      </div>
      <div>
        <label>
          Delete Edge:
          <select value={selectedEdgeToDelete} onChange={e => setSelectedEdgeToDelete(e.target.value)}>
            <option value="">Select Edge to Delete</option>
            {edges.map(edge => (
              <option key={`${edge.source.id}-${edge.target.id}`} value={`${edge.source.id}-${edge.target.id}`}>
                {`${edge.source.id} -> ${edge.target.id}`}
              </option>
            ))}
          </select>
        </label>
        <button onClick={deleteEdge}>Delete Edge</button>
      </div>
    </div>
  );
};

export default GraphVisualizer;





