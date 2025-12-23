import React, { useState, useEffect } from "react";
import { BookOpen, TrendingUp } from "lucide-react";
import { supabase } from "./supabase";

const AdminQualificationView = ({ initialQualification }) => {
  const [qualification, setQualification] = useState(initialQualification || "10");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  
const [domainsMap, setDomainsMap] = useState({});
const [degreesMap, setDegreesMap] = useState({});
  // Filters
  const [demandFilter, setDemandFilter] = useState("");
  const [streamFilter, setStreamFilter] = useState("");
  const [careerFilter, setCareerFilter] = useState("");

  // Admin edit/add
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStreams, setEditStreams] = useState([]);
  const [editCareers, setEditCareers] = useState([""]);
  const [editDemand, setEditDemand] = useState("demand");

  const [newTitle, setNewTitle] = useState("");
  const [newStreams, setNewStreams] = useState([]);
  const [newCareers, setNewCareers] = useState([""]);
  const [newDemand, setNewDemand] = useState("demand");
  const [degreeFilter, setDegreeFilter] = useState("");


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

  // ------------------- Fetch Data from Supabase -------------------
  const fetchData = async (qual) => {
    setIsLoading(true);
    try {
      let query = supabase.from("courses").select("*");

      if (qual === "10") query = query.eq("qualification", "10th");
      else query = query.eq("qualification", "12th");

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching courses:", error);
        setItems([]);
      } else {
        const mapped = data.map((row) => ({
  id: row.id,
  title: row.course_title,
  streams: row.domain_id ? [domainsMap[row.domain_id] || "N/A"] : [],
  stream: row.domain_id ? domainsMap[row.domain_id] || "N/A" : "N/A",
  degree: row.degree_id ? degreesMap[row.degree_id] || "N/A" : "N/A",
  careers: row.careers ? row.careers.split(",") : [],
  demand: row.demand === true || row.demand === "TRUE" ? "demand" : "not in demand",
}));

        setItems(mapped);
      }
    } catch (err) {
      console.error("Fetch courses failed:", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  const fetchMappings = async () => {
    try {
      const { data: domainsData } = await supabase.from("domains").select("id,name");
      const { data: degreesData } = await supabase.from("degrees").select("id,name");

      const domainObj = {};
      domainsData?.forEach(d => (domainObj[d.id] = d.name));
      setDomainsMap(domainObj);

      const degreeObj = {};
      degreesData?.forEach(d => (degreeObj[d.id] = d.name));
      setDegreesMap(degreeObj);
    } catch (err) {
      console.error("Error fetching mappings:", err);
    }
  };
  fetchMappings();
}, []);

  useEffect(() => {
    fetchData(qualification);
  }, [qualification]);

  // ------------------- Filtered Data -------------------
  const filteredData = items.filter((item) => {
  let match = true;

  if (qualification === "12" && demandFilter)
    match = match && item.demand === demandFilter;

  if (streamFilter) match = match && item.stream === streamFilter;

  if (careerFilter)
    match =
      match &&
      (item.careers ? item.careers.includes(careerFilter) : false);

  if (degreeFilter)
    match = match && item.degree === degreeFilter;

  return match;
});


  // ------------------- Admin Handlers -------------------
  const handleAddCareerField = (setCareers) => setCareers((prev) => [...prev, ""]);

  const handleStreamToggle = (stream, setStreams) => {
    setStreams((prev) =>
      prev.includes(stream) ? prev.filter((s) => s !== stream) : [...prev, stream]
    );
  };

  const handleSaveEdit = () => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === editingItem
          ? {
              ...i,
              title: editTitle,
              streams: qualification === "10" ? editStreams : undefined,
              stream: qualification === "12" ? editStreams[0] : undefined,
              careers: editCareers.filter((c) => c.trim() !== ""),
              demand: qualification === "12" ? editDemand : undefined,
            }
          : i
      )
    );
    setEditingItem(null);
  };

  const handleCancelEdit = () => setEditingItem(null);

  const handleDelete = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const handleAddNew = () => {
    if (!newTitle.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newTitle,
        streams: qualification === "10" ? newStreams : undefined,
        stream: qualification === "12" ? newStreams[0] : undefined,
        careers: newCareers.filter((c) => c.trim() !== ""),
        demand: qualification === "12" ? newDemand : undefined,
      },
    ]);
    setNewTitle("");
    setNewStreams([]);
    setNewCareers([""]);
    setNewDemand("demand");
  };

  // ------------------- Render -------------------
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <header className="text-center py-16 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          <span className="animate-bounce inline-block">🎯</span>{" "}
          {qualification === "10" ? "10th Subjects" : "12th Courses"} Admin
        </h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Manage subjects and courses: add, edit, delete.
        </p>
      </header>

      {/* Qualification Toggle */}
      <div className="flex justify-center mt-10">
        <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg flex p-2 space-x-4">
          <button
            onClick={() => setQualification("10")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              qualification === "10"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            10th
          </button>
          <button
            onClick={() => setQualification("12")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              qualification === "12"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            12th
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-2 z-30 flex justify-center mt-10 px-6 space-x-6">
        {qualification === "12" && (
          <select
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border shadow-sm bg-white/90 backdrop-blur text-gray-700"
          >
            <option value="">All</option>
            <option value="demand">Demand</option>
            <option value="not in demand">Not in Demand</option>
          </select>
        )}
        
        <select
          value={streamFilter}
          onChange={(e) => setStreamFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border shadow-sm bg-white/90 backdrop-blur text-gray-700"
        >
          <option value="">All Streams</option>
          {streamOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
         {qualification === "12" && (
          <select
  value={degreeFilter}
  onChange={(e) => setDegreeFilter(e.target.value)}
  className="px-4 py-2 rounded-xl border shadow-sm bg-white/90 backdrop-blur text-gray-700"
>
  <option value="">All Degrees</option>
  {Object.values(degreesMap).map((d) => (
    <option key={d} value={d}>
      {d}
    </option>
  ))}
</select>

         )}
        <select
          value={careerFilter}
          onChange={(e) => setCareerFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border shadow-sm bg-white/90 backdrop-blur text-gray-700"
        >
          <option value="">All Careers</option>
          {careerOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      

      {/* Add New Item */}
      <div className="bg-white rounded-2xl p-6 mt-8 mx-6 shadow-md">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">
          Add New {qualification === "10" ? "Subject" : "Course"}
        </h3>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        {qualification === "10" ? (
          <div className="mb-2">
            <label className="font-medium text-sm text-gray-700">Select Domains:</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {streamOptions.map((s) => (
                <label key={s} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newStreams.includes(s)}
                    onChange={() => handleStreamToggle(s, setNewStreams)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <select
            value={newStreams[0] || ""}
            onChange={(e) => setNewStreams([e.target.value])}
            className="w-full mb-2 p-2 border rounded"
          >
            <option value="">Select Domains</option>
            {streamOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        {qualification === "12" && (
          <select
            value={newDemand}
            onChange={(e) => setNewDemand(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          >
            <option value="demand">Demand</option>
            <option value="not in demand">Not in Demand</option>
          </select>
        )}
        {newCareers.map((c, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Career ${idx + 1}`}
            value={c}
            onChange={(e) => {
              const arr = [...newCareers];
              arr[idx] = e.target.value;
              setNewCareers(arr);
            }}
            className="w-full mb-2 p-2 border rounded"
          />
        ))}
        <button
          onClick={() => handleAddCareerField(setNewCareers)}
          className="text-blue-600 mb-4 font-semibold hover:underline"
        >
          + Add Career
        </button>
        <div>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Add {qualification === "10" ? "Subject" : "Course"}
          </button>
        </div>
      </div>

      {/* Items List */}
      <main className="flex-1 px-6 md:px-12 lg:px-20 py-12">
        {isLoading ? (
          <div className="text-center text-gray-500 animate-pulse">Loading...</div>
        ) : filteredData.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
            {filteredData.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow transition transform cursor-pointer border border-gray-100 flex flex-col justify-start"
              >
                {editingItem === item.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    {qualification === "10" ? (
                      <div>
                        <label className="font-medium text-sm text-gray-700">
                          Select Domains:
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {streamOptions.map((s) => (
                            <label key={s} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editStreams.includes(s)}
                                onChange={() => handleStreamToggle(s, setEditStreams)}
                              />
                              <span>{s}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <select
                        value={editStreams[0] || ""}
                        onChange={(e) => setEditStreams([e.target.value])}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select Domains</option>
                        {streamOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                    {qualification === "12" && (
                      <select
                        value={editDemand}
                        onChange={(e) => setEditDemand(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="demand">Demand</option>
                        <option value="not in demand">Not in Demand</option>
                      </select>
                    )}
                    
                    {editCareers.map((c, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={c}
                        onChange={(e) => {
                          const arr = [...editCareers];
                          arr[idx] = e.target.value;
                          setEditCareers(arr);
                        }}
                        className="w-full p-2 border rounded"
                      />
                    ))}
                    <button
                      onClick={() => handleAddCareerField(setEditCareers)}
                      className="text-blue-600 font-semibold hover:underline mb-4"
                    >
                      + Add Career
                    </button>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {qualification === "12" && item.demand === "demand" && (
                      <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        ✅ Demand
                      </span>
                    )}
                    {qualification === "12" && item.demand === "not in demand" && (
                      <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        ❌ Not in Demand
                      </span>
                    )}
                    <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Domain:{" "}
                      {qualification === "10"
                        ? item.streams?.join(", ") || "N/A"
                        : item.stream || "N/A"} 

                    </p>
                    <div className="overflow-hidden transition-all duration-500 ease-in-out">
                      <h5 className="font-semibold text-gray-700 mb-1">Possible Careers:</h5>
                      {item.careers && item.careers.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {item.careers.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No careers info</p>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingItem(item.id);
                          setEditTitle(item.title);
                          setEditStreams(
                            qualification === "10" ? item.streams || [] : [item.stream] || []
                          );
                          setEditCareers(item.careers || [""]);
                          setEditDemand(item.demand || "demand");
                        }}
                        className="bg-yellow-400 text-white px-4 py-1 rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            <TrendingUp className="mx-auto w-12 h-12 text-gray-400 mb-3" />
            No subjects/courses found.
          </div>
        )}
      </main>

      <footer className="bg-gray-100 text-gray-600 text-center py-6 mt-auto border-t">
        © 2025 Career Admin Panel • Manage Qualifications
      </footer>
    </div>
  );
};

export default AdminQualificationView;
