/**
 * Lineage Graph for ELENX
 * Implements a Directed Acyclic Graph (DAG) to trace data provenance across tool chains.
 */

export interface LineageNode {
    id: string;
    type: "INTENT" | "DATA" | "TOOL_CALL";
    origin: "TRUSTED" | "UNTRUSTED";
    label: string;
    timestamp: Date;
}

export interface LineageEdge {
    from: string;
    to: string;
}

export class LineageGraph {
    private nodes: Map<string, LineageNode> = new Map();
    private edges: LineageEdge[] = [];

    constructor() {}

    /**
     * Adds a new node to the provenance graph.
     */
    public addNode(id: string, type: LineageNode["type"], origin: LineageNode["origin"], label: string) {
        this.nodes.set(id, { id, type, origin, label, timestamp: new Date() });
    }

    /**
     * Connects two nodes to show dependency.
     */
    public addEdge(from: string, to: string) {
        this.edges.push({ from, to });
    }

    /**
     * Traces the lineage of a node back to its roots.
     * Returns true if any root or intermediate node is UNTRUSTED.
     */
    public isPoisoned(nodeId: string): boolean {
        const visited = new Set<string>();
        const queue = [nodeId];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (visited.has(current)) continue;
            visited.add(current);

            const node = this.nodes.get(current);
            if (node && node.origin === "UNTRUSTED") return true;

            // Find parents
            const parents = this.edges.filter(e => e.to === current).map(e => e.from);
            queue.push(...parents);
        }

        return false;
    }

    public getGraph() {
        return {
            nodes: Array.from(this.nodes.values()),
            edges: this.edges
        };
    }
}
