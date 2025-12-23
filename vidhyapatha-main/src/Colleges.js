import React, { useState } from "react";
import { Edit, Trash2, Upload } from "lucide-react";

export default function AdminColleges() {
  const [colleges, setColleges] = useState([
    {
      name: "Indian Institute of Technology Jammu (IIT Jammu)",
      district: "Jammu",
      stream: "Engineering",
      medium: "English",
      details: {
        Rank: "56 (NIRF 2025 Engineering Overall)",
        Type: "Central Government Institute (IIT)",
        Address: "Jagti, NH-44, PO Nagrota, Jammu, Jammu & Kashmir - 181221",
        Contact: ["0191-274-1103", "0191-123-4567"],
        Email: ["registrar@iitjammu.ac.in", "info@iitjammu.ac.in"],
        Courses: ["B.Tech", "M.Tech", "M.Sc", "PhD"],
        "Cut-Off": "JEE Advanced rank-based",
        Facilities: ["Hostel", "Library", "WiFi", "Labs", "Sports"],
        Placement: [
          "70.8% (2023)",
          "Highest: INR 53 LPA",
          "Avg: INR 15.5 LPA",
        ],
      },
      image:
        "https://upload.wikimedia.org/wikipedia/commons/5/59/IIT_Jammu_Campus.jpg",
    },
  ]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [newCollege, setNewCollege] = useState(getEmptyCollege());

  function getEmptyCollege() {
    return {
      name: "",
      district: "",
      stream: "",
      medium: "",
      details: {
        Rank: "",
        Type: "",
        Address: "",
        Contact: "",
        Email: "",
        Courses: "",
        "Cut-Off": "",
        Facilities: "",
        Placement: "",
      },
      image: "",
    };
  }

  // Handle basic field updates
  const handleChange = (field, value) => {
    setNewCollege((prev) => ({ ...prev, [field]: value }));
  };

  // Handle detail updates (keep as string while typing)
  const handleDetailChange = (key, value) => {
    setNewCollege((prev) => ({
      ...prev,
      details: { ...prev.details, [key]: value },
    }));
  };

  // Image upload (local preview)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewCollege((prev) => ({ ...prev, image: url }));
    }
  };

  // Save college (Add or Update)
  const handleSave = () => {
    const multiFields = ["Contact", "Email", "Courses", "Facilities", "Placement"];

    const formattedDetails = { ...newCollege.details };
    multiFields.forEach((field) => {
      if (typeof formattedDetails[field] === "string") {
        formattedDetails[field] = formattedDetails[field]
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }
    });

    const finalCollege = { ...newCollege, details: formattedDetails };

    if (editingIndex !== null) {
      const updated = [...colleges];
      updated[editingIndex] = finalCollege;
      setColleges(updated);
    } else {
      setColleges([...colleges, finalCollege]);
    }

    setEditingIndex(null);
    setNewCollege(getEmptyCollege());
  };

  // Edit college
  const handleEdit = (index) => {
    const selected = colleges[index];
    const multiFields = ["Contact", "Email", "Courses", "Facilities", "Placement"];

    const editableDetails = { ...selected.details };
    multiFields.forEach((field) => {
      if (Array.isArray(editableDetails[field])) {
        editableDetails[field] = editableDetails[field].join(", ");
      }
    });

    setEditingIndex(index);
    setNewCollege({ ...selected, details: editableDetails });
  };

  // Delete college
  const handleDelete = (index) => {
    setColleges(colleges.filter((_, i) => i !== index));
  };

  // Helper to render array or string
  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside text-left">
          {value.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
      );
    }
    return <span>{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-indigo-700">
          🎓 Admin - Manage Colleges
        </h1>
        <p className="text-gray-600">Add, edit, or remove colleges</p>
      </header>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingIndex !== null ? "Edit College" : "Add New College"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="College Name"
            value={newCollege.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="District"
            value={newCollege.district}
            onChange={(e) => handleChange("district", e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Stream"
            value={newCollege.stream}
            onChange={(e) => handleChange("stream", e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Medium"
            value={newCollege.medium}
            onChange={(e) => handleChange("medium", e.target.value)}
            className="p-2 border rounded"
          />

          {/* Details */}
          {Object.keys(newCollege.details).map((key) => (
            <input
              key={key}
              type="text"
              placeholder={`${key} ${
                ["Contact", "Email", "Courses", "Facilities", "Placement"].includes(key)
                  ? "(comma separated)"
                  : ""
              }`}
              value={newCollege.details[key]}
              onChange={(e) => handleDetailChange(key, e.target.value)}
              className="p-2 border rounded col-span-2"
            />
          ))}

          {/* Image Upload */}
          <div className="col-span-2">
            <button
              onClick={() => document.getElementById("fileUpload").click()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
            >
              <Upload className="w-5 h-5" />
              Upload College Image
            </button>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {newCollege.image && (
              <img
                src={newCollege.image}
                alt="Preview"
                className="mt-2 w-48 h-32 object-cover rounded"
              />
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        >
          {editingIndex !== null ? "Update College" : "Add College"}
        </button>
      </div>

      {/* Colleges List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">All Colleges</h2>
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Image</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">District</th>
              <th className="border px-4 py-2">Stream</th>
              <th className="border px-4 py-2">Details</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college, i) => (
              <tr key={i} className="text-center align-top">
                <td className="border px-4 py-2">
                  <img
                    src={college.image}
                    alt={college.name}
                    className="w-16 h-12 object-cover rounded"
                  />
                </td>
                <td className="border px-4 py-2 font-semibold text-indigo-700">
                  {college.name}
                </td>
                <td className="border px-4 py-2">{college.district}</td>
                <td className="border px-4 py-2">{college.stream}</td>
                <td className="border px-4 py-2 text-left">
                  {Object.entries(college.details).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}: </strong>
                      {renderValue(value)}
                    </div>
                  ))}
                </td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEdit(i)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    <Edit className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
