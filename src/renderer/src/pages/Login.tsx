import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Lock, LogIn } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginPageProps {
  onLoginSuccess: (token: string) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await window.api.auth.login(data.username, data.password)
      localStorage.setItem('authToken', result.token)
      localStorage.setItem('currentUser', JSON.stringify(result.user))
      onLoginSuccess(result.token)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed')
      form.reset({ username: data.username, password: '' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="relative w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-foreground">
            Sunrise Shop
          </CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your username"
                        disabled={isLoading}
                        className="h-11 bg-white/10 border-white/20 focus:bg-white/20 text-foreground placeholder:text-muted-foreground/50"
                        autoFocus
                      />
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
                    <FormLabel className="text-foreground font-semibold">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                        disabled={isLoading}
                        className="h-11 bg-white/10 border-white/20 focus:bg-white/20 text-foreground placeholder:text-muted-foreground/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 font-bold text-base gap-2 rounded-lg"
              >
                <LogIn className="h-4 w-4" />
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Form>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground text-center">
              Default credentials: username: <span className="font-mono font-semibold">admin</span> | password:{' '}
              <span className="font-mono font-semibold">admin123</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
