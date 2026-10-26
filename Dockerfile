# Runtime image for the HTTP (shared service) mode. Build the bundle first: `bun run build`.
#   docker run -p 3333:3333 -e METABASE_URL=... -e METABASE_API_KEY=... -e MCP_HTTP_TOKEN=... ghcr.io/serdnaley/metabase-mcp
# stdio instead:  docker run -i -e MCP_TRANSPORT=stdio -e METABASE_URL=... -e METABASE_API_KEY=... ghcr.io/serdnaley/metabase-mcp
FROM node:22-alpine
LABEL org.opencontainers.image.source="https://github.com/Serdnaley/metabase-mcp" \
      org.opencontainers.image.description="Headless MCP server for Metabase (API-key auth, stdio or HTTP)" \
      org.opencontainers.image.licenses="MIT"
WORKDIR /app
COPY dist/index.js /app/index.js
ENV NODE_ENV=production \
    MCP_TRANSPORT=http \
    MCP_HTTP_HOST=0.0.0.0 \
    MCP_HTTP_PORT=3333
EXPOSE 3333
USER node
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:3333/health || exit 1
ENTRYPOINT ["node", "/app/index.js"]
