import { UserRepository } from '../database/repositories/userRepository'
import { AuthUser, User } from '../../shared/types'

interface SessionData {
  user: AuthUser
  token: string
  createdAt: number
}

export class AuthService {
  private userRepo: UserRepository
  private sessions: Map<string, SessionData> = new Map()
  private sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours

  constructor(userRepo?: UserRepository) {
    this.userRepo = userRepo || new UserRepository()
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  login(username: string, password: string): { user: AuthUser; token: string } | null {
    const user = this.userRepo.authenticate(username, password)

    if (!user) {
      return null
    }

    const token = this.generateToken()
    this.sessions.set(token, {
      user,
      token,
      createdAt: Date.now()
    })

    return { user, token }
  }

  logout(token: string): boolean {
    return this.sessions.delete(token)
  }

  validateToken(token: string): AuthUser | null {
    const session = this.sessions.get(token)

    if (!session) {
      return null
    }

    // Check if session has expired
    if (Date.now() - session.createdAt > this.sessionTimeout) {
      this.sessions.delete(token)
      return null
    }

    return session.user
  }

  getCurrentUser(token: string): AuthUser | null {
    return this.validateToken(token)
  }

  createUser(
    username: string,
    email: string,
    password: string,
    fullName?: string,
    role: 'admin' | 'manager' | 'cashier' = 'cashier'
  ): User {
    return this.userRepo.create(username, email, password, fullName, role)
  }

  updateUser(id: number, data: Partial<User>): boolean {
    return this.userRepo.update(id, data)
  }

  deleteUser(id: number): boolean {
    return this.userRepo.delete(id)
  }

  getAllUsers(): User[] {
    return this.userRepo.getAll()
  }

  getUserById(id: number): User | undefined {
    return this.userRepo.getById(id)
  }

  changePassword(id: number, newPassword: string): boolean {
    return this.userRepo.changePassword(id, newPassword)
  }

  deactivateUser(id: number): boolean {
    return this.userRepo.deactivate(id)
  }

  activateUser(id: number): boolean {
    return this.userRepo.activate(id)
  }
}
