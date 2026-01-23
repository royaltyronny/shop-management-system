import { Database } from 'better-sqlite3'
import { getDatabase } from '../connection'
import { Supplier } from '../../../shared/types'

export class SupplierRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  create(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Supplier {
    const stmt = this.db.prepare(`
      INSERT INTO suppliers (name, contact_person, phone, email, address)
      VALUES (@name, @contact_person, @phone, @email, @address)
    `)
    const info = stmt.run(supplier)
    return this.getById(Number(info.lastInsertRowid))!
  }

  getAll(): Supplier[] {
    return this.db.prepare('SELECT * FROM suppliers ORDER BY name').all() as Supplier[]
  }

  getById(id: number): Supplier | undefined {
    return this.db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id) as Supplier | undefined
  }

  update(
    id: number,
    supplier: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>
  ): boolean {
    const fields = Object.keys(supplier)
      .map((key) => `${key} = @${key}`)
      .join(', ')

    if (!fields) return false

    const stmt = this.db.prepare(`
      UPDATE suppliers 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = @id
    `)
    const info = stmt.run({ ...supplier, id })
    return info.changes > 0
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM suppliers WHERE id = ?')
    const info = stmt.run(id)
    return info.changes > 0
  }

  search(query: string): Supplier[] {
    const term = `%${query}%`
    return this.db
      .prepare(
        `
      SELECT * FROM suppliers 
      WHERE name LIKE ? OR contact_person LIKE ? OR email LIKE ?
    `
      )
      .all(term, term, term) as Supplier[]
  }
}
