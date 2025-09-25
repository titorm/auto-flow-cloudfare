import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Home,
  LineChart,
  LogOut,
  Package2,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const SidebarNav = () => (
  <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
    <TooltipProvider>
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Logo iconOnly />
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Home className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Dashboard</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Zap className="h-5 w-5" />
              <span className="sr-only">Workflows</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Workflows</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Users className="h-5 w-5" />
              <span className="sr-only">Team</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Team</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <LineChart className="h-5 w-5" />
              <span className="sr-only">Analytics</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Analytics</TooltipContent>
        </Tooltip>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  </aside>
);
const UserMenu = () => {
  const { user, logout } = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${user?.email}`} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export function AppLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarNav />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* Mobile Menu can be added here */}
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Search bar can be added here */}
          </div>
          <UserMenu />
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}