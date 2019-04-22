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
    return false;
  }
  // the output node must not have outgoing edges
  if (models[1].connectedTo !== null) {
    return false; 
  }
  for (const key of Object.keys(models)) {
    if (numIncomingEdges[key] > 1) {
      return false;
    }
  }
  return true;
}