import React, { useEffect, useState } from "react";
import { Edit, Trash, Plus, X } from "lucide-react";
import { supabase } from "./supabase";

export default function AdminExaminations() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    pattern: "",
    fees: "",
    syllabus: "",
    difficulty: "",
    tags: "",
  };

  const [form, setForm] = useState(emptyForm);

  /* ---------------- FETCH ---------------- */
  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("examinations")
      .select("*")
      .order("id");

    if (!error) setExams(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()),
    };

    if (editingId) {
      await supabase.from("examinations").update(payload).eq("id", editingId);
    } else {
      await supabase.from("examinations").insert([payload]);
    }

    resetForm();
    fetchExams();
  };

  const handleEdit = (exam) => {
    setForm({
      ...exam,
      tags: exam.tags?.join(", ") || "",
    });
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this examination?")) {
      await supabase.from("examinations").delete().eq("id", id);
      fetchExams();
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

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Examinations Admin
            </h1>
            <p className="text-slate-500">
              Manage competitive & entrance examinations
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white
                         px-5 py-2.5 rounded-xl shadow hover:bg-indigo-700"
            >
              <Plus size={18} />
              Add Exam
            </button>
          )}
        </div>

        {/* FORM (ABOVE TABLE) */}
        {/* FORM (ABOVE TABLE) */}
{showForm && (
  <div className="bg-white rounded-2xl shadow p-6 space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">
        {editingId ? "Edit Examination" : "Add Examination"}
      </h2>
      <button onClick={resetForm}>
        <X />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Exam Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: JEE Main"
        />
      </div>

      {/* Fees */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Fees (₹)</label>
        <input
          type="number"
          name="fees"
          value={form.fees}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: 1000"
        />
      </div>

      {/* Difficulty */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Difficulty</label>
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="border rounded-lg p-2"
        >
          <option value="">Select difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Tags</label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Engineering, Medical, Govt"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="border rounded-lg p-2"
          placeholder="Brief overview of the examination"
        />
      </div>

      {/* Pattern */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-sm font-medium">Exam Pattern</label>
        <textarea
          name="pattern"
          value={form.pattern}
          onChange={handleChange}
          rows={3}
          className="border rounded-lg p-2"
          placeholder="MCQ, duration, marking scheme"
        />
      </div>

      {/* Syllabus */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-sm font-medium">Syllabus</label>
        <textarea
          name="syllabus"
          value={form.syllabus}
          onChange={handleChange}
          rows={4}
          className="border rounded-lg p-2"
          placeholder="Physics, Chemistry, Maths..."
        />
      </div>
    </div>

    <div className="flex justify-end gap-3">
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
)}


        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Pattern</th>
                    <th className="px-4 py-3">Fees</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((e) => (
                    <tr
                      key={e.id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium">{e.name}</td>
                      <td className="px-4 py-3">{e.pattern}</td>
                      <td className="px-4 py-3">{e.fees}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium
                          ${
                            e.difficulty === "Hard"
                              ? "bg-red-100 text-red-700"
                              : e.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {e.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {e.tags?.join(", ")}
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(e)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
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
    </div>
  );
}
