# Puck Extension Guide

Read this when:
- Adding a new Puck component type (extending what content editors can compose)
- Modifying the WebMCP plumbing (extending the Puck ↔ agent integration)

For daily page editing rules, deployment URLs, MCP setup, and component code conventions, see `CLAUDE.md`.

## Architecture

Tools are registered via `navigator.modelContext.registerTool()` (WebMCP standard) when the Puck editor loads. The `webmcp-bridge` MCP server discovers them via CDP and exposes them as `list_webmcp_tools` / `call_webmcp_tool`. Tools operate on the editor's in-memory state (not the Payload API), so changes appear live in the editor.

```
src/lib/webmcp/            — Tool registry, schema converter
src/puck/webmcp-plugin.tsx — Puck plugin (bridges usePuck() to registry)
src/components/puck/       — Custom competition components
```

## Building a Custom Puck Component (Webflow → Puck)

1. **Extract source** — download HTML/CSS from Webflow pages to `docs/reference/webflow/`.
2. **Identify sections** — each `<section>` in Webflow maps to one Puck component.
3. **Write the React component** — match source CSS values exactly. Follow the file convention, parity, styling, and responsive rules in `CLAUDE.md` → "Component Code Edits."
4. **Split into two files** — `.render.tsx` (server-safe render + types + `defaultProps`) and `.tsx` (Puck field definitions). Required because `createMediaField` is client-only.
5. **Register** — add to `src/components/puck/index.ts` (client) and `index.server.ts` (server). Both Puck configs import from these registries.
6. **Deploy** — components appear in the Puck sidebar. WebMCP `get_component_schema` auto-discovers them.
7. **Use via WebMCP** — agent calls `update_page` with the new component type and props.

### What's configurable vs locked

- **Configurable (Puck fields):** text content, images, brand colors, CTA links, layout direction.
- **Locked (React code):** font sizes, spacing, grid layout, responsive breakpoints, visual structure.
- Design philosophy: editors customize content and branding; developers own the visual structure.

## Key Design Decisions

- **Editor state, not Payload API**: tools dispatch `setData` into Puck's reducer for live WYSIWYG updates. Save/publish is a separate action.
- **No separate auth**: agent piggybacks on the human's admin session via CDP.
- **Minimal codebase footprint**: all new code in `src/lib/webmcp/` and `src/puck/webmcp-plugin.tsx`. Only `PuckProvider.tsx` is modified (1 import + 1 prop).
