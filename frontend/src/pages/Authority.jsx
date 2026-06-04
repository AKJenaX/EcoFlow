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
    } catch (err) {
      setError("Failed to load authorities. Please check the API connection.");
      setAuthorities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
    } catch (err) {
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
    setEditingId(auth._id || auth.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this authority?")) return;
    try {
      await deleteAuthority(id);
      fetchData();
    } catch (err) {
      setError("Failed to delete. Please try again.");
    }
  };

  return (
    <section className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">Management</p>
          <h1 className="mt-1 text-3xl font-bold text-[#1a3a2a]">Authority Officers</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 rounded-lg bg-[#84cc16] px-4 py-2 font-medium text-[#1a3a2a] shadow-md transition-all hover:shadow-lg"
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
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900">{editingId ? "Edit Authority" : "Add New Authority"}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text" required value={form.Name}
                onChange={(e) => setForm({ ...form, Name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <input
                type="text" required value={form.Designation}
                onChange={(e) => setForm({ ...form, Designation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Control Room</label>
              <input
                type="text" required value={form.Control_Room}
                onChange={(e) => setForm({ ...form, Control_Room: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Works Under</label>
              <input
                type="text" required value={form.Works_Under}
                onChange={(e) => setForm({ ...form, Works_Under: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-[#84cc16] px-4 py-2 text-sm font-semibold text-[#1a3a2a] shadow-md hover:shadow-lg">
              {editingId ? "Update" : "Add"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Control Room</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Works Under</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {authorities.length > 0 ? authorities.map((auth) => (
                  <tr key={auth._id || auth.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{auth.Name}</td>
                    <td className="px-6 py-4 text-slate-700">{auth.Designation}</td>
                    <td className="px-6 py-4 text-slate-700">{auth.Control_Room}</td>
                    <td className="px-6 py-4 text-slate-700">{auth.Works_Under}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(auth)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(auth._id || auth.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
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

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold">{authorities.length}</span> authority officers
        </p>
      </div>
    </section>
  );
}
