// @flow

import _ from 'lodash';
import Agent from '../agents/Agent';

/**
 * Graph data structure.
 * Stores nodes + edges in adjacency lists (i.e. good for sparse graphs).
 */
export default class Graph {

  /**
   * lookup table with keys = keys of nodes in the graph,
   * values = list (JS array) of neighboring nodes
   */
  data: Object = {};

  /**
   * list (JS array) of all the nodes
   * in the order they were added to the graph
   */
  nodes: Array<Agent> = [];

  /**
   * Add a node to the graph.
   * @param {*} node 
   */
  addNode(node: Agent) {
    
    if (node.graph !== null && node.graph !== this) {
      throw new Error("Can't add node to multiple graphs.");
    }

    node.graph = this;

    if (!this.data[node.key]) {
      this.data[node.key] = [];
      this.nodes.push(node);
    }
  }

  /**
   * Returns true if successfully added edge, false otherwise
   * (for example, if tried to add an edge between a node + itself
   * or if the edge already exists).
   * @param {*} node1 
   * @param {*} node2 
   */
  addEdge(node1: Agent, node2: Agent): boolean {

    if (node1 === node2) return false;

    const key1 = node1.key;
    const key2 = node2.key;
    
    if (!this.hasEdge(node1, node2)) {
      this.data[key1].push(node2);
      this.data[key2].push(node1);
      return true;
    }

    return false;
  }

  /**
   * Does an edge exist between the two given nodes?
   * @param {*} node1 
   * @param {*} node2 
   */
  hasEdge(node1: Agent, node2: Agent): boolean {
    const key1 = node1.key;
    const key2 = node2.key;
    return this.data[key1].indexOf(node2) >= 0 && this.data[key2].indexOf(node1) >= 0;
  }

  /**
   * Like with addEdge, returns true if the edge was successfully
   * removed, false if otherwise (if edge did not exist in the first place).
   * @param {*} node1 
   * @param {*} node2 
   */
  removeEdge(node1: Agent, node2: Agent): boolean {
    
    if (node1 === node2) return false;

    const key1 = node1.key;
    const key2 = node2.key;
    
    if (this.hasEdge(node1, node2)) {
      this.data[key1].splice(this.data[key1].indexOf(node2), 1);
      this.data[key2].splice(this.data[key2].indexOf(node1), 1);
      return true;
    }

    return false;
  }

  /**
   * Number of nodes in the graph.
   */
  size(): number {
    return this.nodes.length;
  }

  /**
   * Given a callback function, loop over all the nodes in the graph
   * and invoke the callback, passing the node + index as parameters.
   * @param {*} cb 
   */
  forEach(cb: Function) {
    this.nodes.forEach(cb);
  }

  /**
   * Same as forEach, but in random order. 
   * Node that only the node (not index) is passed to the callback.
   * @param {*} cb 
   */
  forEachRand(cb: Function) {

    let arr = [];
    for (let i = 0; i < this.size(); i++) arr.push(i);
    arr = _.shuffle(arr);

    for (let i = 0; i < arr.length; i++) {
      const idx = arr[i];
      cb(this.nodes[idx]);
    }
  }

  /**
   * Get the node at index i.
   * @param {*} i 
   */
  get(i: number): Agent {
    while (i < 0) i += this.size();
    while (i >= this.size()) i -= this.size();
    return this.nodes[i];
  }

  /**
   * Get the index of a given node.
   * @param {*} agent 
   */
  indexOf(agent: Agent): number {
    return this.nodes.indexOf(agent);
  }

  /**
   * Return the nodes that are neighbors of a given node
   * (in a JS array).
   * @param {*} node 
   */
  neighbors(node: Agent): Array<Agent> {
    return this.data[node.key];
  }
};