import { Database } from 'better-sqlite3'
import { User, AuthUser } from '../../../shared/types'
import { getDatabase } from '../connection'
import crypto from 'crypto'

export class UserRepository {
  private db: Database

  constructor(db?: Database) {
    this.db = db || getDatabase()
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
  }

  create(
    username: string,
    email: string,
    password: string,
    fullName?: string,
    role: 'admin' | 'manager' | 'cashier' = 'cashier'
  ): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES (@username, @email, @password_hash, @full_name, @role)
    `)

    const info = stmt.run({
      username,
      email,
      password_hash: this.hashPassword(password),
      full_name: fullName || null,
      role
    })

    return this.getById(info.lastInsertRowid as number)!
  }

  authenticate(username: string, password: string): AuthUser | null {
    const passwordHash = this.hashPassword(password)

    const stmt = this.db.prepare(`
      SELECT id, username, email, full_name, role, is_active, last_login, created_at, updated_at
      FROM users
      WHERE username = @username AND password_hash = @password_hash AND is_active = 1
    `)

    const user = stmt.get({ username, password_hash: passwordHash }) as any

    if (user) {
      // Update last_login
      const updateStmt = this.db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = @id')
      updateStmt.run({ id: user.id })

      return user as AuthUser
    }

    return null
  }

  getById(id: number): User | undefined {
    const stmt = this.db.prepare(`
      SELECT id, username, email, full_name, role, is_active, last_login, created_at, updated_at
      FROM users
      WHERE id = @id
    `)

    return stmt.get({ id }) as User | undefined
  }

  getByUsername(username: string): User | undefined {
    const stmt = this.db.prepare(`
      SELECT id, username, email, full_name, role, is_active, last_login, created_at, updated_at
      FROM users
      WHERE username = @username
    `)

    return stmt.get({ username }) as User | undefined
  }

  getAll(): User[] {
    const users = this.db
      .prepare(
        `
      SELECT id, username, email, full_name, role, is_active, last_login, created_at, updated_at
      FROM users
      ORDER BY username
    `
      )
      .all()

    return users as User[]
  }

  update(id: number, data: Partial<User & { password?: string }>): boolean {
    const updateData: any = { ...data, id }

    // Handle password if provided
    if (updateData.password) {
      updateData.password_hash = this.hashPassword(updateData.password)
      delete updateData.password
    }

    const fields = Object.keys(updateData)
      .filter((key) => key !== 'id' && key !== 'created_at' && key !== 'password_hash')
      .map((key) => `${key} = @${key}`)
      .join(', ')

    if (!fields) return false

    const stmt = this.db.prepare(`
      UPDATE users
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `)

    const info = stmt.run(updateData)
    return info.changes > 0
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?')
    const info = stmt.run(id)
    return info.changes > 0
  }

  changePassword(id: number, newPassword: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE users
      SET password_hash = @password_hash, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `)

    const info = stmt.run({
      id,
      password_hash: this.hashPassword(newPassword)
    })

    return info.changes > 0
  }

  deactivate(id: number): boolean {
    return this.update(id, { is_active: false })
  }

  activate(id: number): boolean {
    return this.update(id, { is_active: true })
  }

  usernameExists(username: string): boolean {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?')
    const result = stmt.get(username) as any
    return result.count > 0
  }

  emailExists(email: string): boolean {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?')
    const result = stmt.get(email) as any
    return result.count > 0
  }
}
