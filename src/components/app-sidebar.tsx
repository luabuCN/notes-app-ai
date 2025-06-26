import {  Notebook, Star, ImageUp, Search, ScanFace, Settings,Sparkles,PencilRuler,CircleCheckBig } from "lucide-react"
 
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
 import { ModeToggle } from './ThemeModelToggle'
// Menu items.
const items = [
  {
    title: "搜索",
    url: "#",
    icon: Search,
  },
  {
    title: "待办清单",
    url: "#",
    icon: CircleCheckBig,
  },
  {
    title: "Ai",
    url: "#",
    icon: Sparkles,
  },
  {
    title: "笔记",
    url: "/editor",
    icon: Notebook,
    isActive: true,
  },
  {
    title: "画板",
    url: "/article",
    icon: PencilRuler,
  },
  {
    title: "收藏",
    url: "#",
    icon: Star,
  },
  {
    title: "资源",
    url: "#",
    icon: ImageUp,
  },
]
 
export function AppSidebar() {
  return (
    <Sidebar 
      collapsible="none"
      className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r h-screen"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ScanFace className="size-5" />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle/>
        <SidebarMenuButton asChild className="md:h-8 md:p-0"
          tooltip={{
            children: '设置',
            hidden: false,
          }}
        >
          <a href="#">
            <div className="flex size-8 items-center justify-center rounded-lg">
              <Settings className="size-4" />
            </div>
          </a>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}