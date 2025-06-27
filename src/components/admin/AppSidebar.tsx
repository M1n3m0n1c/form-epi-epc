import { Label } from '@/components/ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart3, FileText, Link2, Moon, Sun } from "lucide-react";

// Menu items
const menuItems = [
  {
    id: 'dashboard',
    title: "Dashboard",
    url: "#",
    icon: BarChart3,
  },
  {
    id: 'forms',
    title: "Formulários",
    url: "#",
    icon: FileText,
  },
  {
    id: 'generator',
    title: "Gerar Link",
    url: "#",
    icon: Link2,
  },
]

interface AppSidebarProps {
  activePage?: string;
  onPageChange?: (page: string) => void;
}

export function AppSidebar({ activePage = 'dashboard', onPageChange }: AppSidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/app-logo.png"
            alt="Logo do Sistema"
            className="h-8 w-auto"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">SISFEE</span>
            <span className="text-xs text-gray-200">Sistema EPI/EPC</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activePage === item.id}
                    onClick={() => onPageChange?.(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-4">
        <div className="flex items-center justify-center space-x-3 bg-sidebar-accent/10 rounded-lg p-2">
          <Sun className={`h-4 w-4 transition-colors ${theme === 'light' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          <div className="flex flex-col items-center space-y-1">
            <Label htmlFor="theme-switch" className="text-xs font-medium text-center">
              {theme === 'light' ? 'Tema Claro' : 'Tema TLF'}
            </Label>
            <Switch
              id="theme-switch"
              checked={theme === 'telefonica'}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <Moon className={`h-4 w-4 transition-colors ${theme === 'telefonica' ? 'text-purple-500' : 'text-muted-foreground'}`} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
