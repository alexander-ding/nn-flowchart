export function isCyclic(models) {
  /* Checks if the models constitute directed acyclic graphs
   * (Potentially multiple acyclic graphs)
   * Returns false only if there is an internal loop
   */
  let visited = {}; // whether the node is visited
  let inRecursionStack = {}; // whether the node is in the currentfunction call stack

  for (const key of Object.keys(models)) {
    visited[key] = false;
    inRecursionStack[key] = false;
  }

  for (const key of Object.keys(models)) {
    if (isCyclicHelper(models, key, visited, inRecursionStack)) {
      return true;
    }
  }
  return false;
}

function isCyclicHelper(models, index, visited, inRecursionStack) {
  /* A helper function to explore from a single node. Returns
   * false if there is no discrepancy found from this index 
   */

  // if visited, remove out of stack and say no
  if (visited[index]) {
    inRecursionStack[index] = false;
    return false;
  }

  visited[index] = true;
  inRecursionStack[index] = true;
  // if no neighbor, then no discrepancy
  if (models[index].connectedTo === null) {
    inRecursionStack[index] = false; 
    return false;
  }

  const next = models[index].connectedTo;
  if (!visited[next] && isCyclicHelper(models, next, visited, inRecursionStack)) {
    return true;
  }
  // if we bump into a node on our incoming path, it's bad
  if (inRecursionStack[next]) {
    return true;
  }

  inRecursionStack[index] = false;
  return false;
}

export function isLinear(models) {
  /* checks if the model current makes sense:
   * all nodes cannot have > 1 incoming edge
   * input node cannot have incoming edge
   * output node cannot have outgoing edge
   */ 
  let numIncomingEdges = {};
  for (const key of Object.keys(models)) {
    numIncomingEdges[key] = 0;
  }

  for (const key of Object.keys(models)) {
    const next = models[key].connectedTo;
    if (next !== null) {
      numIncomingEdges[next] += 1;
    }
  }

  // the input node must not have incoming edges
  if (numIncomingEdges[0] !== 0) {
    return {ok: false, err: "Input node cannot have incoming edge"};
  }
  // the output node must not have outgoing edges
  if (models[1].connectedTo !== null) {
    return {ok: false, err: "Output node cannot have outgoing edge"}; 
  }
  for (const key of Object.keys(models)) {
    if (numIncomingEdges[key] > 1) {
      return {"ok": false, err:"No node can have more than one incoming edge"};
    }
  }
  return {"ok": true, err:""};
}

export function prev(models, id) {
  /* Returns id of the node linking to the model pointed 
   * to by the id, if any; if none, return null 
   */
  for (const key of Object.keys(models)) {
    if (models[key].connectedTo === id) {
      return key;
    }
  }
  return null;
}

export function isTrainable(models) {
  /* Is the current architecture trainable? */
  const resp = isLinear(models);
  // if not linear, then fail
  if (!resp["ok"]) {
    return resp;
  }
  if (isCyclic(models)) {
    return {ok: false, err: "Model cannot be cyclic"};
  }

  // output node must not be empty, 
  // have ndim = 2, and agree with batch size
  if (models[1].shapeIn === null || models[1].shapeOut.length !== 2 || models[1].shapeOut[0] !== models[0].parameters["batchSize"]) {
    return {ok: false, err: "Output node must have shape (batchSize, categories)"};
  }

  let currentNode = models[0]; // input node
  while (currentNode.ID !== 1) { // need to reach output node
    if (currentNode.connectedTo === null) {
      return {ok: false, err: "Model does not cannot from input node to output node"};
    }
    currentNode = models[currentNode.connectedTo];
  }
  return {ok: true, err: ""};
}