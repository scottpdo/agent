// @flow

import Agent from './Agent';
import Graph from '../components/structures/Graph';

export default (graph: Graph, meanDegree: number, prob: number) => {

  if (meanDegree % 2 !== 0) throw new Error("Please use an even meanDegree");

  /**
   * Loop over nodes in the graph and add edges between nodes and neighbors
   * within a radius determined by the mean degree.
   */
  graph.forEach((node, i) => {
    for (let j = i - meanDegree / 2; j <= i + meanDegree / 2; j++) {
      const neighbor = graph.get(j);
      graph.addEdge(node, neighbor);
    }
  });

  /**
   * Loop again, and for each of the node's neighbors,
   * rewire based on the given rewiring probability. (see inside for more)
   */
  graph.forEach((node, i) => {
    graph.neighbors(node).forEach(neighbor => {

      // So, if prob = 0, we'll never rewire. If 1, always.
      if (Math.random() > prob) return;
      
      // r = a function that will return a random index within the graph size
      const r = () => Math.floor(Math.random() * graph.size());
      
      let isSelf: boolean;
      let isNeighbor: boolean;
      let potential: Agent;

      do {
        // get a random node
        potential = graph.get(r());

        // see if this potential node is the given node itself
        // or is one of the given node's neighbors
        isSelf = potential === node;
        isNeighbor = graph.neighbors(node).indexOf(potential) > -1;

      // repeat this process until we get a random node that is not
      // the node itself or one of its neighbors
      } while (isSelf || isNeighbor);

      // once we have that, remove the edge between the given node and given neighbor...
      graph.removeEdge(node, neighbor);

      // and add an edge between the given node and the randomly selected one
      graph.addEdge(node, potential);
    });
  });
};