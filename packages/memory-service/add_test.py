import asyncio
import cognee

async def main():
    print("Adding data to cognee...")
    # Add simple data
    text = "Malicious intent detected on example.com by agent-007."
    await cognee.add(text)
    
    print("Cognifying...")
    await cognee.cognify()
    
    print("Visualizing...")
    html = await cognee.visualize_graph()
    
    print("Search...")
    results = await cognee.search("malicious")
    print(f"Results: {results}")

if __name__ == "__main__":
    asyncio.run(main())
