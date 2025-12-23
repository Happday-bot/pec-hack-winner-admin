import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    phone: "",
    gender: "",
    department: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch current user and profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profile_admin")
          .select("*")
          .eq("user_id", user.id) // filter by user ID
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error.message);
        }

        if (data) {
          setProfile(data);
          setForm({
            firstName: data.first_name || "",
            middleName: data.middle_name || "",
            lastName: data.last_name || "",
            dob: data.dob ? data.dob.slice(0, 10) : "",
            phone: data.phone || "",
            gender: data.gender || "",
            department: data.department || "",
          });
        }
      } catch (err) {
        console.error("Fetch profile failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return;

      const { error } = await supabase
        .from("profile_admin")
        .upsert(
          {
            user_id: user.id,
            first_name: form.firstName,
            middle_name: form.middleName,
            last_name: form.lastName,
            dob: form.dob,
            phone: Number(form.phone),
            gender: form.gender,
            department: form.department,
          },
          { onConflict: ["user_id"] }
        );

      if (error) {
        alert("Error saving profile: " + error.message);
      } else {
        alert("Profile saved successfully!");
        setProfile({ ...form });
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 text-gray-600">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-10">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-[#C7CBFF]">
        <h2 className="text-xl font-bold mb-6 text-center">Edit Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="First Name"
            value={form.firstName}
            editable={true}
            name="firstName"
            onChange={handleChange}
          />
          <Field
            label="Middle Name"
            value={form.middleName}
            editable={true}
            name="middleName"
            onChange={handleChange}
          />
          <Field
            label="Last Name"
            value={form.lastName}
            editable={true}
            name="lastName"
            onChange={handleChange}
          />
          <Field
            label="Date of Birth"
            value={form.dob}
            editable={true}
            type="date"
            name="dob"
            onChange={handleChange}
          />
          <Field
            label="Phone"
            value={form.phone}
            editable={true}
            name="phone"
            onChange={handleChange}
          />
          <Field
            label="Gender"
            value={form.gender}
            editable={true}
            type="select"
            name="gender"
            onChange={handleChange}
            options={["male", "female", "other"]}
          />
          <Field
            label="Department"
            value={form.department}
            editable={true}
            type="select"
            name="department"
            onChange={handleChange}
            options={[
              "minister",
              "secretary",
              "arts-science",
              "engineering",
              "medical",
              "law",
              "commerce",
              "other",
            ]}
          />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {profile && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow">
          <h3 className="text-lg font-semibold mb-4">Saved Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DisplayField label="First Name" value={profile.first_name} />
            <DisplayField label="Middle Name" value={profile.middle_name} />
            <DisplayField label="Last Name" value={profile.last_name} />
            <DisplayField label="Date of Birth" value={profile.dob} />
            <DisplayField label="Phone" value={profile.phone} />
            <DisplayField label="Gender" value={profile.gender} />
            <DisplayField label="Department" value={profile.department} />
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, value, editable, type = "text", name, onChange, options = [] }) => {
  if (!editable) {
    return (
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">{label}</label>
        <span className="mt-1">{value || "-"}</span>
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};

const DisplayField = ({ label, value }) => (
  <div className="flex flex-col">
    <label className="font-medium text-gray-700">{label}</label>
    <span className="mt-1">{value || "-"}</span>
  </div>
);
