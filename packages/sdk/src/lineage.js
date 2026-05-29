/**
 * Lineage Graph for ELENX
 * Implements a Directed Acyclic Graph (DAG) to trace data provenance across tool chains.
 */
export class LineageGraph {
    nodes = new Map();
    edges = [];
    constructor() { }
    /**
     * Adds a new node to the provenance graph.
     */
    addNode(id, type, origin, label) {
        this.nodes.set(id, { id, type, origin, label, timestamp: new Date() });
    }
    /**
     * Connects two nodes to show dependency.
     */
    addEdge(from, to) {
        this.edges.push({ from, to });
    }
    /**
     * Traces the lineage of a node back to its roots.
     * Returns true if any root or intermediate node is UNTRUSTED.
     */
    isPoisoned(nodeId) {
        const visited = new Set();
        const queue = [nodeId];
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current))
                continue;
            visited.add(current);
            const node = this.nodes.get(current);
            if (node && node.origin === "UNTRUSTED")
                return true;
            // Find parents
            const parents = this.edges.filter(e => e.to === current).map(e => e.from);
            queue.push(...parents);
        }
        return false;
    }
    getGraph() {
        return {
            nodes: Array.from(this.nodes.values()),
            edges: this.edges
        };
    }
}
//# sourceMappingURL=lineage.js.map