// PostgreSQL Import/Export utilities for ERD

import { PostgresTable, parsePostgresCreateStatement } from './erdUtils'

/**
 * Parse a full PostgreSQL dump file and extract CREATE TABLE statements
 */
export function parsePostgresDump(dumpContent: string): PostgresTable[] {
  const tables: PostgresTable[] = []

  // Split by CREATE TABLE statements
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?\s*\([^;]*\);/gi
  let match

  while ((match = createTableRegex.exec(dumpContent)) !== null) {
    const statement = dumpContent.substring(match.index, dumpContent.indexOf(';', match.index) + 1)
    const table = parsePostgresCreateStatement(statement)
    if (table) {
      tables.push(table)
    }
  }

  return tables
}

/**
 * Generate PostgreSQL dump from parsed tables
 */
export function generatePostgresDump(tables: PostgresTable[]): string {
  const lines: string[] = [
    '-- PostgreSQL Database Dump',
    `-- Generated from ERD Diagram at ${new Date().toISOString()}`,
    '--',
    '',
  ]

  // Add SET statements
  lines.push('SET statement_timeout = 0;')
  lines.push('SET lock_timeout = 0;')
  lines.push('SET idle_in_transaction_session_timeout = 0;')
  lines.push('SET client_encoding = \'UTF8\';')
  lines.push('SET standard_conforming_strings = on;')
  lines.push('SELECT pg_catalog.set_config(\'search_path\', \'\', false);')
  lines.push('SET check_function_bodies = false;')
  lines.push('SET xmloption content;')
  lines.push('SET client_min_messages = warning;')
  lines.push('')

  // Add tables
  tables.forEach((table) => {
    lines.push(`--`)
    lines.push(`-- Name: ${table.name}; Type: TABLE; Schema: public; Owner: postgres`)
    lines.push(`--`)
    lines.push('')

    const columnDefs = table.columns
      .map((col) => {
        const parts = [`  "${col.name}" ${col.type}`]
        if (!col.nullable) parts.push('NOT NULL')
        if (col.default) parts.push(`DEFAULT ${col.default}`)
        return parts.join(' ')
      })
      .join(',\n')

    let sql = `CREATE TABLE public."${table.name}" (\n${columnDefs}`

    // Add primary key constraint
    if (table.primaryKey && table.primaryKey.length > 0) {
      const pkCols = table.primaryKey.map((pk) => `"${pk}"`).join(', ')
      sql += `,\n  CONSTRAINT "${table.name}_pkey" PRIMARY KEY (${pkCols})`
    }

    sql += '\n);\n'

    lines.push(sql)

    // Add foreign keys
    if (table.foreignKeys) {
      table.foreignKeys.forEach((fk) => {
        const fkSql = `ALTER TABLE public."${table.name}" ADD CONSTRAINT "${fk.name}" FOREIGN KEY ("${fk.column}") REFERENCES public."${fk.referencedTable}"("${fk.referencedColumn}");`
        lines.push(fkSql)
      })
    }

    lines.push('')
  })

  return lines.join('\n')
}

/**
 * Validate PostgreSQL SQL syntax (basic validation)
 */
export function validatePostgresSQL(sql: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for unmatched parentheses
  let parenCount = 0
  for (const char of sql) {
    if (char === '(') parenCount++
    if (char === ')') parenCount--
    if (parenCount < 0) {
      errors.push('Unmatched closing parenthesis')
      break
    }
  }
  if (parenCount > 0) {
    errors.push('Unmatched opening parenthesis')
  }

  // Check for unmatched quotes
  const singleQuotes = (sql.match(/[^\\]'/g) || []).length
  if (singleQuotes % 2 !== 0) {
    errors.push('Unmatched single quote')
  }

  // Check for required keywords
  if (!/CREATE\s+TABLE/i.test(sql) && !/ALTER\s+TABLE/i.test(sql)) {
    errors.push('No CREATE TABLE or ALTER TABLE statement found')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Export ERD schema as SQL file
 */
export function downloadPostgresSchema(tables: PostgresTable[]) {
  const sql = generatePostgresDump(tables)
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sql))
  element.setAttribute('download', `schema-${Date.now()}.sql`)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

/**
 * Import PostgreSQL SQL file
 */
export function importPostgresSQL(file: File): Promise<PostgresTable[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const tables = parsePostgresDump(content)
        resolve(tables)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsText(file)
  })
}
