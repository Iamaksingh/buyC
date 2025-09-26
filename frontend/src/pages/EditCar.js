import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import OEMSelector from "../components/OEMSelector";

export default function EditCar() {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "", price: "", color: "", kmsOnOdometer: "", bulletPoints: ["","","","",""], oemSpec: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOne = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/inventory", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const found = (res.data || []).find(i => i._id === id);
        if (!found) {
          setError("Car not found");
          setLoading(false);
          return;
        }
        setForm({
          title: found.title || "",
          price: found.price || "",
          color: found.color || "",
          kmsOnOdometer: found.kmsOnOdometer || "",
          bulletPoints: (found.bulletPoints && found.bulletPoints.length ? found.bulletPoints : ["","","","",""]).slice(0,5).concat(Array(5).fill("")).slice(0,5),
          oemSpec: found.oemSpec?._id || ""
        });
      } catch (e) {
        setError("Failed to load car");
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  const handleChange = (e, index = null) => {
    if(index !== null){
      const bullets = [...form.bulletPoints];
      bullets[index] = e.target.value;
      setForm({...form, bulletPoints: bullets});
    } else {
      setForm({...form, [e.target.name]: e.target.value});
    }
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      payload.price = Number(payload.price);
      payload.kmsOnOdometer = Number(payload.kmsOnOdometer);
      await axios.put(`http://localhost:5000/api/inventory/${id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      navigate("/inventory");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update car. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading car...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Edit Car</h1>
            <p className="mt-2 text-gray-600">Update details and save changes</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Car Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  value={form.price}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                />
              </div>

              <div>
                <OEMSelector
                  value={form.oemSpec}
                  onChange={(idSel) => setForm({ ...form, oemSpec: idSel })}
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                <input
                  id="color"
                  name="color"
                  type="text"
                  required
                  value={form.color}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="kmsOnOdometer" className="block text-sm font-medium text-gray-700 mb-2">
                  Kilometers Driven *
                </label>
                <input
                  id="kmsOnOdometer"
                  name="kmsOnOdometer"
                  type="number"
                  required
                  value={form.kmsOnOdometer}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Features (5 points) *
              </label>
              <div className="space-y-3">
                {form.bulletPoints.map((bullet, i) => (
                  <input
                    key={i}
                    value={bullet}
                    onChange={(e) => handleChange(e, i)}
                    className="input-field"
                    placeholder={`Feature ${i + 1}`}
                    required
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <button type="button" onClick={() => navigate("/inventory")} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


