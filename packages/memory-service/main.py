from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import uuid
import asyncio
import shutil
from fastapi.staticfiles import StaticFiles

import cognee

app = FastAPI(title="ELENX Memory Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory for graph UI
app.mount("/static", StaticFiles(directory="static"), name="static")

import json

# In-memory graph storage to bypass embedding errors during Live Demo
demo_nodes = []
demo_edges = []

def load_graph_state():
    global demo_nodes, demo_edges
    try:
        if os.path.exists("graph_state.json"):
            with open("graph_state.json", "r") as f:
                data = json.load(f)
                nodes_list = data.get("nodes", [])
                demo_nodes = [tuple(n) for n in nodes_list]
                
                edges_list = data.get("edges", [])
                demo_edges = [tuple(e) for e in edges_list]
                print("Loaded graph state from disk.")
    except Exception as e:
        print(f"Failed to load graph state: {e}")

def save_graph_state():
    try:
        with open("graph_state.json", "w") as f:
            json.dump({"nodes": demo_nodes, "edges": demo_edges}, f)
    except Exception as e:
        print(f"Failed to save graph state: {e}")

# Load state initially
load_graph_state()

# --- CUSTOM THREAT ONTOLOGY ---
class AdversarialDomain(BaseModel):
    domain: str

class MaliciousSelector(BaseModel):
    selector: str
    description: Optional[str] = None

class AgentActor(BaseModel):
    caller_id: str

class SemanticThreat(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    domain: AdversarialDomain
    selector: MaliciousSelector
    actor: AgentActor
    intent: str
    reason: str
    timestamp: str

# --- API MODELS ---
class RememberRequest(BaseModel):
    domain: str
    selector: str
    intent: str
    reason: str
    caller_id: str = "system"
    status: str = "BLOCK"

class RecallRequest(BaseModel):
    domain: str
    selector: str

@app.on_event("startup")
async def startup_event():
    # Attempt to connect cognee to local auth-free server or use local DB
    service_url = os.getenv("COGNEE_SERVICE_URL")
    if service_url:
        print(f"Connecting to Cognee Service at {service_url}")
        await cognee.serve(url=service_url, api_key="local_development_key")
    else:
        print("Using local Cognee DB (no external service URL provided).")
    
    # Removed update_graph since cognee_network_visualization is unavailable

@app.post("/remember")
async def remember_threat(req: RememberRequest, background_tasks: BackgroundTasks):
    """
    Ingests a semantic threat or safe action using the custom ontology.
    """
    threat = SemanticThreat(
        domain=AdversarialDomain(domain=req.domain),
        selector=MaliciousSelector(selector=req.selector),
        actor=AgentActor(caller_id=req.caller_id),
        intent=req.intent,
        reason=req.reason,
        timestamp="NOW" # In production, use ISO string
    )
    
    # 1. Add structured data to our bypass in-memory graph
    try:
        domain_node = f"domain_{req.domain}"
        selector_node = f"selector_{hash(req.selector)}"
        
        # Display as Autonomous Agent instead of actor_autonomous-agent
        display_name = "Autonomous Agent" if req.caller_id == "autonomous-agent" else req.caller_id
        actor_node = f"actor_{req.caller_id}"
        
        # Add Nodes if not exist
        node_ids = [n[0] for n in demo_nodes]
        if domain_node not in node_ids:
            demo_nodes.append([domain_node, {"type": "DocumentChunk", "name": req.domain}])
        if selector_node not in node_ids:
            demo_nodes.append([selector_node, {"type": "TextSummary", "name": req.selector[:30]+'...'}])
        if actor_node not in node_ids:
            demo_nodes.append([actor_node, {"type": "EntityType", "name": display_name}])
            
        # Add Edges
        demo_edges.append(["agent_core", actor_node, "INITIATES", {"weight": 1.0}])
        demo_edges.append([actor_node, domain_node, "TARGETS", {"weight": 1.0}])
        
        if req.status == "ALLOW":
            demo_edges.append([domain_node, selector_node, "EXECUTES_SAFELY", {"weight": 1.0}])
        else:
            demo_edges.append([domain_node, selector_node, "CONTAINS_THREAT", {"weight": 1.0}])
            
        # Persist to disk
        save_graph_state()
        
    except Exception as e:
        print(f"Error adding to in-memory graph: {e}")
        
    # Skip real cognee add and cognify to prevent hanging the server on API failures
    # We are using the demo in-memory graph anyway.
    
    return {"status": "indexed", "threat_id": threat.id}

@app.post("/recall")
async def recall_threats(req: RecallRequest):
    """
    Performs a Hybrid Search (Vector + Graph) for threats on the domain.
    """
    query = f"Find any malicious selectors on domain {req.domain} similar to {req.selector}"
    
    try:
        # 1. Fast path: Check in-memory demo graph for exact/partial matches
        selector_node = f"selector_{hash(req.selector)}"
        
        # Check if this exact selector is known to be a threat
        is_threat = False
        for edge in demo_edges:
            # edge format: [source, target, label, data]
            if edge[1] == selector_node and edge[2] == "CONTAINS_THREAT":
                is_threat = True
                break
                
        if is_threat:
            return {"results": [{"text": req.selector, "score": 1.0, "reason": "Matched in active graph"}]}
            
        # 2. Fallback to vector embeddings + graph relationships
        try:
            results = await asyncio.wait_for(cognee.search(query), timeout=0.5)
            return {"results": results}
        except asyncio.TimeoutError:
            print("Cognee search timed out (likely due to API error).")
            return {"results": []}
    except Exception as e:
        # If cognee search fails, we just return empty so we don't break the proxy
        return {"results": []}

@app.get("/graph")
async def get_knowledge_graph():
    """
    Retrieves a simplified version of the Security Knowledge Fabric
    for frontend UI visualization.
    """
    try:
        # Map the live demo_nodes and demo_edges into standard JSON for the react-force-graph
        nodes = []
        for node_id, node_data in demo_nodes:
            # Determine color based on type
            color = "#a3a3a3" # Default gray
            if node_data.get("name") == "Agent Intent":
                color = "#7c3aed" # Purple for root intent
            elif node_data.get("type") == "EntityType":
                color = "#1a1a2e" # Dark for actor
            elif node_data.get("type") == "DocumentChunk":
                color = "#2563eb" # Blue for domain
            elif node_data.get("type") == "TextSummary":
                color = "#d97706" # Yellowish for selector default
                
            nodes.append({
                "id": node_id,
                "type": node_data.get("type", "Unknown"),
                "label": node_data.get("name", node_id),
                "color": color
            })
            
        edges = []
        for edge in demo_edges:
            source, target, label, data = edge
            # If the label is CONTAINS_THREAT, make the target node red
            if label == "CONTAINS_THREAT":
                for n in nodes:
                    if n["id"] == target:
                        n["color"] = "#ef4444" # Red for threat
            # If the label is EXECUTES_SAFELY, make the target node green
            if label == "EXECUTES_SAFELY":
                for n in nodes:
                    if n["id"] == target:
                        n["color"] = "#10b981" # Green for safe
                        
            edges.append({
                "source": source,
                "target": target,
                "label": label,
                "weight": data.get("weight", 1.0)
            })

        graph_data = {
            "nodes": nodes,
            "edges": edges
        }
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
