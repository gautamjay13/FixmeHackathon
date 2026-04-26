import { useNavigate } from "react-router";
import { Wrench, Clock, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileDropdown } from "./ProfileDropdown";
import { Button } from "./ui/button";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            FixNow
          </h1>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && !isLoading && (
            <Button variant="ghost" size="icon" onClick={() => navigate("/bookings")} title="My Bookings">
              <Clock className="h-5 w-5" />
            </Button>
          )}
          
          <ThemeToggle />
          
          {!isLoading && (
            isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Button onClick={() => navigate("/login")}>
                <User className="h-5 w-5 mr-2" />
                Login
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
