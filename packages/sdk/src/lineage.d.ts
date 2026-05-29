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
export declare class LineageGraph {
    private nodes;
    private edges;
    constructor();
    /**
     * Adds a new node to the provenance graph.
     */
    addNode(id: string, type: LineageNode["type"], origin: LineageNode["origin"], label: string): void;
    /**
     * Connects two nodes to show dependency.
     */
    addEdge(from: string, to: string): void;
    /**
     * Traces the lineage of a node back to its roots.
     * Returns true if any root or intermediate node is UNTRUSTED.
     */
    isPoisoned(nodeId: string): boolean;
    getGraph(): {
        nodes: LineageNode[];
        edges: LineageEdge[];
    };
}
//# sourceMappingURL=lineage.d.ts.map