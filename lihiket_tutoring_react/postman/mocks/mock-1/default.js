/**
 * Get started with your new mock.
 *
 * This mock contains a GET /health endpoint.
 * Start the mock server to test it.
 * 
 * Add your own routes below or reuse request and examples from collections.
 * 
 * You can annotate routes with @endpoint <method> /<path>.
 *
 * Use pm.state to persist data across requests e.g.
 *   await pm.state.set("count", 1);
 *   const count = await pm.state.get("count");
 */
const http = require("http");
const PORT = process.env.PORT || 4500;

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // @endpoint GET /health
  if (method === "GET" && url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok" }));
  }

  if (pm.mock.matchRequest("SELECT REQUEST", req)) {
    return pm.mock.sendExample("SELECT EXAMPLE", res);
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not defined" }));
});

server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});