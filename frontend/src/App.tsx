import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  Building2,
  Search,
  Plus,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Applications", icon: BriefcaseBusiness },
  { label: "Companies", icon: Building2 },
  { label: "Documents", icon: FileText },
  { label: "Calendar", icon: CalendarDays },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const metrics = [
  { label: "Applications", value: "126", helper: "+8 this week" },
  { label: "Interviews", value: "18", helper: "2 upcoming" },
  { label: "Offers", value: "3", helper: "1 pending" },
  { label: "Response Rate", value: "14.2%", helper: "+2.1% from last month" },
];

const focusItems = [
  "Finish Cisco online assessment",
  "Tailor resume for Adobe Frontend role",
  "Follow up with Microsoft recruiter",
];

const recentApplications = [
  {
    company: "Cisco",
    role: "Software Engineer II",
    status: "Applied",
    updated: "Yesterday",
  },
  {
    company: "Adobe",
    role: "Frontend Engineer",
    status: "Draft",
    updated: "Today",
  },
  {
    company: "Apple",
    role: "Software Engineer",
    status: "Interview",
    updated: "2 days ago",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#111827]">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white px-4 py-5">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-semibold tracking-tight">ApplyFlow</h1>
          <p className="mt-1 text-sm text-gray-500">Career workspace</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  item.active
                    ? "bg-gray-100 text-gray-950"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="ml-64 px-8 py-6">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Dashboard</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Good morning, Pushpaja
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              You have 2 interviews this week and 3 applications that need
              follow-up.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
              <Search size={16} />
              Search
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">
                ⌘K
              </span>
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-gray-950 px-3 py-2 text-sm text-white">
              <Plus size={16} />
              Add application
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium">Today's focus</h3>
            <span className="text-xs text-gray-400">3 tasks</span>
          </div>

          <div className="space-y-3">
            {focusItems.map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <input type="checkbox" className="h-4 w-4 rounded" />
                {item}
              </label>
            ))}
          </div>
        </section>

        <section className="mb-6 grid grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-gray-400">{metric.helper}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-3 gap-6">
          <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">Recent applications</h3>
              <button className="text-sm text-gray-500 hover:text-gray-900">
                View all
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {recentApplications.map((app) => (
                <div
                  key={app.company}
                  className="grid grid-cols-4 items-center py-4 text-sm"
                >
                  <div>
                    <p className="font-medium">{app.company}</p>
                    <p className="text-gray-500">{app.role}</p>
                  </div>

                  <div className="text-gray-500">{app.status}</div>
                  <div className="text-gray-500">{app.updated}</div>

                  <div className="text-right">
                    <button className="text-gray-500 hover:text-gray-900">
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-medium">Recent activity</h3>

            <div className="space-y-5 text-sm">
              <div>
                <p className="text-gray-900">Applied to Cisco</p>
                <p className="text-xs text-gray-400">Yesterday</p>
              </div>

              <div>
                <p className="text-gray-900">Updated frontend resume</p>
                <p className="text-xs text-gray-400">2 days ago</p>
              </div>

              <div>
                <p className="text-gray-900">Completed Apple interview prep</p>
                <p className="text-xs text-gray-400">3 days ago</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;