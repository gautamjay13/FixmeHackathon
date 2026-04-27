import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowLeft, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { useJobs } from "../hooks/useJobs";
import { useStats } from "../hooks/useStats";

export default function Earnings() {
  const navigate = useNavigate();
  const { jobs, loading } = useJobs(true);
  const { stats, loading: statsLoading } = useStats();

  const completedJobs = jobs.completed;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Earnings History
          </h1>
        </div>

        {/* Summary card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">This Week</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {statsLoading ? "…" : `₹${stats.totalEarnings.toLocaleString("en-IN")}`}
              </p>
            </div>
          </div>
        </Card>

        {/* Job-level breakdown */}
        <div className="space-y-3">
          {loading && <p className="text-zinc-500 text-center py-8">Loading earnings…</p>}
          {!loading && completedJobs.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-zinc-500">No completed jobs yet this week.</p>
            </Card>
          )}
          {completedJobs.map((job) => (
            <motion.div key={job._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{job.serviceType}</p>
                  <p className="text-xs text-zinc-500">{job.customerName} · {job.address}</p>
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  +₹{job.price.toLocaleString("en-IN")}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
