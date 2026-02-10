# Primary Heading

## Mermaid Diagrams

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database

    C->>S: POST /auth/login
    S->>DB: Query user
    DB-->>S: User record
    S-->>C: 200 JWT token
```

## Code Blocks

```typescript
import { createServer } from 'node:http'

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello World')
})

server.listen(3000)
```

## Blockquotes

> Blockquote text stands apart from the main flow.
> Multiple lines of quoted material.

## Task Lists

- [x] **Completed** task
- [ ] Pending task with `details`

---

## Secondary Heading

### Tertiary Heading

Regular paragraph text with **bold emphasis** and *italic emphasis* and ~~strikethrough~~ inline.

Inline code: `const server = createServer()` and `pnpm install` in a sentence.

- **Bold** in a list item
- Uses `inline code` in a list
- [Link text](https://example.com) in a list
- Mixed: **bold**, `code`, and *italic* together
- Plain list item

1. First ordered item with `code`
2. Second with **emphasis**
3. Third plain

[Visit the docs](https://example.com/docs) for more information.
