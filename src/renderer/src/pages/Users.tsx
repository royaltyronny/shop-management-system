import { useEffect, useState } from 'react'
import { User } from '../../../shared/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, Trash2, Edit, Shield, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  full_name: z.string().optional(),
  role: z.enum(['admin', 'manager', 'cashier'])
})

type UserFormValues = z.infer<typeof userSchema>

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'cashier'
    }
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await window.api.users.getAll()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
      alert('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await window.api.users.delete(id)
        loadUsers()
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const handleSave = async (data: UserFormValues) => {
    try {
      if (editingUser) {
        // Update user - password is optional on update
        const updateData: any = {
          username: data.username,
          email: data.email,
          full_name: data.full_name,
          role: data.role
        }
        if (data.password) {
          await window.api.users.changePassword(editingUser.id, data.password)
        }
        await window.api.users.update(editingUser.id, updateData)
      } else {
        // Create new user - password is required
        if (!data.password) {
          form.setError('password', { message: 'Password is required for new users' })
          return
        }
        await window.api.users.create({
          username: data.username,
          email: data.email,
          password: data.password,
          fullName: data.full_name,
          role: data.role
        })
      }
      setIsDialogOpen(false)
      form.reset()
      loadUsers()
    } catch (error) {
      console.error('Failed to save user:', error)
      alert(error instanceof Error ? error.message : 'Failed to save user')
    }
  }

  const openAddDialog = () => {
    setEditingUser(undefined)
    form.reset({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'cashier'
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    form.reset({
      username: user.username,
      email: user.email,
      password: '',
      full_name: user.full_name || '',
      role: user.role
    })
    setIsDialogOpen(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'manager':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-green-500/10 text-green-500 border-green-500/20'
    }
  }

  return (
    <div className="h-full flex flex-col gap-10 overflow-hidden animate-entrance selection:bg-primary/20">
      <div className="flex justify-between items-end shrink-0">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-foreground">User Management</h1>
          <p className="text-muted-foreground font-medium text-lg italic">
            Create and manage system users and their access roles.
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="h-14 px-6 rounded-2xl font-bold gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          New User
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader className="border-b border-white/10">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by username, email, or name..."
              className="pl-12 h-12 bg-white/5 border-white/10 focus:bg-white/10 rounded-xl text-base font-medium placeholder:text-muted-foreground/50"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                  Username
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                  Full Name
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="px-8 py-4">
                      <Skeleton className="h-5 w-24 bg-white/10" />
                    </TableCell>
                    <TableCell className="px-8 py-4">
                      <Skeleton className="h-5 w-32 bg-white/10" />
                    </TableCell>
                    <TableCell className="px-8 py-4">
                      <Skeleton className="h-5 w-20 bg-white/10" />
                    </TableCell>
                    <TableCell className="px-8 py-4">
                      <Skeleton className="h-6 w-16 bg-white/10" />
                    </TableCell>
                    <TableCell className="px-8 py-4">
                      <Skeleton className="h-6 w-12 bg-white/10" />
                    </TableCell>
                    <TableCell className="px-8 py-4">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                        <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-96">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="font-black uppercase tracking-[0.2em] text-sm text-muted-foreground">
                        No users found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, idx) => (
                  <TableRow
                    key={user.id}
                    className="border-white/5 hover:bg-white/10 transition-colors animate-entrance group"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <TableCell className="px-8 py-5">
                      <span className="font-bold text-foreground">{user.username}</span>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="px-8 py-5 text-muted-foreground">
                      {user.full_name || '-'}
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold tracking-wider uppercase ${getRoleBadgeColor(user.role)}`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <Badge
                        variant={user.is_active ? 'default' : 'secondary'}
                        className={
                          user.is_active
                            ? 'bg-green-500/20 text-green-500 border-green-500/30'
                            : 'bg-red-500/20 text-red-500 border-red-500/30'
                        }
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          className="h-10 w-10 rounded-lg hover:bg-white/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="h-10 w-10 rounded-lg hover:bg-red-500/20 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-white/10 bg-white/5 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground">
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={editingUser !== undefined}
                        className="bg-white/5 border-white/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="bg-white/5 border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password {editingUser && <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                        className="bg-white/5 border-white/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white/5 border-white/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
