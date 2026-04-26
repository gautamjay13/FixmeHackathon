import { useNavigate } from "react-router";
import { MapPin, Wrench, Zap, Wind, Hammer, Paintbrush, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useApp, Service } from "../context/AppContext";
import { useAuth } from "../hooks/useAuth";
import { motion } from "motion/react";
import { toast } from "sonner";

const services: Service[] = [
  {
    id: "plumber",
    name: "Plumbing",
    icon: "wrench",
    description: "Leaks, pipes, faucets",
  },
  {
    id: "electrician",
    name: "Electrician",
    icon: "zap",
    description: "Wiring, outlets, lights",
  },
  {
    id: "ac-repair",
    name: "AC Repair",
    icon: "wind",
    description: "Installation, maintenance",
  },
  {
    id: "carpenter",
    name: "Carpenter",
    icon: "hammer",
    description: "Furniture, door repair",
  },
  {
    id: "painter",
    name: "Painting",
    icon: "paintbrush",
    description: "Interior, exterior",
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: "sparkles",
    description: "Deep clean, regular",
  },
];

const iconMap = {
  wrench: Wrench,
  zap: Zap,
  wind: Wind,
  hammer: Hammer,
  paintbrush: Paintbrush,
  sparkles: Sparkles,
};

export default function Home() {
  const navigate = useNavigate();
  const { setSelectedService, bookings } = useApp();
  const { isAuthenticated } = useAuth();

  const handleServiceSelect = (service: Service) => {
    if (!isAuthenticated) {
      toast.error("Please login to book a service");
      navigate("/login");
      return;
    }
    setSelectedService(service);
    navigate("/describe-problem");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-950 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span>Available in your area</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">
              On-Demand Home Services
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-2">
              Find trusted professionals instantly. No delays, no hassle.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              {bookings.length > 0 ? `${bookings.length} booking${bookings.length > 1 ? 's' : ''} completed` : 'Start your first booking today'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
          What do you need help with?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 group"
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-xl group-hover:bg-blue-500 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1 text-zinc-900 dark:text-white">
                        {service.name}
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-zinc-50 dark:bg-zinc-900 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold mb-8 text-center text-zinc-900 dark:text-white">
            Why Choose FixNow?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Instant Booking", desc: "Get help in minutes" },
              { title: "Trusted Workers", desc: "Verified & rated" },
              { title: "Price Transparency", desc: "Know costs upfront" },
              { title: "Live Tracking", desc: "Track your worker" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="text-center"
              >
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm">
                  <h4 className="font-semibold mb-2 text-zinc-900 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Become a Provider CTA */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-3">
                      Become a Service Provider
                    </h3>
                    <p className="text-blue-100 mb-4 max-w-xl">
                      Join our network of trusted professionals. Set your own hours, grow your business, and earn more.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Flexible Schedule</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Weekly Payouts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>No Commission</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-zinc-100 font-semibold px-8"
                    onClick={() => navigate("/login")}
                  >
                    Join Now
                  </Button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Wrench className="w-64 h-64" />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}