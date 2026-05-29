# MCP Plugin Guide: @agentos/mcp-server
**Protocol:** Model Context Protocol (MCP) v1.0

AgentOS implements the MCP standard to provide plug-and-play security for **Claude Desktop**, **Cursor**, and other AI development environments.

---

## 🔌 Integration with Claude Desktop

To add the AgentOS Security Guard to Claude, follow these steps:

1.  **Open your Claude Config:**
    *   Windows: `%APPDATA%\Claude\claude_desktop_config.json`
    *   Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

2.  **Add the AgentOS Server:**
    Add the following to the `mcpServers` object:

    ```json
    {
      "mcpServers": {
        "agent-os": {
          "command": "node",
          "args": ["K:/Hackthon/WebDataV3/packages/mcp-server/dist/index.js"]
        }
      }
    }
    ```

3.  **Restart Claude:**
    Claude will now have access to the **"Semantic Governance"** tools.

---

## 🛠️ Provided Tools

### `verify_action`
Every time Claude prepares to click or input data, it will automatically call this tool to ensure the action aligns with your original request.

### `attest_capability`
Allows the agent to sign its planning manifest, ensuring non-repudiation and preventing capability escalation attacks.

---

## 🤖 Why use the MCP mode?
Using the MCP mode ensures that the "Brain" of your AI agent is physically separated from its "Eyes" (the browser). This creates a **Governance Bottleneck** that is impossible for a malicious website to bypass.

---
[Return to Index](./INDEX.md)
