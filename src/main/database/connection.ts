import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import { mkdirSync, existsSync } from 'fs'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) return db

  const isDev = !app.isPackaged
  
  // In dev, use the project root database folder
  // In prod, use app data folder: %APPDATA%\Sunrise Shop
  let dbPath: string
  
  if (isDev) {
    dbPath = path.join(__dirname, '../../database/shop.db')
  } else {
    const appDataPath = path.join(app.getPath('appData'), 'Sunrise Shop')
    dbPath = path.join(appDataPath, 'shop.db')
  }

  try {
    // Ensure directory exists with full permissions
    const dbDir = path.dirname(dbPath)
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true, mode: 0o755 })
      console.log(`Created database directory at: ${dbDir}`)
    }

    const dbExists = existsSync(dbPath)
    console.log(`Database path: ${dbPath}`)
    console.log(`Database exists: ${dbExists}`)

    db = new Database(dbPath, { 
      verbose: (message?: unknown) => {
        // Only log important operations, not every query
        if (typeof message === 'string' && (message.includes('CREATE') || message.includes('INSERT INTO users'))) {
          console.log('[DB] ' + message.substring(0, 100))
        }
      },
      fileMustExist: false
    })
    db.pragma('journal_mode = WAL') // Better performance
    db.pragma('foreign_keys = ON')
    console.log('✓ Connected to database successfully')
    return db
  } catch (error) {
    console.error('✗ Failed to connect to database', error)
    throw error
  }
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
    console.log('Database connection closed')
  }
}


