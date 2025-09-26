import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Inventory() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ color: "", maxPrice: "", maxKms: "", minMileage: "", maxMileage: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch cars
  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCars(res.data);
      setFilteredCars(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch cars. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle filters
  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ color: "", maxPrice: "", maxKms: "" });
  };

  useEffect(() => {
    let temp = [...cars];
    if(filters.color) temp = temp.filter(c => c.color.toLowerCase().includes(filters.color.toLowerCase()));
    if(filters.maxPrice) temp = temp.filter(c => c.price <= parseInt(filters.maxPrice));
    if(filters.maxKms) temp = temp.filter(c => c.kmsOnOdometer <= parseInt(filters.maxKms));
    if(filters.minMileage || filters.maxMileage) {
      const toNumber = (m) => {
        if (typeof m !== 'string') return undefined;
        const match = m.match(/\d+(?:\.\d+)?/);
        return match ? Number(match[0]) : undefined;
      };
      temp = temp.filter(c => {
        const mil = toNumber(c?.oemSpec?.mileage);
        if (mil === undefined) return false;
        if (filters.minMileage && mil < Number(filters.minMileage)) return false;
        if (filters.maxMileage && mil > Number(filters.maxMileage)) return false;
        return true;
      });
    }
    setFilteredCars(temp);
  }, [filters, cars]);

  // Checkbox selection for bulk delete
  const toggleSelect = id => {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredCars.length) {
      setSelected([]);
    } else {
      setSelected(filteredCars.map(car => car._id));
    }
  };

  // Bulk delete
  const handleDeleteSelected = async () => {
    if(selected.length===0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selected.length} car(s)?`)) return;
    
    try {
      await axios.post("http://localhost:5000/api/inventory/bulk-delete", { ids: selected }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCars();
      setSelected([]);
    } catch (err) {
      setError("Failed to delete cars. Please try again.");
    }
  };

  // Single delete
  const handleDeleteSingle = async id => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCars();
      setSelected(prev => prev.filter(x=>x!==id));
    } catch (err) {
      setError("Failed to delete car. Please try again.");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatKms = (kms) => {
    return new Intl.NumberFormat('en-IN').format(kms) + ' km';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Car Inventory</h1>
              <p className="mt-2 text-gray-600">
                Manage your car collection ({filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'})
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              <Link to="/add-car" className="btn-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Car
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  name="color"
                  placeholder="Filter by color"
                  value={filters.color}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₹)</label>
                <input
                  name="maxPrice"
                  placeholder="Maximum price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max KMs</label>
                <input
                  name="maxKms"
                  placeholder="Maximum kilometers"
                  type="number"
                  value={filters.maxKms}
                  onChange={handleFilterChange}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Mileage (kmpl)</label>
                <input
                  name="minMileage"
                  placeholder="Minimum mileage"
                  type="number"
                  value={filters.minMileage}
                  onChange={handleFilterChange}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Mileage (kmpl)</label>
                <input
                  name="maxMileage"
                  placeholder="Maximum mileage"
                  type="number"
                  value={filters.maxMileage}
                  onChange={handleFilterChange}
                  className="input-field"
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <button onClick={clearFilters} className="btn-secondary w-full">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-primary-800 font-medium">
                {selected.length} car{selected.length === 1 ? '' : 's'} selected
              </span>
              <button
                onClick={handleDeleteSelected}
                className="btn-danger"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Car Grid */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No cars found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {cars.length === 0 
                ? "Get started by adding your first car to the inventory."
                : "Try adjusting your filters to see more results."
              }
            </p>
            {cars.length === 0 && (
              <div className="mt-6">
                <Link to="/add-car" className="btn-primary">
                  Add Your First Car
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={selected.length === filteredCars.length && filteredCars.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Select all ({filteredCars.length} cars)
              </label>
            </div>

            {/* Car Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCars.map(car => (
                <div key={car._id} className="card card-hover">
                  <div className="relative">
                    {car.images && car.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000${car.images[0]}`}
                        alt={car.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(car._id)}
                        onChange={() => toggleSelect(car._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {car.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Price</span>
                        <span className="text-sm font-medium text-gray-900">{formatPrice(car.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Color</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{car.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">KMs</span>
                        <span className="text-sm font-medium text-gray-900">{formatKms(car.kmsOnOdometer)}</span>
                      </div>
                    </div>

                    {car.bulletPoints && car.bulletPoints.filter(b => b.trim()).length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {car.bulletPoints.filter(b => b.trim()).slice(0, 3).map((bullet, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-primary-500 mr-2">•</span>
                              <span className="line-clamp-1">{bullet}</span>
                            </li>
                          ))}
                          {car.bulletPoints.filter(b => b.trim()).length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{car.bulletPoints.filter(b => b.trim()).length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Link to={`/edit-car/${car._id}`} className="btn-secondary text-sm text-center">
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 0v14m7-7H5" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteSingle(car._id)}
                        className="btn-danger text-sm"
                      >
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
