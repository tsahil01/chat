import { User } from "better-auth";
import { Popover, PopoverTrigger } from "@workspace/ui/components/popover";
import { SidebarMenuButton } from "@workspace/ui/components/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar";
import { MdCheck, MdLanguage, MdHelp, MdUpgrade, MdSchool, MdLogout } from "react-icons/md";
import { PopoverContent } from "@workspace/ui/components/popover";

export function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <SidebarMenuButton className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.image || ""} />
              <AvatarFallback className="text-xs">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="truncate">{user?.name}</span>
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-1">
            {/* User Email Header */}
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            
            {/* Plan Section */}
            <div className="flex items-center justify-between rounded-md px-2 py-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || ""} />
                  <AvatarFallback className="text-xs">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">Personal</p>
                  <p className="text-xs text-muted-foreground">Pro plan</p>
                </div>
              </div>
              <MdCheck className="h-4 w-4 text-blue-500" />
            </div>
  
            {/* Settings Section */}
            <div className="border-t pt-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Settings</p>
              
              <button
                onClick={() => window.location.href = '/language'}
                className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center space-x-3">
                  <MdLanguage className="h-4 w-4" />
                  <span>Language</span>
                </div>
                <span className="text-xs text-muted-foreground">→</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/help'}
                className="flex w-full items-center space-x-3 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <MdHelp className="h-4 w-4" />
                <span>Get help</span>
              </button>
            </div>
  
            {/* Other Options */}
            <div className="border-t pt-2">
              <button
                onClick={() => window.location.href = '/upgrade'}
                className="flex w-full items-center space-x-3 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <MdUpgrade className="h-4 w-4" />
                <span>Upgrade plan</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/learn'}
                className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center space-x-3">
                  <MdSchool className="h-4 w-4" />
                  <span>Learn more</span>
                </div>
                <span className="text-xs text-muted-foreground">→</span>
              </button>
            </div>
  
            {/* Logout */}
            <div className="border-t pt-2">
              <button
                onClick={onLogout}
                className="flex w-full items-center space-x-3 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <MdLogout className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  
  