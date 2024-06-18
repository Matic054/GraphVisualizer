import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GraphVisualizer = ({ vertices, edges }) => {
  const svgRef = useRef();

  useEffect(() => {
    console.log('Vertices:', vertices); // Logging vertices for debugging
    console.log('Edges:', edges); // Logging edges for debugging
    if (vertices.length > 0 && edges.length > 0) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;

      const simulation = d3.forceSimulation(vertices)
        .force('link', d3.forceLink(edges).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(width / 2, height / 2));

      const link = svg.append('g')
        .selectAll('line')
        .data(edges)
        .enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(d.weight));

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

      simulation.on('tick', () => {
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
      });

      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  }, [vertices, edges]);

  return <svg ref={svgRef} width="800" height="600"></svg>;
};

export default GraphVisualizer;
