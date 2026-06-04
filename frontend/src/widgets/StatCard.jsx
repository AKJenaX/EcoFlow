export default function StatCard({ icon: Icon, label, value, unit = "", bgColor = "bg-emerald-600" }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[#1a3a2a]">
            {value}
            {unit && <span className="text-lg text-slate-500">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={`${bgColor} rounded-lg p-3`}>
            <Icon className="text-white" size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
