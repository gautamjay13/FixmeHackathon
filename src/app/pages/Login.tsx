import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Wrench, Zap, Wind, Hammer, Paintbrush, Sparkles, User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { UserRole } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ThemeToggle } from "../components/ThemeToggle";

const serviceProviderRoles: { value: UserRole; label: string; icon: any }[] = [
  { value: "plumber", label: "Plumber", icon: Wrench },
  { value: "electrician", label: "Electrician", icon: Zap },
  { value: "ac-repair", label: "AC Repair", icon: Wind },
  { value: "carpenter", label: "Carpenter", icon: Hammer },
  { value: "painter", label: "Painter", icon: Paintbrush },
  { value: "cleaning", label: "Cleaning", icon: Sparkles },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState<"customer" | "provider">("customer");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupRole, setSignupRole] = useState<"customer" | "provider">("customer");
  const [selectedProviderRole, setSelectedProviderRole] = useState<UserRole>("plumber");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const role: UserRole = loginRole === "customer" ? "customer" : selectedProviderRole;
      await login(loginEmail, loginPassword, role);
      toast.success("Login successful!");
      
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from);
      } else if (loginRole === "customer") {
        navigate("/");
      } else {
        navigate("/provider-dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword || !signupPhone) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const role: UserRole = signupRole === "customer" ? "customer" : selectedProviderRole;
      await signup(signupName, signupEmail, signupPassword, signupPhone, role);
      toast.success("Account created successfully!");
      
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from);
      } else if (signupRole === "customer") {
        navigate("/");
      } else {
        navigate("/provider-dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              FixNow
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-zinc-900 dark:text-white">
              Welcome to FixNow
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
              Connect with trusted professionals or grow your business as a service provider.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { label: "10,000+", desc: "Active Users" },
                { label: "5,000+", desc: "Service Providers" },
                { label: "50,000+", desc: "Jobs Completed" },
                { label: "4.8★", desc: "Average Rating" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm"
                >
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stat.label}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {stat.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Auth Forms */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Welcome Back
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Login to continue
                      </p>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <Label className="mb-3 block">I am a</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={loginRole === "customer" ? "default" : "outline"}
                          className="h-12"
                          onClick={() => setLoginRole("customer")}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Customer
                        </Button>
                        <Button
                          type="button"
                          variant={loginRole === "provider" ? "default" : "outline"}
                          className="h-12"
                          onClick={() => setLoginRole("provider")}
                        >
                          <Wrench className="w-4 h-4 mr-2" />
                          Provider
                        </Button>
                      </div>
                    </div>

                    {/* Provider Role Selection */}
                    {loginRole === "provider" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <Label className="mb-3 block">Service Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {serviceProviderRoles.map((role) => {
                            const Icon = role.icon;
                            return (
                              <Button
                                key={role.value}
                                type="button"
                                variant={selectedProviderRole === role.value ? "default" : "outline"}
                                className="h-16 flex flex-col gap-1"
                                onClick={() => setSelectedProviderRole(role.value)}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="text-xs">{role.label}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative mt-2">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Create Account
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Join FixNow today
                      </p>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <Label className="mb-3 block">I am a</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={signupRole === "customer" ? "default" : "outline"}
                          className="h-12"
                          onClick={() => setSignupRole("customer")}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Customer
                        </Button>
                        <Button
                          type="button"
                          variant={signupRole === "provider" ? "default" : "outline"}
                          className="h-12"
                          onClick={() => setSignupRole("provider")}
                        >
                          <Wrench className="w-4 h-4 mr-2" />
                          Provider
                        </Button>
                      </div>
                    </div>

                    {/* Provider Role Selection */}
                    {signupRole === "provider" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <Label className="mb-3 block">Service Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {serviceProviderRoles.map((role) => {
                            const Icon = role.icon;
                            return (
                              <Button
                                key={role.value}
                                type="button"
                                variant={selectedProviderRole === role.value ? "default" : "outline"}
                                className="h-16 flex flex-col gap-1"
                                onClick={() => setSelectedProviderRole(role.value)}
                              >
                                <Icon className="w-4 h-4" />
                                <span className="text-xs">{role.label}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative mt-2">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            className="pl-10"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-phone">Phone Number</Label>
                        <div className="relative mt-2">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="+91 9876543210"
                            className="pl-10"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative mt-2">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
