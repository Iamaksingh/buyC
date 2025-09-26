import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function OEMSelector({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(() => items.find(i => i._id === value) || null, [items, value]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:5000/api/oem/list", { params: { q: query, limit: 20 } });
        if (active) setItems(res.data.items || []);
      } catch (e) {
        if (active) setError("Failed to load OEM specs");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [query]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">OEM Specification</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by manufacturer/model/year"
        className="input-field mb-3"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-3">{error}</div>
      )}

      <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg divide-y">
        {loading ? (
          <div className="p-3 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-gray-500">No specs found</div>
        ) : (
          items.map(item => (
            <button
              type="button"
              key={item._id}
              onClick={() => onChange(item._id)}
              className={`w-full text-left p-3 hover:bg-gray-50 ${value === item._id ? 'bg-primary-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{item.manufacturer} {item.modelName} ({item.year})</div>
                  <div className="text-xs text-gray-600">Mileage: {item.mileage || '-'} | Colors: {(item.colors||[]).join(', ')}</div>
                </div>
                {value === item._id && (
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {selected && (
        <div className="mt-3 p-3 rounded-lg border border-primary-200 bg-primary-50 text-sm text-primary-900">
          Selected: {selected.manufacturer} {selected.modelName} ({selected.year}) — Mileage {selected.mileage || '-'}
        </div>
      )}
    </div>
  );
}


