import {
  faBuilding,
  faCalendarAlt,
  faCreditCard,
  faMapPin,
  faPlane,
  faSpinner,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { reservationService } from '../../services/reservationService';

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await reservationService.getAgencyReservations();
        setReservations(data.data);
      } catch (err) {
        setError('Failed to load reservations');
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const handleConfirm = async (id) => {
    setProcessingId(id);
    try {
      await reservationService.confirmReservation(id);
      const updatedData = await reservationService.getAgencyReservations();
      setReservations(updatedData.data);
    } catch (err) {
      console.error('Error confirming reservation:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReservations = reservations.filter((res) =>
    filter === 'all' ? true : res.status.toLowerCase() === filter
  );

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agency Reservations</h1>
            <p className="mt-2 text-sm text-gray-700">Manage your reservations and generate invoices</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Reservations</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onStatusChange={handleConfirm}
              isProcessing={processingId === reservation.id}
            />
          ))}
        </div>
        {filteredReservations.length === 0 && (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faBuilding} className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filter === 'all'
                        ? 'No reservations available.'
                        : `No ${filter} reservations available.`}
                    </p>
                  </div>
                )}
      </div>
    </div>
  );
};

const ReservationCard = ({ reservation, onStatusChange, isProcessing }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
      <Header reservation={reservation} />
      <Details reservation={reservation} />
      {reservation.status !== 'Confirmed' && (
        <ConfirmButton isProcessing={isProcessing} handleConfirm={() => onStatusChange(reservation.id)} />
      )}
    </div>
  );
};

const ConfirmButton = ({ isProcessing, handleConfirm }) => (
  <div className="mt-4">
    <button
      key={isProcessing ? "processing" : "confirm"}
      onClick={handleConfirm}
      disabled={isProcessing}
      className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
        ${isProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
    >
      {isProcessing ? (
        <>
          <FontAwesomeIcon icon={faSpinner} className="animate-spin h-5 w-5 mr-2" />
          Processing...
        </>
      ) : (
        'Confirm & Generate Invoice'
      )}
    </button>
  </div>
);

const Header = ({ reservation }) => {
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Reservation #{reservation.id}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[reservation.status]}`}>{reservation.status}</span>
        {reservation.customer && (
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <FontAwesomeIcon icon={faUser} className="h-4 w-4 mr-1" />
                      <span>{reservation.customer.name}</span>
                    </div>
                    <div className="text-xs text-gray-500">{reservation.customer.email}</div>
                  </div>
                )}
      </div>
    </div>
  );
};

const Details = ({ reservation }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <DetailItem icon={faCalendarAlt} text={`${new Date(reservation.startAt).toLocaleDateString()} - ${new Date(reservation.endAt).toLocaleDateString()}`} />
    {reservation.passengers && <DetailItem icon={faUsers} text={`${reservation.passengers.length} Passengers`} />}
    {reservation.vol && <DetailItem icon={faPlane} text={`Flight ${reservation.vol.name}`} />}
    {reservation.totalPrice && <DetailItem icon={faCreditCard} text={`${reservation.totalPrice.toFixed(2)} €`} />}
    {(reservation.startDestinationId || reservation.endDestinationId) && (
            <div className="flex items-center text-sm text-gray-500 sm:col-span-2">
              <FontAwesomeIcon icon={faMapPin} className="h-4 w-4 mr-2" />
              <span>
                {reservation.startDestinationId && `From Destination #${reservation.startDestinationId}`}
                {reservation.startDestinationId && reservation.endDestinationId && ' to '}
                {reservation.endDestinationId && `Destination #${reservation.endDestinationId}`}
              </span>
            </div>
          )}
  </div>
);

const DetailItem = ({ icon, text }) => (
  <div className="flex items-center text-sm text-gray-600">
    <FontAwesomeIcon icon={icon} className="h-4 w-4 mr-2" />
    <span>{text}</span>
  </div>
);

export default ReservationList;
