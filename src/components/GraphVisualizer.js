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
  const [linkDistance, setLinkDistance] = useState(150);
  const [chargeStrength, setChargeStrength] = useState(-500);

  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [algorithmParams, setAlgorithmParams] = useState({});

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
      .force('link', d3.forceLink(edges).id(d => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
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
  }, [vertices, edges, linkDistance, chargeStrength]);

  const addNode = () => {
    const newNodeId = `v${vertices.length + 1}`;
    const newVertices = [...vertices, { id: newNodeId }];
    setVertices(newVertices);
  };

  const handleAddEdge = () => {
    const newEdge = { source: sourceNode, target: targetNode, weight: edgeWeight, directed: true };

    const oppositeEdgeIndex = edges.findIndex(edge => 
      edge.source.id === targetNode && edge.target.id === sourceNode && edge.weight === edgeWeight
    );

    if (oppositeEdgeIndex !== -1) {
      const updatedEdges = edges.map((edge, index) => {
        if (index === oppositeEdgeIndex || (edge.source.id === sourceNode && edge.target.id === targetNode && edge.weight === edgeWeight)) {
          return { ...edge, directed: false };
        }
        return edge;
      });
      setEdges(updatedEdges);
    } else {
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

  const handleAlgorithmChange = (e) => {
    setSelectedAlgorithm(e.target.value);
    setAlgorithmParams({});
  };

  const handleAlgorithmParamsChange = (e) => {
    const { name, value } = e.target;
    setAlgorithmParams(prevParams => ({ ...prevParams, [name]: value }));
  };

  const visualizeAlgorithm = () => {
    if (selectedAlgorithm === 'DFS') {
      visualizeDFS(algorithmParams.startNode);
    } else if (selectedAlgorithm === 'BFS') {
      visualizeBFS(algorithmParams.startNode);
    }
  };

  const visualizeDFS = (startNode) => {
    const visited = new Set();
    const dfsTraversal = [];
    const dfsEdges = [];
  
    const dfs = (node) => {
      visited.add(node);
      dfsTraversal.push(node);
      const neighbors = edges
        .filter(edge => edge.source.id === node)
        .map(edge => ({ target: edge.target.id, sourceEdge: edge }));
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.target)) {
          dfsEdges.push(neighbor.sourceEdge);
          dfs(neighbor.target);
        }
      }
    };
  
    dfs(startNode);
  
    dfsTraversal.forEach((node, index) => {
      setTimeout(() => {
        d3.selectAll('circle').filter(d => d.id === node).attr('fill', 'red');
      }, index * 1000);
    });
  
    dfsEdges.forEach((edge, index) => {
      setTimeout(() => {
        d3.selectAll('line')
          .filter(d => (d.source.id === edge.source.id && d.target.id === edge.target.id))
          .attr('stroke', 'red');
      }, index * 1000 + 300); // Offset to ensure edges are colored after nodes
    });
  
    setTimeout(() => {
      d3.selectAll('circle').attr('fill', '#69b3a2');
      d3.selectAll('line').attr('stroke', '#999');
    }, dfsTraversal.length * 1000 + 1000);
  };  

  const visualizeBFS = (startNode) => {
    const visited = new Set();
    const queue = [startNode];
    const bfsTraversal = [];
    const bfsEdges = [];
  
    while (queue.length > 0) {
      const node = queue.shift();
      if (!visited.has(node)) {
        visited.add(node);
        bfsTraversal.push(node);
        const neighbors = edges
          .filter(edge => (edge.source.id === node && !visited.has(edge.target.id)))
          .map(edge => ({ target: edge.target.id, sourceEdge: edge }));
        for (const neighbor of neighbors) {
          if (!queue.some(n => n === neighbor.target)) bfsEdges.push(neighbor.sourceEdge);
          queue.push(neighbor.target);
        }
      }
    }

    console.log("Visited", visited);
    console.log("Vertices", bfsTraversal);
    console.log("Edges", bfsEdges);
  
    bfsTraversal.forEach((node, index) => {
      setTimeout(() => {
        d3.selectAll('circle').filter(d => d.id === node).attr('fill', 'red');
      }, index * 1000);
    });
  
    bfsEdges.forEach((edge, index) => {
      setTimeout(() => {
        d3.selectAll('line')
          .filter(d => (d.source.id === edge.source.id && d.target.id === edge.target.id))
          .attr('stroke', 'red');
      }, index * 1000); // Offset to ensure edges are colored after nodes
    });
  
    setTimeout(() => {
      d3.selectAll('circle').attr('fill', '#69b3a2');
      d3.selectAll('line').attr('stroke', '#999');
    }, bfsTraversal.length * 1000 + 1000);
  };  

  return (
    <div>
      <svg ref={svgRef} width="800" height="600" style={{ border: '1px solid black' }}></svg>
      <div>
        <button onClick={addNode}>Add Node</button>
      </div>
      <div>
        <label>
          Source Node:
          <select value={sourceNode} onChange={e => setSourceNode(e.target.value)}>
            <option value="">Select Source</option>
            {vertices.map(vertex => (
              <option key={vertex.id} value={vertex.id}>
                {vertex.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          Target Node:
          <select value={targetNode} onChange={e => setTargetNode(e.target.value)} disabled={!sourceNode}>
            <option value="">Select Target</option>
            {vertices
              .filter(vertex => vertex.id !== sourceNode)
              .map(vertex => (
                <option key={vertex.id} value={vertex.id}>
                  {vertex.id}
                </option>
              ))}
          </select>
        </label>
        <label>
          Edge Weight:
          <input
            type="number"
            value={edgeWeight}
            onChange={e => setEdgeWeight(parseFloat(e.target.value))}
            min="1"
          />
        </label>
        <button onClick={handleAddEdge}>Add Edge</button>
      </div>
      <div>
        <label>
          Node to Delete:
          <select value={selectedNodeToDelete} onChange={e => setSelectedNodeToDelete(e.target.value)}>
            <option value="">Select Node</option>
            {vertices.map(vertex => (
              <option key={vertex.id} value={vertex.id}>
                {vertex.id}
              </option>
            ))}
          </select>
        </label>
        <button onClick={deleteNode}>Delete Node</button>
      </div>
      <div>
        <label>
          Edge to Delete:
          <select value={selectedEdgeToDelete} onChange={e => setSelectedEdgeToDelete(e.target.value)}>
            <option value="">Select Edge</option>
            {edges.map(edge => (
              <option key={`${edge.source.id}-${edge.target.id}`} value={`${edge.source.id}-${edge.target.id}`}>
                {edge.source.id} -> {edge.target.id}
              </option>
            ))}
          </select>
        </label>
        <button onClick={deleteEdge}>Delete Edge</button>
      </div>
      <div>
        <label>
          Link Distance: {linkDistance}
          <input
            type="range"
            min="50"
            max="300"
            value={linkDistance}
            onChange={e => setLinkDistance(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          Charge Strength: {chargeStrength}
          <input
            type="range"
            min="-1000"
            max="0"
            value={chargeStrength}
            onChange={e => setChargeStrength(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          Select Algorithm:
          <select value={selectedAlgorithm} onChange={handleAlgorithmChange}>
            <option value="">Select Algorithm</option>
            <option value="DFS">DFS</option>
            <option value="BFS">BFS</option>
          </select>
        </label>
        {selectedAlgorithm && (
          <div>
            <label>
              Start Node:
              <select
                name="startNode"
                value={algorithmParams.startNode || ''}
                onChange={handleAlgorithmParamsChange}
              >
                <option value="">Select Start Node</option>
                {vertices.map(vertex => (
                  <option key={vertex.id} value={vertex.id}>
                    {vertex.id}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={visualizeAlgorithm}>Visualize {selectedAlgorithm}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphVisualizer;







