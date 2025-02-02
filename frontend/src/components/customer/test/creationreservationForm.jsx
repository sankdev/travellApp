import React, { useState, useEffect } from 'react';
import agencyService from '../../services/agencyService';
import reservationService from '../../services/reservationService';
import destinationService from '../../services/destinationService';
import volService from '../../services/volService';

const CreateReservation = () => {
  const [formData, setFormData] = useState({
    agencyId: '',
    userId: '',
    customerId: '',
    startAt: '',
    endAt: '',
    tripType: 'one-way',
    volId: '',
    returnVolId: '',
    startDestinationId: '',
    endDestinationId: '',
    description: '',
    status: 'pending',
  });
  const [agencies, setAgencies] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [vols, setVols] = useState([]);
  const [showVolSuggestions, setShowVolSuggestions] = useState(false);
  const [volSearch, setVolSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const agenciesResponse = await agencyService.getUserAgencies();
      setAgencies(agenciesResponse.data);

      const destinationsResponse = await destinationService.getDestinations();
      setDestinations(destinationsResponse.data);

      const volsResponse = await volService.getVols();
      setVols(volsResponse.data);
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reservationService.createReservation(formData);
      alert('Reservation created successfully');
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  const getCompanyById = (id) => {
    // Implement this function to get company name by ID
  };

  const getDestinationById = (id) => {
    // Implement this function to get destination name by ID
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Create Reservation</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Agency</label>
          <input
            type="text"
            value={volSearch}
            onChange={(e) => {
              setVolSearch(e.target.value);
              setShowVolSuggestions(true);
            }}
            placeholder="Start typing agency name..."
            className="inputClassName"
          />
          {showVolSuggestions && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              {vols.map((vol) => (
                <li
                  key={vol.id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setVolSearch(vol.name);
                    handleInputChange({ target: { name: 'volId', value: vol.id } });
                    setShowVolSuggestions(false);
                  }}
                >
                  {vol.name} - {getCompanyById(vol.companyId)} - {getDestinationById(vol.destinationId)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Trip Type</label>
          <select
            name="tripType"
            value={formData.tripType}
            onChange={handleInputChange}
            className="inputClassName"
          >
            <option value="one-way">One-way</option>
            <option value="round-trip">Round-trip</option>
          </select>
        </div>

        {formData.tripType === 'round-trip' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Return Vol</label>
            <select
              name="returnVolId"
              value={formData.returnVolId}
              onChange={handleInputChange}
              className="inputClassName"
            >
              <option value="">Select a return vol</option>
              {vols.map((vol) => (
                <option key={vol.id} value={vol.id}>
                  {vol.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Start Destination</label>
          <select
            name="startDestinationId"
            value={formData.startDestinationId}
            onChange={handleInputChange}
            className="inputClassName"
          >
            <option value="">Select a start destination</option>
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">End Destination</label>
          <select
            name="endDestinationId"
            value={formData.endDestinationId}
            onChange={handleInputChange}
            className="inputClassName"
          >
            <option value="">Select an end destination</option>
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="startAt"
            value={formData.startAt}
            onChange={handleInputChange}
            className="inputClassName"
          />
        </div>

        {formData.tripType === 'round-trip' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endAt"
              value={formData.endAt}
              onChange={handleInputChange}
              className="inputClassName"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="inputClassName"
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Create Reservation
        </button>
      </form>
    </div>
  );
};

export default CreateReservation;