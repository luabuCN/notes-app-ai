"use client"

import { Notebook, Star, ImageUp, Search, Settings, Sparkles , CircleCheckBig } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { usePathname } from 'next/navigation'
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
import { ModeToggle } from './theme-model-toggle'
import { AvatarDrop } from './avatar-drop'
import { LocaleModelToggle } from './locale-model-toggle'
import { cn } from "@/lib/utils"
import { Link } from '@/i18n/navigation'
import { useEffect, useState } from "react"
import { ModelConfigDialog } from "./model-config-dialog"
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
    url: "/ai",
    icon: Sparkles,
    isActive: true,
  },
  {
    title: "笔记",
    url: "/editor",
    icon: Notebook,
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
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [pathWithoutLocale, setPathWithoutLocale] = useState<string>()
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  //去除国际化的路径

  useEffect(() => {
    const path = pathname.replace(/^\/(zh|en)(?=\/|$)/, '');
    setPathWithoutLocale(path)
    console.log(path,'path');
    
  }, [pathname])
  return (
    <Sidebar
      collapsible="none"
      className="md:!w-[calc(var(--sidebar-width)_+_1px)] !w-[calc(var(--sidebar-width-icon)_+_1px)] border-r h-screen"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild >
              <div className="w-full h-full flex justify-center items-center">
                <AvatarDrop />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={pathWithoutLocale?.includes(item.url) ? 'bg-sidebar-accent text-sidebar-accent-foreground ' : ''}
                >
                  <SidebarMenuButton
                    asChild
                    tooltip={{
                      children: item.title,
                      hidden: isMobile ? false : true,
                    }}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>

        <SidebarMenuButton asChild
          tooltip={{
            children: '主题切换',
            hidden: isMobile ? false : true,
          }}
        >
          <a href="#">
            <div className={
              cn(
                "flex w-full ",
                isMobile ? "items-center justify-center" : ""
              )
            }>
              <ModeToggle />
            </div>
          </a>
        </SidebarMenuButton>
        <SidebarMenuButton asChild
          tooltip={{
            children: '语言切换',
            hidden: isMobile ? false : true,
          }}
        >
          <a href="#">
            <div className="flex w-full items-center justify-center">
              <LocaleModelToggle />
            </div>
          </a>
        </SidebarMenuButton>
        <SidebarMenuButton asChild
          tooltip={{
            children: '设置',
            hidden: isMobile ? false : true,
          }}
        >
          <button
            onClick={() => setIsConfigDialogOpen(true)}
            className="flex size-8 items-center w-full justify-center rounded-lg"
          >
            <Settings className="size-4" />
          </button>
        </SidebarMenuButton>
      </SidebarFooter>
      <ModelConfigDialog
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
      />
    </Sidebar>
  )
}