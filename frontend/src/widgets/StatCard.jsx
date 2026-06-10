export default function StatCard({ icon: Icon, label, value, unit = "", bgColor = "bg-emerald-600" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 transform cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase text-[10px]">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-[#1a3a2a]">
            {value}
            {unit && <span className="text-lg text-slate-500">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={`${bgColor} rounded-xl p-3 shadow-inner`}>
            <Icon className="text-white" size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
