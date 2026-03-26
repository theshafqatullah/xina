// PostgreSQL ERD Generation Utilities

export interface PostgresTable {
  name: string
  columns: PostgresColumn[]
  primaryKey?: string[]
  foreignKeys?: ForeignKey[]
}

export interface PostgresColumn {
  name: string
  type: string
  nullable: boolean
  default?: string
  isPrimaryKey?: boolean
}

export interface ForeignKey {
  name: string
  column: string
  referencedTable: string
  referencedColumn: string
}

export interface ERDDiagram {
  entities: EntityShape[]
  relationships: RelationshipShape[]
  attributes: AttributeShape[]
}

export interface EntityShape {
  id: string
  type: 'entity'
  label: string
  x: number
  y: number
  tableName: string
  columns: PostgresColumn[]
}

export interface RelationshipShape {
  id: string
  type: 'relationship'
  label: string
  x: number
  y: number
  fromEntity: string
  toEntity: string
  fromColumn: string
  toColumn: string
}

export interface AttributeShape {
  id: string
  type: 'attribute'
  label: string
  x: number
  y: number
  parentEntity: string
}

/**
 * Convert PostgreSQL schema to ERD diagram
 * This generates optimal layout for tables and relationships
 */
export function postgresSchemaToERD(tables: PostgresTable[]): ERDDiagram {
  const entities: EntityShape[] = []
  const relationships: RelationshipShape[] = []

  // Calculate layout grid
  const cols = Math.ceil(Math.sqrt(tables.length))
  const spacing = 300
  const startX = 50
  const startY = 50

  // Create entities
  tables.forEach((table, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols

    entities.push({
      id: `entity-${table.name}`,
      type: 'entity',
      label: table.name,
      x: startX + col * spacing,
      y: startY + row * spacing,
      tableName: table.name,
      columns: table.columns,
    })
  })

  // Create relationships from foreign keys
  tables.forEach((table) => {
    if (table.foreignKeys) {
      table.foreignKeys.forEach((fk) => {
        const fromEntity = entities.find((e) => e.tableName === table.name)
        const toEntity = entities.find((e) => e.tableName === fk.referencedTable)

        if (fromEntity && toEntity) {
          relationships.push({
            id: `rel-${table.name}-${fk.referencedTable}`,
            type: 'relationship',
            label: fk.name,
            x: (fromEntity.x + toEntity.x) / 2,
            y: (fromEntity.y + toEntity.y) / 2,
            fromEntity: fromEntity.id,
            toEntity: toEntity.id,
            fromColumn: fk.column,
            toColumn: fk.referencedColumn,
          })
        }
      })
    }
  })

  return {
    entities,
    relationships,
    attributes: [],
  }
}

/**
 * Parse PostgreSQL CREATE TABLE statements
 * This is a simple parser for basic schemas
 */
export function parsePostgresCreateStatement(sql: string): PostgresTable | null {
  // Simple regex-based parser
  const tableMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?\s*\(([\s\S]*)\);?$/im)

  if (!tableMatch) return null

  const tableName = tableMatch[1]
  const columnDefs = tableMatch[2]

  const columns: PostgresColumn[] = []
  const primaryKeys: string[] = []
  const foreignKeys: ForeignKey[] = []

  // Split by commas not inside parentheses
  const lines = columnDefs.split('\n').filter((line) => line.trim())

  lines.forEach((line) => {
    line = line.trim().replace(/,\s*$/, '')

    // Check for PRIMARY KEY constraint
    if (line.toUpperCase().startsWith('PRIMARY KEY')) {
      const match = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i)
      if (match) {
        primaryKeys.push(...match[1].split(',').map((col) => col.trim()))
      }
      return
    }

    // Check for FOREIGN KEY constraint
    if (line.toUpperCase().startsWith('FOREIGN KEY')) {
      const match = line.match(/FOREIGN\s+KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\s*\((\w+)\)/i)
      if (match) {
        foreignKeys.push({
          name: `fk_${tableName}_${match[1]}`,
          column: match[1],
          referencedTable: match[2],
          referencedColumn: match[3],
        })
      }
      return
    }

    // Parse column definition
    const match = line.match(/["']?(\w+)["']?\s+(\w+(?:\([^)]+\))?)\s*(.*)/i)
    if (match) {
      const [, name, type, constraints] = match
      const nullable = !constraints.toUpperCase().includes('NOT NULL')
      const isPrimaryKey = constraints.toUpperCase().includes('PRIMARY KEY')

      columns.push({
        name,
        type,
        nullable,
        isPrimaryKey,
      })

      if (isPrimaryKey) {
        primaryKeys.push(name)
      }
    }
  })

  return {
    name: tableName,
    columns,
    primaryKey: primaryKeys.length > 0 ? primaryKeys : undefined,
    foreignKeys: foreignKeys.length > 0 ? foreignKeys : undefined,
  }
}

/**
 * Convert TldrawSnapshot to PostgreSQL schema
 * Generates CREATE TABLE statements from ERD diagram
 */
export function erdToPostgresSchema(diagram: ERDDiagram): string {
  const statements: string[] = []

  diagram.entities.forEach((entity) => {
    const columns = entity.columns
      .map((col) => {
        const parts = [col.name, col.type]
        if (!col.nullable) {
          parts.push('NOT NULL')
        }
        if (col.isPrimaryKey) {
          parts.push('PRIMARY KEY')
        }
        return parts.join(' ')
      })
      .join(',\n  ')

    statements.push(`CREATE TABLE ${entity.label} (
  ${columns}
);`)
  })

  // Add foreign key constraints
  diagram.relationships.forEach((rel) => {
    const fromEntity = diagram.entities.find((e) => e.id === rel.fromEntity)
    const toEntity = diagram.entities.find((e) => e.id === rel.toEntity)

    if (fromEntity && toEntity) {
      statements.push(
        `ALTER TABLE ${fromEntity.label} ADD CONSTRAINT ${rel.label} FOREIGN KEY (${rel.fromColumn}) REFERENCES ${toEntity.label}(${rel.toColumn});`
      )
    }
  })

  return statements.join('\n\n')
}
