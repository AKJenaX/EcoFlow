import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getAuthorities, addAuthority, updateAuthority, deleteAuthority } from "../services/api.js";
import Spinner from "../widgets/Spinner.jsx";

export default function Authority() {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ Name: "", Designation: "", Control_Room: "", Works_Under: "" });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAuthorities();
      setAuthorities(Array.isArray(data) ? data : data.data || []);
    } catch {
      setError("Failed to load authorities. Please check the API connection.");
      setAuthorities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const resetForm = () => {
    setForm({ Name: "", Designation: "", Control_Room: "", Works_Under: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAuthority(editingId, form);
      } else {
        await addAuthority(form);
      }
      resetForm();
      fetchData();
    } catch {
      setError("Failed to save. Please try again.");
    }
  };

  const handleEdit = (auth) => {
    setForm({
      Name: auth.Name || "",
      Designation: auth.Designation || "",
      Control_Room: auth.Control_Room || "",
      Works_Under: auth.Works_Under || "",
    });
    setEditingId(auth.Authority_ID);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this authority?")) return;
    try {
      await deleteAuthority(id);
      fetchData();
    } catch {
      setError("Failed to delete. Please try again.");
    }
  };

  return (
    <section className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Management</p>
          <h1 className="mt-1 text-3xl font-bold text-[#1a3a2a] tracking-tight">Authority Officers</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 rounded-xl bg-[#84cc16] px-4 py-2.5 text-sm font-bold text-[#1a3a2a] shadow-md hover:shadow-lg hover:bg-[#72b012] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 transform"
        >
          <Plus className="h-5 w-5" />
          Add Authority
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 space-y-5">
          <h3 className="font-bold text-slate-900 text-base">{editingId ? "Edit Authority Officer" : "Add New Authority Officer"}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
              <input
                type="text" required value={form.Name}
                onChange={(e) => setForm({ ...form, Name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Designation</label>
              <input
                type="text" required value={form.Designation}
                onChange={(e) => setForm({ ...form, Designation: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Control Room</label>
              <input
                type="text" required value={form.Control_Room}
                onChange={(e) => setForm({ ...form, Control_Room: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Works Under</label>
              <input
                type="text" required value={form.Works_Under}
                onChange={(e) => setForm({ ...form, Works_Under: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="rounded-xl bg-[#84cc16] px-4 py-2.5 text-sm font-bold text-[#1a3a2a] shadow-md hover:bg-[#72b012] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 transform">
              {editingId ? "Update Officer" : "Add Officer"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 rounded-l-lg">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Designation</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Control Room</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Works Under</th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {authorities.length > 0 ? authorities.map((auth) => (
                  <tr key={auth.Authority_ID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{auth.Name}</td>
                    <td className="px-6 py-4 text-slate-700">{auth.Designation}</td>
                    <td className="px-6 py-4 text-slate-700">{auth.Control_Room}</td>
                    <td className="px-6 py-4 text-slate-700">{auth.Works_Under}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(auth)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(auth.Authority_ID)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">
                      No authority officers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
        <p className="text-sm text-slate-600 font-medium">
          Showing <span className="font-semibold text-emerald-850">{authorities.length}</span> authority officers
        </p>
      </div>
    </section>
  );
}
