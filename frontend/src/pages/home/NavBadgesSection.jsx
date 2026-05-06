import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Bell, 
  FileText, 
  BookOpen, 
  Settings, 
  BarChart3, 
  UserCircle, 
  LifeBuoy,
  TrendingUp,
  Star,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const navSections = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    color: "from-blue-500 to-cyan-500",
    items: [
      { name: "Overview", path: "/dashboard" }
    ]
  },
  {
    title: "Customers",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    items: [
      { name: "All Customers", path: "/customers" },
      { name: "Customer Details", path: "/customers/details" }
    ]
  },
  {
    title: "Deals",
    icon: Briefcase,
    color: "from-purple-500 to-pink-500",
    items: [
      { name: "Active Deals", path: "/deals/active", icon: TrendingUp },
      { name: "Won Deals", path: "/deals/won", icon: Star },
      { name: "Lost Deals", path: "/deals/lost", icon: TrendingDown }
    ]
  },
  {
    title: "Reminders",
    icon: Bell,
    color: "from-orange-500 to-red-500",
    items: [
      { name: "Upcoming", path: "/reminders/upcoming", icon: Clock },
      { name: "Overdue", path: "/reminders/overdue", icon: AlertCircle },
      { name: "Completed", path: "/reminders/completed", icon: CheckCircle2 }
    ]
  },
  {
    title: "Notes / Timeline",
    icon: FileText,
    color: "from-indigo-500 to-purple-500",
    items: [
      { name: "Timeline", path: "/timeline" }
    ]
  },
  {
    title: "Bookings",
    icon: Calendar,
    color: "from-cyan-500 to-blue-500",
    items: [
      { name: "Upcoming Bookings", path: "/bookings/upcoming" },
      { name: "Completed Bookings", path: "/bookings/completed" },
      { name: "Booking Calendar", path: "/bookings/calendar" }
    ]
  },
  {
    title: "Services",
    icon: BookOpen,
    color: "from-rose-500 to-pink-500",
    items: [
      { name: "All Services", path: "/services" },
      { name: "Create Service", path: "/services/create" },
      { name: "Availability / Slots", path: "/services/availability" }
    ]
  },
  {
    title: "Organization",
    icon: Settings,
    color: "from-slate-500 to-gray-500",
    items: [
      { name: "General Settings", path: "/organization/settings" },
      { name: "Members", path: "/organization/members" },
      { name: "Invitations", path: "/organization/invitations" },
      { name: "Integrations", path: "/organization/integrations" },
      { name: "Billing / Subscription", path: "/organization/billing" }
    ]
  },
  {
    title: "Analytics",
    icon: BarChart3,
    color: "from-violet-500 to-purple-500",
    items: [
      { name: "CRM Stats", path: "/analytics/crm" },
      { name: "Booking Stats", path: "/analytics/bookings" },
      { name: "Conversion Stats", path: "/analytics/conversion" }
    ]
  },
  {
    title: "Profile / Preferences",
    icon: UserCircle,
    color: "from-teal-500 to-emerald-500",
    items: [
      { name: "Account Settings", path: "/profile/account" },
      { name: "Theme Preferences", path: "/profile/theme" },
      { name: "Notifications", path: "/profile/notifications" }
    ]
  },
  {
    title: "Help / Support",
    icon: LifeBuoy,
    color: "from-blue-500 to-indigo-500",
    items: [
      { name: "Support Center", path: "/support" }
    ]
  }
];

export const NavBadgesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Complete Navigation System</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need in One Place
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore all the features and tools available in MySaaS to manage your business effectively
          </p>
        </motion.div>

        {/* Navigation Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {navSections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="relative p-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} bg-opacity-20`}>
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white">{section.title}</h3>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5">
                    {section.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => navigate(item.path)}
                        className="w-full text-left px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center gap-2 group/btn"
                      >
                        {item.icon && <item.icon className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 transition-opacity" />}
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
            <span className="text-gray-300">Ready to explore?</span>
            <button
              onClick={() => navigate("/register")}
              className="text-white font-semibold hover:underline flex items-center gap-1"
            >
              Start your free trial
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};