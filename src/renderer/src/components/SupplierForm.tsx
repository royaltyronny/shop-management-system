import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Supplier } from '../../../shared/types'

const supplierSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  address: z.string().optional()
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

interface SupplierFormProps {
  initialValues?: Partial<Supplier>
  onSubmit: (values: SupplierFormValues) => void
  onCancel: () => void
}

export function SupplierForm({ initialValues, onSubmit, onCancel }: SupplierFormProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: initialValues?.name || '',
      contact_person: initialValues?.contact_person || '',
      phone: initialValues?.phone || '',
      email: initialValues?.email || '',
      address: initialValues?.address || ''
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Vendor Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter vendor name"
                    {...field}
                    className="h-14 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Contact Person
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Name of contact"
                    {...field}
                    className="h-14 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="+255..."
                    {...field}
                    className="h-14 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
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
                <FormLabel className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="vendor@example.com"
                    {...field}
                    className="h-14 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Full Address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Street, City, State"
                  {...field}
                  className="h-14 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="h-14 px-8 rounded-2xl font-bold hover:bg-white/10 active:scale-95 transition-all"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-14 px-10 rounded-2xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary"
          >
            {initialValues ? 'Save Changes' : 'Register Vendor'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
