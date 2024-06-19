import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GraphVisualizer = ({ initialVertices, initialEdges }) => {
  const [vertices, setVertices] = useState(initialVertices);
  const [edges, setEdges] = useState(initialEdges);

  const svgRef = useRef();
  const simulationRef = useRef();

  useEffect(() => {
    setVertices(initialVertices);
    setEdges(initialEdges);
  }, [initialVertices, initialEdges]);

  useEffect(() => {
    if (!vertices.length || !edges.length) {
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
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    simulationRef.current = d3.forceSimulation(vertices)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1) // Setting stroke width to a constant value
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

  return (
    <div>
      <svg ref={svgRef} width="800" height="600"></svg>
      <button onClick={addNode}>Add Node</button>
    </div>
  );
};

export default GraphVisualizer;




