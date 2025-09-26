import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OEMSelector from "../components/OEMSelector";

export default function AddCar() {
  const [form, setForm] = useState({
    title: "", price: "", color: "", kmsOnOdometer: "", bulletPoints: ["","","","",""], images: [], oemSpec: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e, index = null) => {
    if(index !== null){
      const bullets = [...form.bulletPoints];
      bullets[index] = e.target.value;
      setForm({...form, bulletPoints: bullets});
    } else {
      setForm({...form, [e.target.name]: e.target.value});
    }
    setError(""); // Clear error when user types
  };

  const handleImageChange = e => {
    setForm({...form, images: e.target.files});
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if(key==="images") Array.from(value).forEach(f => data.append("images", f));
      else if(key==="bulletPoints") value.forEach(b => data.append("bulletPoints", b));
      else data.append(key, value);
    });

    try {
      await axios.post("http://localhost:5000/api/inventory", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/inventory");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add car. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Car Added Successfully!</h2>
          <p className="text-gray-600">Redirecting to inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Add New Car</h1>
            <p className="mt-2 text-gray-600">Fill in the details to add a new car to your inventory</p>
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
                  placeholder="e.g., 2020 Honda Civic"
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
                  placeholder="e.g., 500000"
                  min="0"
                />
              </div>
              
              <div>
                <OEMSelector
                  value={form.oemSpec}
                  onChange={(id) => setForm({ ...form, oemSpec: id })}
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
                  placeholder="e.g., White, Black, Red"
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
                  placeholder="e.g., 25000"
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
                    placeholder={`Feature ${i + 1} (e.g., Single owner, Accident-free)`}
                    required
                  />
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Car Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
              {form.images.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {form.images.length} file(s) selected
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/inventory")}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Car...
                  </div>
                ) : (
                  "Add Car"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
