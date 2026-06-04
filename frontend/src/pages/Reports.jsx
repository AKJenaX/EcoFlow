import { useState } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Download } from "lucide-react";
import {
  monthlyCollectionData,
  wasteCategoryData,
  collectionLogs
} from "../data/mockData.js";

const COLORS = ["#84cc16", "#22c55e", "#16a34a", "#15803d"];

export default function Reports() {
  const [startDate, setStartDate] = useState("2024-05-01");
  const [endDate, setEndDate] = useState("2024-06-04");

  const handleExportCSV = () => {
    console.log("Export CSV clicked");
    console.log("Date range:", { startDate, endDate });
    console.log("Collection logs data:", collectionLogs);
  };

  const getStatusColor = (status) => {
    if (status === "Completed") return "text-emerald-700 font-semibold";
    if (status === "In Progress") return "text-blue-700 font-semibold";
    return "text-slate-700";
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      Completed: "bg-emerald-100 text-emerald-800",
      "In Progress": "bg-blue-100 text-blue-800"
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Reports</h1>
      </header>

      {/* Date Range Selector */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Date Range</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Collection Volume */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Monthly Collection Volume
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Total waste collected over 12 months
          </p>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyCollectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#84cc16"
                  fill="#84cc16"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Category Distribution */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Waste Category Distribution
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Breakdown of waste types collected
          </p>
          <div className="mt-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Collection Logs Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Collection Logs
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Detailed collection records
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Date
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Route
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Bins Collected
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Total Weight (kg)
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {collectionLogs.map((log, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">{log.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {log.route}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {log.binsCollected}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {log.totalWeight}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(log.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-slate-600">
          <p>Showing {collectionLogs.length} collection records</p>
        </div>
      </div>
    </div>
  );
}
