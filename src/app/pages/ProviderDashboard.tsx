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
  Navigation,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { Progress } from "../components/ui/progress";
import { useJobs } from "../hooks/useJobs";
import { useStats } from "../hooks/useStats";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

// ── Skeleton component (replaces spinner per spec) ────────────────────────────
function JobSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
          <div className="flex gap-4">
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-16" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-16 ml-auto" />
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
        </div>
      </div>
    </Card>
  );
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ── Online status ─────────────────────────────────────────────────────────
  const { isOnline, toggling, toggleOnlineStatus } = useOnlineStatus(true);

  // ── Stats (fetched first so we can pass refetch to useJobs) ───────────────
  const { stats, loading: statsLoading, jobProgress, earningsProgress, refetch: refetchStats } = useStats();

  // ── Jobs ──────────────────────────────────────────────────────────────────
  const { jobs, loading: jobsLoading, acceptJob, rejectJob, completeJob } = useJobs(
    isOnline,
    refetchStats // re-fetch stats after any job state change
  );

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!user || user.role === "customer") {
    navigate("/login");
    return null;
  }

  // ── Stats cards (live data) ───────────────────────────────────────────────
  const statCards = [
    {
      label: "Today's Jobs",
      value: statsLoading ? "—" : stats.pendingJobs + stats.acceptedJobs + stats.completedJobs,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Total Earnings",
      value: statsLoading ? "—" : `₹${stats.totalEarnings.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Rating",
      value: user.rating?.toFixed(1) || "5.0",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      label: "Jobs Done",
      value: statsLoading ? "—" : stats.completedJobs,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  // ── Jobs to display (pending + active + completed, excluding rejected) ─────
  const displayJobs = [
    ...jobs.pending,
    ...jobs.active,
    ...jobs.completed,
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => {
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
                  {isOnline ? "You're Online" : "You're Offline"}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {isOnline
                    ? "Ready to accept new jobs"
                    : "Go online to start receiving job requests"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isOnline ? "bg-green-500 animate-pulse" : "bg-zinc-400"
                  }`}
                />
                <Button
                  variant="outline"
                  onClick={toggleOnlineStatus}
                  disabled={toggling}
                >
                  {toggling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {isOnline ? "Go Offline" : "Go Online"}
                </Button>
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
              {/* Loading skeletons */}
              {jobsLoading && displayJobs.length === 0 && (
                <>
                  <JobSkeleton />
                  <JobSkeleton />
                  <JobSkeleton />
                </>
              )}

              {/* Offline — no pending jobs message */}
              {!isOnline && jobs.active.length === 0 && jobs.completed.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    You're offline. Go online to see incoming job requests.
                  </p>
                </Card>
              )}

              {/* Empty state */}
              {!jobsLoading && isOnline && displayJobs.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    No job requests right now. Check back soon!
                  </p>
                </Card>
              )}

              <AnimatePresence>
                {displayJobs.map((job, i) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                              {job.customerName}
                            </h3>
                            <Badge
                              variant={
                                job.status === "completed"
                                  ? "secondary"
                                  : job.status === "accepted"
                                  ? "default"
                                  : "default"
                              }
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
                            {job.serviceType}
                          </p>
                          <p className="text-sm text-zinc-500 flex items-center gap-1 mb-2">
                            <Home className="w-4 h-4" />
                            {job.address}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.scheduledTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Navigation className="w-4 h-4" />
                              {job.distanceKm} km
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            ₹{job.price.toLocaleString("en-IN")}
                          </p>
                          {job.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectJob(job._id)}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => acceptJob(job._id)}
                              >
                                Accept
                              </Button>
                            </div>
                          )}
                          {job.status === "accepted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completeJob(job._id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
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
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Jobs Completed
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {statsLoading ? "…" : `${stats.completedJobs}/${stats.jobTarget}`}
                      </span>
                    </div>
                    <Progress value={statsLoading ? 0 : jobProgress} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Earnings Goal
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {statsLoading
                          ? "…"
                          : `₹${(stats.totalEarnings / 1000).toFixed(1)}k/₹${(
                              stats.earningsTarget / 1000
                            ).toFixed(0)}k`}
                      </span>
                    </div>
                    <Progress value={statsLoading ? 0 : earningsProgress} />
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
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/schedule")}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    View Schedule
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/earnings")}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Earnings History
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/profile")}
                  >
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
