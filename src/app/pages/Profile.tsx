import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowLeft, User, Mail, Phone, Briefcase } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Profile Settings
          </h1>
        </div>

        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-zinc-500 capitalize">{user.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">Phone</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.phone || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-500">Role</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
