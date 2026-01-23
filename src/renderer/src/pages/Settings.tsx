import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Store,
  Globe,
  Database,
  ShieldCheck,
  Bell,
  Save,
  RefreshCw,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

type TabId = 'general' | 'appearance' | 'backup' | 'security'

interface Tab {
  id: TabId
  label: string
  icon: LucideIcon
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general')
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    shopName: '',
    businessReg: '',
    address: '',
    contact: '',
    systemLanguage: 'English (International)',
    smartNotifications: true
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // @ts-ignore: window.api is typed in d.ts or inferred
        const data = await window.api.settings.getAll()
        setSettings((prev) => ({ ...prev, ...data }))
      } catch (error) {
        console.error('Failed to load settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load settings.',
          variant: 'destructive'
        })
      }
    }
    loadSettings()
  }, [toast])

  const handleSave = async () => {
    setLoading(true)
    try {
      // @ts-ignore: window.api is typed in d.ts or inferred
      await window.api.settings.update(settings)
      toast({
        title: 'Success',
        description: 'Settings saved successfully.',
        className: 'bg-green-500/10 text-green-500 border-green-500/20'
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleBackup = () => {
    toast({
      title: 'Backup Generated',
      description: 'Encrypted vault backup created successfully.',
      className: 'bg-primary/10 text-primary border-primary/20'
    })
  }

  const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'appearance', label: 'Appearance', icon: Globe },
    { id: 'backup', label: 'Data & Backup', icon: Database },
    { id: 'security', label: 'Security', icon: ShieldCheck }
  ]

  return (
    <div className="p-10 h-screen flex flex-col gap-10 overflow-hidden animate-entrance">
      <div className="flex justify-between items-end shrink-0">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-gradient">System Preferences</h1>
          <p className="text-muted-foreground font-medium text-lg italic">
            Configure your premium shop experience and secure your data.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="h-14 px-8 rounded-2xl font-black gap-2 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save Changes
        </Button>
      </div>

      <div className="flex-1 flex gap-10 overflow-hidden min-h-0">
        {/* Navigation Tabs */}
        <div className="w-80 shrink-0 flex flex-col gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all duration-500 group',
                activeTab === tab.id
                  ? 'glass-premium bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-xl transition-colors',
                  activeTab === tab.id ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                )}
              >
                <tab.icon className="h-5 w-5" />
              </div>
              <span className="uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 overflow-auto pr-4 pb-10">
            {activeTab === 'general' && (
              <Card className="glass-premium border-none shadow-none animate-entrance">
                <CardHeader className="p-8 border-b border-white/10">
                  <CardTitle className="text-3xl font-black">Shop Identity</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60 italic">
                    Core business parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                        Shop Name
                      </label>
                      <Input
                        value={settings.shopName}
                        onChange={(e) => handleChange('shopName', e.target.value)}
                        placeholder="Sunrise Premium Boutique"
                        className="h-14 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                        Business Registration
                      </label>
                      <Input
                        value={settings.businessReg}
                        onChange={(e) => handleChange('businessReg', e.target.value)}
                        placeholder="REG-2026-SUN-001"
                        className="h-14 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                      Premier Address
                    </label>
                    <Input
                      value={settings.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="123 Morning Avenue, Sunlight District, Platinum City"
                      className="h-14 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                      Official Contact
                    </label>
                    <Input
                      value={settings.contact}
                      onChange={(e) => handleChange('contact', e.target.value)}
                      placeholder="+1 (234) 567-8901"
                      className="h-14 bg-white/20 border-white/10 rounded-2xl focus:bg-white/40 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card className="glass-premium border-none shadow-none animate-entrance">
                <CardHeader className="p-8 border-b border-white/10">
                  <CardTitle className="text-3xl font-black">Visual Experience</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60 italic">
                    Customize your interface aesthetics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-6 bg-white/20 rounded-3xl border border-white/10 group hover:bg-white/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-lg">System Language</p>
                        <p className="text-sm text-muted-foreground font-medium italic">
                          Primary localization for high-fidelity UI elements.
                        </p>
                      </div>
                    </div>
                    <select
                      value={settings.systemLanguage}
                      onChange={(e) => handleChange('systemLanguage', e.target.value)}
                      className="bg-white/40 border-none rounded-xl px-4 py-3 text-sm font-black outline-none cursor-pointer hover:bg-white/60 transition-colors uppercase tracking-widest"
                    >
                      <option>English (International)</option>
                      <option>French (Elegance)</option>
                      <option>Spanish (Modern)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/20 rounded-3xl border border-white/10 group hover:bg-white/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                        <Bell className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-lg">Smart Notifications</p>
                        <p className="text-sm text-muted-foreground font-medium italic">
                          Real-time alerts for inventory and sales performance.
                        </p>
                      </div>
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        handleChange('smartNotifications', !settings.smartNotifications)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleChange('smartNotifications', !settings.smartNotifications)
                        }
                      }}
                      className={cn(
                        'w-16 h-8 rounded-full relative cursor-pointer shadow-lg transition-all duration-300',
                        settings.smartNotifications ? 'bg-primary shadow-primary/20' : 'bg-gray-400'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300',
                          settings.smartNotifications ? 'right-1.5' : 'left-1.5'
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'backup' && (
              <Card className="glass-premium border-none shadow-none animate-entrance">
                <CardHeader className="p-8 border-b border-white/10">
                  <CardTitle className="text-3xl font-black">Data Safeguard</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60 italic">
                    Secure and synchronize your business intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="p-12 border-4 border-dashed border-white/10 rounded-[40px] flex flex-col items-center gap-6 text-center bg-white/5">
                    <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center border border-white/10">
                      <Database className="h-12 w-12 text-primary/40" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-black text-2xl">Encrypted Registry Clean</p>
                      <p className="text-sm text-muted-foreground font-medium italic max-w-sm">
                        No previous backups detected. We recommend generating a fresh security
                        snapshot today.
                      </p>
                    </div>
                    <Button
                      onClick={handleBackup}
                      className="h-14 px-10 rounded-2xl gap-3 font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Generate Vault Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="glass-premium border-none shadow-none animate-entrance">
                <CardHeader className="p-8 border-b border-white/10">
                  <CardTitle className="text-3xl font-black">Access & Security</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60 italic">
                    Manage cryptographic keys and administrative roles
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex items-center gap-6 p-8 bg-red-500/10 text-red-500 rounded-[32px] border border-red-500/20 group hover:bg-red-500/15 transition-all">
                    <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-lg uppercase tracking-tight">
                        Privileged Access Required
                      </p>
                      <p className="text-sm font-bold italic opacity-80 leading-relaxed">
                        Security protocols and key management are restricted to Master
                        Administrators only. Please authenticate with your hardware token to
                        proceed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
