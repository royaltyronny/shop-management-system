import { getDatabase } from '../connection'
import { RunResult } from 'better-sqlite3'

export class SettingsRepository {
  private get db() {
    return getDatabase()
  }

  getAll(): Record<string, unknown> {
    const rows = this.db.prepare('SELECT key, value FROM settings').all() as {
      key: string
      value: string
    }[]

    // Convert array of {key, value} to single object
    return rows.reduce(
      (acc, row) => {
        try {
          // Try to parse JSON if possible, otherwise string
          acc[row.key] = JSON.parse(row.value)
        } catch {
          acc[row.key] = row.value
        }
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  get(key: string): unknown {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
      | { value: string }
      | undefined
    if (!row) return null
    try {
      return JSON.parse(row.value)
    } catch {
      return row.value
    }
  }

  upsert(key: string, value: unknown): RunResult {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    return this.db
      .prepare(
        `
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `
      )
      .run(key, stringValue)
  }

  upsertMany(settings: Record<string, unknown>): void {
    const insert = this.db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `)

    const runMany = this.db.transaction((items: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(items)) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
        insert.run(key, stringValue)
      }
    })

    runMany(settings)
  }
}
