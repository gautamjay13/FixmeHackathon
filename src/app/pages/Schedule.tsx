import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useJobs } from "../hooks/useJobs";

export default function Schedule() {
  const navigate = useNavigate();
  const { jobs, loading } = useJobs(true);
  const allJobs = [...jobs.active, ...jobs.completed];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Your Schedule
          </h1>
        </div>
        <div className="space-y-4">
          {loading && (
            <p className="text-zinc-500 text-center py-8">Loading schedule…</p>
          )}
          {!loading && allJobs.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-zinc-500">No scheduled jobs yet. Accept a job to see it here.</p>
            </Card>
          )}
          {allJobs.map((job) => (
            <motion.div key={job._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{job.customerName}</p>
                  <p className="text-sm text-zinc-500">{job.serviceType} · {job.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 capitalize">
                    {job.status}
                  </span>
                  <p className="text-xs text-zinc-400 flex items-center justify-end gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {job.scheduledTime}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
