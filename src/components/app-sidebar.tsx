import { Heart, Notebook, Star, ImageUp, Search, Recycle, History, Network, ScanFace, Settings } from "lucide-react"
 
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
 
// Menu items.
const items = [
  {
    title: "笔记",
    url: "/editor",
    icon: Heart,
    isActive: true,
  },
  {
    title: "文章",
    url: "/article",
    icon: Notebook,
  },
  {
    title: "收藏",
    url: "#",
    icon: Star,
  },
  {
    title: "图床",
    url: "#",
    icon: ImageUp,
  },
  {
    title: "搜索",
    url: "#",
    icon: Search,
  },
  {
    title: "回收站",
    url: "#",
    icon: Recycle,
  },
  {
    title: "历史",
    url: "#",
    icon: History,
  },
  {
    title: "平台",
    url: "#",
    icon: Network,
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