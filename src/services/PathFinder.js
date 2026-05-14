/**
 * pathfinder.js
 * BFS (Breadth-First Search) pathfinding algorithm.
 * Finds the shortest path between two nodes in the Firestore graph.
 *
 * Each node in Firestore has:
 *   - nodeID: string (e.g. "gd1_GroundFloor_Lobby_Lobby1")
 *   - posX, posY, posZ: number (spatial coordinates, interval of 25)
 *   - neighbors: string[] (array of neighboring node IDs)
 *   - rooms: [{ roomName: string }] (optional room names for lookup)
 */

const reconstructPath = (cameFrom, startID, endID, allNodes) => {
  let path = [];
  let currentID = endID;
  while (currentID !== startID) {
    path.push(allNodes[currentID]);
    currentID = cameFrom[currentID];
  }
  path.push(allNodes[startID]);
  return path.reverse();
};

export const findPath = (startNodeID, targetNodeID, allNodes) => {
  // Standardize inputs immediately
  const start = startNodeID.trim();
  const target = targetNodeID.trim();

  if (!allNodes[start] || !allNodes[target]) {
    console.error(`MISSING IN DATABASE: Start(${start}) or Target(${target})`);
    return null;
  }

  let queue = [start];
  let visited = new Set([start]);
  let cameFrom = {};

  while (queue.length > 0) {
    let currentNodeID = queue.shift();

    if (currentNodeID === target) {
      return reconstructPath(cameFrom, start, target, allNodes);
    }

    const currentNode = allNodes[currentNodeID];
    if (!currentNode || !currentNode.neighbors) continue;

    for (let rawNeighborID of currentNode.neighbors) {
      // THE TRIMMING FIX: Remove any accidental spaces from DB entries
      const neighborID = rawNeighborID.trim();

      let finalNeighborID = null;

      // Direct check first
      if (allNodes[neighborID]) {
        finalNeighborID = neighborID;
      } else {
        // Deep cleaning check — handles "main_campus_parent_" prefix mismatches
        const cleanID = neighborID.replace("main_campus_parent_", "").trim();
        finalNeighborID = Object.keys(allNodes).find(
          key => key === cleanID || key.endsWith(cleanID)
        );
      }

      if (finalNeighborID && !visited.has(finalNeighborID)) {
        visited.add(finalNeighborID);
        cameFrom[finalNeighborID] = currentNodeID;
        queue.push(finalNeighborID);
      }
    }
  }

  // THE DEBUG LOG: This tells us how far the search actually got
  console.log(
    `BFS finished searching. Visited ${visited.size} nodes. Path to ${target} not found.`
  );
  return null;
};