import React, { useState, useEffect } from "react";
import { BookOpen, TrendingUp } from "lucide-react";
import { supabase } from "./supabase";

const AdminQualificationView = ({ initialQualification }) => {
  const [qualification, setQualification] = useState(initialQualification || "10");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [domainsMap, setDomainsMap] = useState({});
  const [degreesMap, setDegreesMap] = useState({});
  const [search, setSearch] = useState("");


  /* ---------------- FILTERS ---------------- */
  const [demandFilter, setDemandFilter] = useState("");
  const [streamFilter, setStreamFilter] = useState("");
  const [careerFilter, setCareerFilter] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("");

  /* ---------------- FORM STATE ---------------- */
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [streams, setStreams] = useState([]);
  const [careers, setCareers] = useState([""]);
  const [demand, setDemand] = useState("demand");

  const streamOptions = [
    "Science",
    "Engineering",
    "Medical",
    "Applied Science",
    "Teacher Training",
  ];

  const careerOptions = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Data Scientist",
    "Doctor",
    "Nurse",
    "Teacher",
    "Researcher",
  ];

  /* ---------------- FETCH DOMAIN & DEGREE MAPS ---------------- */
  useEffect(() => {
    const fetchMaps = async () => {
      const { data: domains } = await supabase.from("domains").select("id,name");
      const { data: degrees } = await supabase.from("degrees").select("id,name");

      const dMap = {};
      domains?.forEach(d => (dMap[d.id] = d.name));
      setDomainsMap(dMap);

      const degMap = {};
      degrees?.forEach(d => (degMap[d.id] = d.name));
      setDegreesMap(degMap);
    };
    fetchMaps();
  }, []);

  /* ---------------- FETCH COURSES ---------------- */
  const fetchData = async () => {
    setIsLoading(true);
    let q = supabase.from("courses").select("*");

    q =
      qualification === "10"
        ? q.eq("qualification", "10th")
        : q.eq("qualification", "12th");

    const { data } = await q;

    const mapped =
      data?.map(row => ({
        id: row.id,
        title: row.course_title,
        stream: row.domain_id ? domainsMap[row.domain_id] : "N/A",
        streams: row.domain_id ? [domainsMap[row.domain_id]] : [],
        degree: row.degree_id ? degreesMap[row.degree_id] : "N/A",
        careers: row.careers ? row.careers.split(",") : [],
        demand: row.demand ? "demand" : "not in demand",
      })) || [];

    setItems(mapped);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [qualification, domainsMap, degreesMap]);

  /* ---------------- FILTERED DATA ---------------- */
  const filteredData = items.filter(i => {
  if (
    search &&
    !i.title.toLowerCase().includes(search.toLowerCase())
  )
    return false;

  if (qualification === "12" && demandFilter && i.demand !== demandFilter)
    return false;
  if (streamFilter && i.stream !== streamFilter) return false;
  if (degreeFilter && i.degree !== degreeFilter) return false;
  if (careerFilter && !i.careers.includes(careerFilter)) return false;

  return true;
});


  /* ---------------- HELPERS ---------------- */
  const toggleStream = (s) =>
    setStreams(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );

  const addCareerField = () => setCareers(prev => [...prev, ""]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle("");
    setStreams([]);
    setCareers([""]);
    setDemand("demand");
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = () => {
    if (!title.trim()) return;

    if (editingId) {
      setItems(prev =>
        prev.map(i =>
          i.id === editingId
            ? {
                ...i,
                title,
                streams: qualification === "10" ? streams : i.streams,
                stream: qualification === "12" ? streams[0] : i.stream,
                careers: careers.filter(c => c.trim()),
                demand: qualification === "12" ? demand : i.demand,
              }
            : i
        )
      );
    } else {
      setItems(prev => [
        ...prev,
        {
          id: Date.now(),
          title,
          streams: qualification === "10" ? streams : [],
          stream: qualification === "12" ? streams[0] : "",
          careers: careers.filter(c => c.trim()),
          demand: qualification === "12" ? demand : undefined,
        },
      ]);
    }
    resetForm();
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = (id) =>
    setItems(prev => prev.filter(i => i.id !== id));

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          {qualification === "10" ? "10th Subjects" : "12th Courses"}
        </h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Add {qualification === "10" ? "Subject" : "Course"}
        </button>
      </div>

     {/* -------- SEARCH + TOGGLE + FILTER BAR -------- */}
<div className="bg-white p-4 rounded shadow mb-6">
  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">

    {/* SEARCH */}
    <input
      type="text"
      placeholder="🔍 Search subject / course"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border p-2 rounded md:col-span-2"
    />

    {/* 10th / 12th TOGGLE */}
    <div className="flex gap-2">
      {["10", "12"].map(q => (
        <button
          key={q}
          onClick={() => setQualification(q)}
          className={`px-4 py-2 rounded w-full ${
            qualification === q
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }`}
        >
          {q}th
        </button>
      ))}
    </div>

    {/* DEMAND (12th ONLY) */}
    {qualification === "12" && (
      <select
        value={demandFilter}
        onChange={(e) => setDemandFilter(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">All Demand</option>
        <option value="demand">Demand</option>
        <option value="not in demand">Not in Demand</option>
      </select>
    )}

    {/* STREAM */}
    <select
      value={streamFilter}
      onChange={(e) => setStreamFilter(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="">All Streams</option>
      {streamOptions.map(s => (
        <option key={s}>{s}</option>
      ))}
    </select>

    {/* CAREER */}
    <select
      value={careerFilter}
      onChange={(e) => setCareerFilter(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="">All Careers</option>
      {careerOptions.map(c => (
        <option key={c}>{c}</option>
      ))}
    </select>

  </div>
</div>


      {/* ---------------- FORM (ABOVE LIST) ---------------- */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="font-bold mb-4">
            {editingId ? "✏️ Edit" : "➕ Add"}{" "}
            {qualification === "10" ? "Subject" : "Course"}
          </h2>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-3 border p-2 rounded"
          />

          {qualification === "10" ? (
            <div className="mb-3">
              <label className="font-medium">Domains</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {streamOptions.map(s => (
                  <label key={s} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={streams.includes(s)}
                      onChange={() => toggleStream(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <select
              value={streams[0] || ""}
              onChange={(e) => setStreams([e.target.value])}
              className="w-full mb-3 border p-2 rounded"
            >
              <option value="">Select Domain</option>
              {streamOptions.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}

          {qualification === "12" && (
            <select
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
              className="w-full mb-3 border p-2 rounded"
            >
              <option value="demand">Demand</option>
              <option value="not in demand">Not in Demand</option>
            </select>
          )}

          {careers.map((c, i) => (
            <input
              key={i}
              placeholder={`Career ${i + 1}`}
              value={c}
              onChange={(e) => {
                const arr = [...careers];
                arr[i] = e.target.value;
                setCareers(arr);
              }}
              className="w-full mb-2 border p-2 rounded"
            />
          ))}

          <button
            onClick={addCareerField}
            className="text-blue-600 font-semibold mb-4"
          >
            + Add Career
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-6 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-300 px-6 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

     

      {/* ---------------- LIST ---------------- */}
      {isLoading ? (
        <p>Loading...</p>
      ) : filteredData.length ? (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredData.map(i => (
            <div key={i.id} className="bg-white p-6 rounded shadow">
              <h4 className="font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                {i.title}
              </h4>
              <p className="text-sm">Domain: {i.stream}</p>
              <ul className="list-disc ml-5 mt-2">
                {i.careers.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingId(i.id);
                    setTitle(i.title);
                    setStreams(
                      qualification === "10" ? i.streams : [i.stream]
                    );
                    setCareers(i.careers || [""]);
                    setDemand(i.demand || "demand");
                    setShowForm(true);
                  }}
                  className="bg-yellow-400 px-4 py-1 rounded text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(i.id)}
                  className="bg-red-500 px-4 py-1 rounded text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <TrendingUp className="mx-auto mb-2" />
          No data found
        </div>
      )}
    </div>
  );
};

export default AdminQualificationView;
