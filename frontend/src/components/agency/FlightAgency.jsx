import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { agencyAssociationService } from "../../services/agencyAssociationService";
import { agencyService } from "../../services/agencyService";
import { volService } from "../../services/volService";

const FlightAgency = () => {
    const [flightAgencies, setFlightAgencies] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [vols, setVols] = useState([]);
    const [formData, setFormData] = useState({
        volId: "",
        agencyId: "",
        price: "",
        departureTime: "",
        arrivalTime: "",
        status: "active",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchFlightAgencies();
        fetchAgencies();
        fetchVols();
    }, []);

    const fetchFlightAgencies = async () => {
        try {
            const response = await agencyAssociationService.getUserFlightAgencies();
           console.log('responseAgencyFlight',response)
            setFlightAgencies(response || []);
        } catch (err) {
            setError("Failed to fetch flight agencies");
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getUserAgencies();
            setAgencies(response.data || []);
        } catch (err) {
            setError("Failed to fetch agencies");
        }
    };

    const fetchVols = async () => {
        try {
            const response = await volService.getVols();
            setVols(Array.isArray(response) ? response : []);
        } catch (err) {
            setError("Failed to fetch vols");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            if (editMode) {
                await agencyAssociationService.updateFlightAgency(editId, formData);
                setSuccess("Flight agency updated successfully!");
            } else {
                await agencyAssociationService.createFlightAgency(formData);
                setSuccess("Flight agency created successfully!");
            }
            setFormData({ volId: "", agencyId: "", price: "", departureTime: "", arrivalTime: "", status: "active" });
            setEditMode(false);
            setEditId(null);
            fetchFlightAgencies();
        } catch (err) {
            setError("Failed to save flight agency");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (flightAgency) => {
        setFormData({
            volId: flightAgency.volId,
            agencyId: flightAgency.agencyId,
            price: flightAgency.price,
            departureTime: flightAgency.departureTime ? flightAgency.departureTime.split(".")[0] : "",
            arrivalTime: flightAgency.arrivalTime ? flightAgency.arrivalTime.split(".")[0] : "",
            status: flightAgency.status,
        });
        setEditMode(true);
        setEditId(flightAgency.id);
    };

    const handleDelete = async (id) => {
        try {
            await agencyAssociationService.deleteFlightAgency(id);
            setSuccess("Flight agency deleted successfully!");
            fetchFlightAgencies();
        } catch (err) {
            setError("Failed to delete flight agency");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Flight Agencies</h1>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Select Vol */}
                <div>
                    <label className="block text-gray-700 font-semibold text-lg mb-2">Vol</label>
                    <select
                        name="volId"
                        value={formData.volId}
                        onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    >
                        <option value="">Select Vol</option>
                        {vols.map((vol) => (
                            <option key={vol.id} value={vol.id}>{vol.name}</option>
                        ))}
                    </select>
                </div>
        
                {/* Select Agency */}
                <div>
                    <label className="block text-gray-700 font-semibold text-lg mb-2">Agency</label>
                    <select
                        name="agencyId"
                        value={formData.agencyId}
                        onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    >
                        <option value="">Select Agency</option>
                        {agencies.map((agency) => (
                            <option key={agency.id} value={agency.id}>{agency.name}</option>
                        ))}
                    </select>
                </div>
        
                {/* Price */}
                <div>
                    <label className="block text-gray-700 font-semibold text-lg mb-2">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
        
                {/* Departure Time */}
                <div>
                    <label className="block text-gray-700 font-semibold text-lg mb-2">Departure Time</label>
                    <input
                        type="datetime-local"
                        name="departureTime"
                        value={formData.departureTime}
                        onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
        
                {/* Arrival Time */}
                <div>
                    <label className="block text-gray-700 font-semibold text-lg mb-2">Arrival Time</label>
                    <input
                        type="datetime-local"
                        name="arrivalTime"
                        value={formData.arrivalTime}
                        onChange={handleChange}
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
        
            <button
                        type="submit"
                        disabled={loading}
                        className={`w-md px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                {loading ? "Saving..." : editMode ? "Update Flight Agency" : "Create Flight Agency"}
            </button>
        </form>
        

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="table-auto w-full bg-white shadow-lg rounded-lg overflow-hidden">
                    <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th>Vol</th><th>Agency</th><th>Price</th><th>Departure</th><th>Arrival</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flightAgencies.map((fa) => (
                            <tr key={fa.id} className="border-b hover:bg-gray-100">
                                <td>{fa.flight?.name || "N/A"}</td>
                                <td>{fa.agency?.name || "N/A"}</td>
                                <td>{fa.price}</td>
                                <td>{new Date(fa.departureTime).toLocaleString()}</td>
                                <td>{new Date(fa.arrivalTime).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => handleEdit(fa)} className="btn-edit mr-2"><FontAwesomeIcon icon={faEdit} /></button>
                                    <button onClick={() => handleDelete(fa.id)} className="btn-delete"><FontAwesomeIcon icon={faTrash} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FlightAgency;
