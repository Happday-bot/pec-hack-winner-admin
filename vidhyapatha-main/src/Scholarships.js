import React, { useEffect, useState } from "react";
import { Edit, Trash, Plus, X } from "lucide-react";
import { supabase } from "./supabase";

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    provider: "",
    type: "",
    region: "",
    education_level: "",
    gender: "",
    category: "",
    income_limit: "",
    amount_benefit: "",
    deadline: "",
    link: "",
    description: "",
    eligibility_details: "",
    documents_needed: "",
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- Fetch ---------------- */
  const fetchScholarships = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scholarships")
      .select("*")
      .order("id");

    if (!error) setScholarships(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  /* ---------------- Handlers ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      education_level: form.education_level.split(",").map((i) => i.trim()),
      category: form.category.split(",").map((i) => i.trim()),
      documents_needed: form.documents_needed.split(",").map((i) => i.trim()),
    };

    if (editingId) {
      await supabase.from("scholarships").update(payload).eq("id", editingId);
    } else {
      await supabase.from("scholarships").insert([payload]);
    }

    resetForm();
    fetchScholarships();
  };

  const handleEdit = (s) => {
    setForm({
      ...s,
      education_level: s.education_level?.join(", ") || "",
      category: s.category?.join(", ") || "",
      documents_needed: s.documents_needed?.join(", ") || "",
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this scholarship?")) {
      await supabase.from("scholarships").delete().eq("id", id);
      fetchScholarships();
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Scholarships Admin
            </h1>
            <p className="text-slate-500">
              Manage all available scholarship opportunities
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 
                       text-white px-5 py-2.5 rounded-xl
                       shadow hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Scholarship
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700 sticky top-0">
                  <tr>
                    {[
                      "Name",
                      "Provider",
                      "Type",
                      "Region",
                      "Amount",
                      "Deadline",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scholarships.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {s.name}
                      </td>
                      <td className="px-4 py-3">{s.provider}</td>
                      <td className="px-4 py-3">{s.type}</td>
                      <td className="px-4 py-3">{s.region}</td>
                      <td className="px-4 py-3">
                        ₹ {s.amount_benefit}
                      </td>
                      <td className="px-4 py-3">{s.deadline}</td>
                      <td className="px-4 py-3 flex gap-3">
                        <button
                          onClick={() => handleEdit(s)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Scholarship" : "Add Scholarship"}
              </h2>
              <button onClick={resetForm}>
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(form).map((key) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    {key.replace(/_/g, " ")}
                  </label>

                  {key.includes("description") ||
                  key.includes("eligibility") ? (
                    <textarea
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      rows={3}
                      className="border rounded-lg p-2"
                    />
                  ) : (
                    <input
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      className="border rounded-lg p-2"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
