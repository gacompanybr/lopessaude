import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { LogOut, Moon, Sun, Settings, Cog } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  const displayName =
    (user?.user_metadata?.display_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email?.split("@")[0] ||
    "Usuário";
  const avatarUrl = (user?.user_metadata?.avatar_url as string) || undefined;
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors px-2 py-1">
          <Avatar className="h-8 w-8 border-2 border-primary-foreground/30">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-primary-foreground text-primary text-sm font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium pr-2 max-w-[140px] truncate">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate font-normal">
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal flex items-center gap-2">
          <Settings className="w-3.5 h-3.5" /> Configurações
        </DropdownMenuLabel>
        <div
          className="flex items-center justify-between px-2 py-2 rounded-sm hover:bg-accent/40 cursor-pointer"
          onClick={(e) => { e.preventDefault(); toggleTheme(); }}
        >
          <div className="flex items-center gap-2 text-sm">
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>Modo escuro</span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
        <DropdownMenuSeparator />
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Cog className="w-4 h-4 mr-2" /> Configurações
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
