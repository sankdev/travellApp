import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationService } from '../../../services/reservationService';
//import { notificationService } from '../../../services/notificationService';

const ProposalResponse = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState({
    accept: null,
    rejectionReason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const data = await reservationService.getReservationById(proposalId);
        console.log('dataProposition',data)
        setProposal(data.data);

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load proposal');
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

  const handleResponseChange = (e) => {
    const { name, value } = e.target;
    setResponse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await reservationService.respondToProposal({
        reservationId: proposalId,
        accept: response.accept === 'true',
        rejectionReason: response.rejectionReason
      });

      // Show success and redirect after delay
      setTimeout(() => {
        navigate('/customer/reservations');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Warning!</strong>
        <span className="block sm:inline"> Proposal not found</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Flight Proposal Response</h2>
      
      {/* Proposal Details */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Proposal Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Flight</p>
            <p className="font-medium">
              {proposal.vols?.flight.companyVol?.name} - {proposal.startDestination?.city} to {proposal.endDestination?.city}
            </p>
            <p className="text-sm">
              {new Date(proposal.startAt).toLocaleDateString()} 

            </p>
            
          <p className="text-sm">
  <span className="font-semibold">DepartureTime:</span>{' '}
  {new Date(proposal.proposalDetails?.proposedVol?.departureTime).toLocaleTimeString()}
</p>
                 <p className="text-sm">
  <span className="font-semibold">ArrivalTime:</span>{' '}
  {new Date(proposal.proposalDetails?.proposedVol?.arrivalTime).toLocaleTimeString()}
</p>

          </div>
          
          <div>
            <p className="text-sm text-gray-500">Class</p>
            <p className="font-medium">{proposal.class?.class?.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Proposed Price</p>
            <p className="font-medium">${proposal.totalPrice?.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium capitalize">{proposal.status}</p>
          </div>
        </div>
      </div>
      
      {/* Response Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="accept-true"
                name="accept"
                type="radio"
                value="true"
                checked={response.accept === 'true'}
                onChange={handleResponseChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                required
              />
              <label htmlFor="accept-true" className="ml-3 block text-sm font-medium text-gray-700">
                Accept Proposal
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="accept-false"
                name="accept"
                type="radio"
                value="false"
                checked={response.accept === 'false'}
                onChange={handleResponseChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                required
              />
              <label htmlFor="accept-false" className="ml-3 block text-sm font-medium text-gray-700">
                Reject Proposal
              </label>
            </div>
          </div>
        </div>
        
        {response.accept === 'false' && (
          <div>
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Rejection (Optional)
            </label>
            <textarea
              id="rejectionReason"
              name="rejectionReason"
              rows="3"
              value={response.rejectionReason}
              onChange={handleResponseChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide a reason for rejecting this proposal..."
            ></textarea>
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || response.accept === null}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${submitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalResponse;
