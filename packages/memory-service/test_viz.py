import asyncio
from cognee.modules.visualization.cognee_network_visualization import cognee_network_visualization

async def main():
    demo_nodes = [("agent_core", {"type": "Entity", "name": "Agent Intent"})]
    demo_edges = []
    
    html = await cognee_network_visualization((demo_nodes, demo_edges))
    print(html[:500])
    print("...")
    print("SUCCESS")

if __name__ == "__main__":
    asyncio.run(main())
