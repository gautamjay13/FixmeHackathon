import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { 
  Home, 
  Clock, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Settings,
  CheckCircle2,
  AlertCircle,
  Navigation
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { Progress } from "../components/ui/progress";

const mockJobs = [
  {
    id: "1",
    customer: "Priya Sharma",
    service: "Emergency Leak Repair",
    address: "123 MG Road, Bangalore",
    time: "2:30 PM Today",
    amount: "₹650",
    status: "pending",
    distance: "1.2 km",
  },
  {
    id: "2",
    customer: "Rahul Verma",
    service: "AC Installation",
    address: "456 Park Street, Mumbai",
    time: "4:00 PM Today",
    amount: "₹1,200",
    status: "pending",
    distance: "2.5 km",
  },
  {
    id: "3",
    customer: "Anita Desai",
    service: "Electrical Repair",
    address: "789 Lake View, Delhi",
    time: "Completed",
    amount: "₹450",
    status: "completed",
    distance: "3.1 km",
  },
];

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user || user.role === "customer") {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const stats = [
    { label: "Today's Jobs", value: "5", icon: Clock, color: "text-blue-600" },
    { label: "Total Earnings", value: "₹3,450", icon: DollarSign, color: "text-green-600" },
    { label: "Rating", value: user.rating?.toFixed(1) || "5.0", icon: Star, color: "text-yellow-600" },
    { label: "Jobs Done", value: user.completedJobs?.toString() || "0", icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {stat.label}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Availability Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-1">
                  You're Online
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Ready to accept new jobs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <Button variant="outline">Go Offline</Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Job Requests */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Job Requests
              </h2>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="space-y-4">
              {mockJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            {job.customer}
                          </h3>
                          <Badge
                            variant={job.status === "completed" ? "secondary" : "default"}
                          >
                            {job.status === "completed" ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            )}
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          {job.service}
                        </p>
                        <p className="text-sm text-zinc-500 flex items-center gap-1 mb-2">
                          <Home className="w-4 h-4" />
                          {job.address}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation className="w-4 h-4" />
                            {job.distance}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {job.amount}
                        </p>
                        {job.status === "pending" && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Reject
                            </Button>
                            <Button size="sm">Accept</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Goal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-zinc-900 dark:text-white">
                  Weekly Goal
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-600 dark:text-zinc-400">Jobs Completed</span>
                      <span className="font-medium text-zinc-900 dark:text-white">15/25</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-600 dark:text-zinc-400">Earnings Goal</span>
                      <span className="font-medium text-zinc-900 dark:text-white">₹8.5k/₹15k</span>
                    </div>
                    <Progress value={56.7} />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-zinc-900 dark:text-white">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="w-4 h-4 mr-2" />
                    View Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Earnings History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-900">
                <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-white">
                  💡 Pro Tip
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  Maintain a 4.5+ rating to get priority in job recommendations!
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
