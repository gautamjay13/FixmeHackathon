import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Clock, Wrench, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer select-none focus:outline-none focus-visible:ring-2 p-0 rounded-full"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-medium leading-none text-zinc-900 dark:text-white mb-1">
              {user.name}
            </p>
            <p className="text-xs leading-none text-zinc-500 truncate">
              {user.email}
            </p>
          </div>
          
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/bookings");
              }}
              className="flex w-full items-center px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
            >
              <Clock className="mr-2 h-4 w-4" />
              My Bookings
            </button>
            
            {user.role !== "customer" && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/provider-dashboard");
                }}
                className="flex w-full items-center px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
              >
                <Wrench className="mr-2 h-4 w-4" />
                Provider Dashboard
              </button>
            )}
          </div>
          
          <div className="border-t border-zinc-200 dark:border-zinc-800 p-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
