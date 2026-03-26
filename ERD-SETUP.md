# Xina ERD Diagram Editor

A local-first, real-time ERD (Entity-Relationship Diagram) editor built with [tldraw](https://tldraw.dev/) and Next.js for designing PostgreSQL database schemas.

## Features

- **Local-First Architecture**: All diagrams are stored in browser's localStorage automatically
- **PostgreSQL Schema Support**: Import/export SQL schemas and visualize them as ERD diagrams
- **Custom ERD Shapes**: Entities (rectangles), Relationships (diamonds), and Attributes (ellipses)
- **Real-Time Persistence**: Changes are saved automatically as you draw
- **Export/Import**: Download diagrams as JSON or import previously saved diagrams
- **SQL Generation**: Generate PostgreSQL CREATE TABLE statements from your ERD diagrams

## Installation

The tldraw library has been installed. To get started:

```bash
npm install  # Already done
npm run dev  # Start development server
```

Then navigate to `/draw` in your browser.

## Usage

### Creating Diagrams

1. Open `/draw` in your browser
2. Use the left toolbar to add shapes:
   - **Entity**: Rectangle (blue) - represents database tables
   - **Relationship**: Diamond (purple) - represents relationships between entities
   - **Attribute**: Ellipse (green) - represents table attributes/columns

### Saving & Loading

- **Automatic Save**: All changes are automatically persisted to browser localStorage
- **Export**: Click "Export" to download your diagram as a JSON file
- **Import**: Click "Import" to load a previously saved JSON diagram
- **Clear Canvas**: Click "Clear" to remove all shapes (with confirmation)

### PostgreSQL Integration

#### Importing a SQL Schema

```javascript
// From your page/component:
import { parsePostgresDump, postgresSchemaToERD } from '@/lib/postgresUtils'

// When user uploads a .sql file:
const tables = parsePostgresDump(sqlContent)
const erdDiagram = postgresSchemaToERD(tables)
```

#### Exporting to SQL

```javascript
import { erdToPostgresSchema } from '@/lib/erdUtils'

const sqlStatements = erdToPostgresSchema(erdDiagram)
// User can copy/paste into their database
```

## Architecture

### Components

- **`/app/(draw)/draw/page.tsx`**: Main draw page with dynamic imports
- **`DrawPageWithTldraw.tsx`**: Tldraw editor wrapper with persistence
- **`ERDToolbar.tsx`**: Custom toolbar for ERD shape creation
- **`erdShapes.ts`**: Custom shape definitions for ERD elements

### Hooks

- **`useLocalFirstPersistence`**: Handles localStorage operations for diagram snapshots

### Utilities

- **`lib/erdUtils.ts`**: ERD diagram conversion and SQL generation
- **`lib/postgresUtils.ts`**: PostgreSQL import/export and parsing

## Local-First Persistence Details

The editor uses browser's localStorage to persist diagrams:

- **Storage Key**: `xina-erd-diagram`
- **Stored Data**: 
  - Version information for schema compatibility
  - Last modified timestamp
  - Full tldraw snapshot (all shapes and connections)

Auto-saves happen after each shape creation/modification. You can work completely offline and sync later.

## TypeScript Types

### ERDDiagram
```typescript
interface ERDDiagram {
  entities: EntityShape[]      // Database tables
  relationships: RelationshipShape[] // Foreign keys/relationships
  attributes: AttributeShape[] // Column attributes (optional)
}
```

### PostgresTable
```typescript
interface PostgresTable {
  name: string
  columns: PostgresColumn[]
  primaryKey?: string[]
  foreignKeys?: ForeignKey[]
}
```

## Development

### Adding New ERD Shape Types

Edit `components/draw/erdShapes.ts`:

```typescript
const newShapeDefn: CustomShapeDefn = {
  type: 'my-shape',
  migrations: [],
  props: () => ({ /* ... */ }),
  validate: (props: any) => props,
  draw: (shape: any, editor: any) => {
    // SVG rendering logic
  },
}

export function setupERDShapes(config: TldrawEditorConfig) {
  config.registerShape({ ...newShapeDefn } as any)
}
```

### Modifying Toolbar Actions

Edit `components/draw/ERDToolbar.tsx` to add new buttons and handlers like export/import.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires localStorage support

## Storage Limits

- **Typical Diagram**: ~50-200KB in localStorage
- **Maximum Browser Storage**: Usually 5-10MB (browser-dependent)
- **Compression**: Consider implementing if diagrams exceed storage limits

## Future Enhancements

- [ ] Cloud sync (with Appwrite backend)
- [ ] Collaborative editing
- [ ] Custom styling for shapes
- [ ] Validation rules for ERD
- [ ] Generate TypeScript types from schema
- [ ] Support for other database systems (MySQL, MongoDB, etc.)
- [ ] A/B testing and analytics integration

## Troubleshooting

### Diagram not saving
- Check browser's localStorage is enabled
- Check console for errors
- Try clearing storage and creating a new diagram

### Import fails
- Ensure JSON file is valid (exported from the same editor)
- Check browser console for parsing errors

### Shapes not appearing
- Refresh the page
- Clear browser cache
- Check browser console for errors

## Resources

- [tldraw Documentation](https://docs.tldraw.dev/)
- [tldraw Github](https://github.com/tldraw/tldraw)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
