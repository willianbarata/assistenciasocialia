'use client'

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { AppSidebar } from "./app-sidebar"

export function AppHeader() {
    return (
        <header className="h-16 border-b bg-white dark:bg-zinc-900 flex items-center px-4 md:px-6 justify-between md:justify-end">
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r w-64">
                        <AppSidebar className="flex border-none w-full h-full" />
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex items-center gap-4">
                {/* User Info or other header items */}
                <span className="text-sm font-medium text-muted-foreground">Sistema Social</span>
            </div>
        </header>
    )
}
