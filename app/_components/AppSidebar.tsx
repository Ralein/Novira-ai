import React from 'react'
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
} from "@/components/ui/sidebar"
import { Calendar, CircleDollarSign, Home, Inbox, Paintbrush, Search, Settings } from "lucide-react"
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const items = [
    {
        title: "Workspace",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Design",
        url: "/designs",
        icon: Paintbrush,
    },
    {
        title: "Credits",
        url: "/credits",
        icon: CircleDollarSign,
    },

]

export function AppSidebar() {
    const path = usePathname();
    return (
        <Sidebar className="bg-black text-gray-100 border-r border-[#1f2937] shadow-2xl">
            <SidebarHeader className="bg-black">
                <div className="p-4 flex justify-center items-center">
                    <Image
                        src={'/logo1.svg'}
                        alt='logo'
                        width={120}
                        height={120}
                        className="transition-transform duration-300"
                    />
                </div>
                
            </SidebarHeader>
            <SidebarContent className="bg-black">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="mt-5 space-y-2 px-2">
                            {items.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.url}
                                    className={`p-3 rounded-lg flex items-center gap-3 transition-all duration-300 border
                                        ${path === item.url 
                                            ? 'bg-[#1f2937] text-[#c084fc] border-[#c084fc] shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                                            : 'text-gray-300 border-transparent hover:bg-[#1f2937] hover:text-[#c084fc] hover:border-[#c084fc]'}
                                    `}
                                >
                                    <item.icon className={`h-5 w-5 ${path === item.url ? 'text-[#c084fc] drop-shadow-[0_0_5px_#a78bfa]' : 'text-[#a78bfa]'}`} />
                                    <span className="font-medium">{item.title}</span>
                                </a>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="bg-black">
                <h2 className="text-sm text-gray-500 px-4 py-2">© Novira</h2>
            </SidebarFooter>
        </Sidebar>
    )
}