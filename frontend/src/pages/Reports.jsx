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

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const triggerDownload = async (endpoint, filename) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  };

  const handleExportCSV = () =>
    triggerDownload(`/analytics/export/csv?range=all`, `ecoflow-analytics.csv`);

  const handleExportPDF = () =>
    triggerDownload(`/analytics/export/pdf?range=all`, `ecoflow-analytics.pdf`);

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
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Reports</h1>
      </header>

      {/* Date Range Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <h2 className="text-lg font-bold text-slate-900">Date Range</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-semibold text-slate-700">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-slate-700">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Collection Volume */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-bold text-slate-900">
            Monthly Collection Volume
          </h2>
          <p className="mt-1 text-sm text-slate-650 font-medium">
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
                    borderRadius: "0.75rem"
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
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-bold text-slate-900">
            Waste Category Distribution
          </h2>
          <p className="mt-1 text-sm text-slate-650 font-medium">
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
                    borderRadius: "0.75rem"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 24-Hour Predictive Waste Accumulation Flow */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <h2 className="text-lg font-bold text-slate-900">
          24-Hour Waste Accumulation Forecast
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Historical sensor data transitioned into linear accumulation prediction model
        </p>
        
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { time: "10:00", fill: 42, predicted: 42 },
              { time: "12:00", fill: 46, predicted: 46 },
              { time: "14:00", fill: 55, predicted: 55 },
              { time: "16:00", fill: 62, predicted: 62 },
              { time: "18:00", fill: 68, predicted: 68 },
              { time: "20:00", fill: 71, predicted: 71 },
              { time: "22:00", fill: null, predicted: 75 },
              { time: "00:00 (F)", fill: null, predicted: 80 },
              { time: "02:00 (F)", fill: null, predicted: 84 },
              { time: "04:00 (F)", fill: null, predicted: 88 },
              { time: "06:00 (F)", fill: null, predicted: 92 },
              { time: "08:00 (F)", fill: null, predicted: 96 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: 'Average Fill level (%)', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b', style: { fontWeight: 'bold' } }} />
              <Tooltip contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.75rem" }} />
              <Legend />
              <Area type="monotone" name="Actual Fill Level" dataKey="fill" stroke="#1a3a2a" strokeWidth={3} fill="#1a3a2a" fillOpacity={0.15} />
              <Area type="monotone" strokeDasharray="5 5" name="Forecasted Fill Trajectory" dataKey="predicted" stroke="#84cc16" strokeWidth={2} fill="#84cc16" fillOpacity={0.05} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collection Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Collection Logs
            </h2>
            <p className="mt-1 text-sm text-slate-650 font-medium">
              Detailed collection records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              id="export-csv-btn"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 transform focus:outline-none focus:ring-4 focus:ring-emerald-200/50 shadow-sm"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              id="export-pdf-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 transform focus:outline-none focus:ring-4 focus:ring-emerald-200/50 shadow-sm"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-3.5 font-semibold text-slate-700 rounded-l-lg">
                  Date
                </th>
                <th className="px-4 py-3.5 font-semibold text-slate-700">
                  Route
                </th>
                <th className="px-4 py-3.5 font-semibold text-slate-700">
                  Bins Collected
                </th>
                <th className="px-4 py-3.5 font-semibold text-slate-700">
                  Total Weight (kg)
                </th>
                <th className="px-4 py-3.5 font-semibold text-slate-700 rounded-r-lg">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {collectionLogs.map((log, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 font-semibold">{log.date}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {log.route}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {log.binsCollected}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">
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

        <div className="mt-4 text-xs text-slate-600 font-medium">
          <p>Showing {collectionLogs.length} collection records</p>
        </div>
      </div>
    </div>
  );
}
