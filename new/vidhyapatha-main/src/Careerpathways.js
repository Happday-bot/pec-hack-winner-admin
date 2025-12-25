import React, { useState } from "react";
import RoadmapPage from "./RoadmapPage";

export default function CareerPathwaysAdmin() {
  const [careers, setCareers] = useState([
    {
      id: 1,
      title: "Journalist/Editor",
      details: "Mass Communication and Literature",
      degree: "BA",
      stream: "Journalism",
      demand: "Demand",
    },
    {
      id: 2,
      title: "Public Relations Specialist",
      details: "Mass Communication or Sociology",
      degree: "BA",
      stream: "Mass Communication",
      demand: "Not in Demand",
    },
  ]);

  const [selectedCareer, setSelectedCareer] = useState(null);
  const [editingCareer, setEditingCareer] = useState(null);
  const [newCareer, setNewCareer] = useState({
    title: "",
    details: "",
    degree: "",
    stream: "",
    demand: "Demand",
  });

  // Add
  const addCareer = () => {
    if (!newCareer.title || !newCareer.details || !newCareer.degree || !newCareer.stream) return;
    setCareers([...careers, { id: Date.now(), ...newCareer }]);
    setNewCareer({ title: "", details: "", degree: "", stream: "", demand: "Demand" });
  };

  // Update
  const updateCareer = () => {
    setCareers(
      careers.map((c) =>
        c.id === editingCareer.id ? editingCareer : c
      )
    );
    setEditingCareer(null);
  };

  // Delete
  const deleteCareer = (id) => {
    setCareers(careers.filter((c) => c.id !== id));
    if (selectedCareer?.id === id) setSelectedCareer(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Career Pathways (Admin)
      </h2>

      {/* Add Career */}
      <div className="mb-6 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Title"
          value={newCareer.title}
          onChange={(e) =>
            setNewCareer({ ...newCareer, title: e.target.value })
          }
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Details"
          value={newCareer.details}
          onChange={(e) =>
            setNewCareer({ ...newCareer, details: e.target.value })
          }
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Degree"
          value={newCareer.degree}
          onChange={(e) =>
            setNewCareer({ ...newCareer, degree: e.target.value })
          }
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Stream"
          value={newCareer.stream}
          onChange={(e) =>
            setNewCareer({ ...newCareer, stream: e.target.value })
          }
          className="border px-2 py-1 rounded"
        />
        <select
          value={newCareer.demand}
          onChange={(e) =>
            setNewCareer({ ...newCareer, demand: e.target.value })
          }
          className="border px-2 py-1 rounded"
        >
          <option value="Demand">Demand</option>
          <option value="Not in Demand">Not in Demand</option>
        </select>
        <button
          onClick={addCareer}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Add
        </button>
      </div>

      {/* Careers List */}
      <div className="grid grid-cols-2 gap-4">
        {careers.map((career) => (
          <div
            key={career.id}
            className="p-4 bg-white rounded-xl shadow border"
          >
            {editingCareer?.id === career.id ? (
              <>
                <input
                  type="text"
                  value={editingCareer.title}
                  onChange={(e) =>
                    setEditingCareer({ ...editingCareer, title: e.target.value })
                  }
                  className="border px-2 py-1 rounded w-full mb-2"
                />
                <input
                  type="text"
                  value={editingCareer.details}
                  onChange={(e) =>
                    setEditingCareer({ ...editingCareer, details: e.target.value })
                  }
                  className="border px-2 py-1 rounded w-full mb-2"
                />
                <input
                  type="text"
                  value={editingCareer.degree}
                  onChange={(e) =>
                    setEditingCareer({ ...editingCareer, degree: e.target.value })
                  }
                  className="border px-2 py-1 rounded w-full mb-2"
                />
                <input
                  type="text"
                  value={editingCareer.stream}
                  onChange={(e) =>
                    setEditingCareer({ ...editingCareer, stream: e.target.value })
                  }
                  className="border px-2 py-1 rounded w-full mb-2"
                />
                <select
                  value={editingCareer.demand}
                  onChange={(e) =>
                    setEditingCareer({ ...editingCareer, demand: e.target.value })
                  }
                  className="border px-2 py-1 rounded w-full mb-2"
                >
                  <option value="Demand">Demand</option>
                  <option value="Not in Demand">Not in Demand</option>
                </select>
                <button
                  onClick={updateCareer}
                  className="px-2 py-1 bg-blue-600 text-white rounded mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingCareer(null)}
                  className="px-2 py-1 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h4 className="font-bold text-lg text-gray-800">{career.title}</h4>
                <p className="text-sm text-gray-600">{career.details}</p>
                <p className="text-sm text-gray-600">
                  Degree: {career.degree} | Stream: {career.stream} | Status: {career.demand}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditingCareer(career)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCareer(career.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedCareer(career)}
                    className="px-2 py-1 bg-gray-700 text-white rounded"
                  >
                    View Roadmap
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Roadmap Page */}
      {selectedCareer && (
        <RoadmapPage
          career={selectedCareer}
          onBack={() => setSelectedCareer(null)}
        />
      )}
    </div>
  );
}
