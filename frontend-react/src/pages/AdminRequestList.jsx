// ADD AT THE TOP
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastingId, setBroadcastingId] = useState(null);
  const [error, setError] = useState(null);

  const [offersMap, setOffersMap] = useState({});
  const [viewingRequestId, setViewingRequestId] = useState(null);
  const [acceptingOfferId, setAcceptingOfferId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(data);
    } catch (err) {
      setError('Failed to load product requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (requestId) => {
    setBroadcastingId(requestId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/requests/${requestId}/broadcast`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Broadcast sent to sellers!');
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: 'Notified' } : req
        )
      );
    } catch (err) {
      toast.error('Failed to send broadcast.');
    } finally {
      setBroadcastingId(null);
    }
  };

  const handleViewOffers = async (requestId) => {
    if (offersMap[requestId]) {
      setViewingRequestId(viewingRequestId === requestId ? null : requestId);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/api/offers/request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffersMap((prev) => ({ ...prev, [requestId]: data }));
      setViewingRequestId(requestId);
    } catch (err) {
      toast.error('Failed to fetch offers.');
    }
  };

  const handleAcceptOffer = async (offerId, requestId) => {
    setAcceptingOfferId(offerId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/offers/${offerId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Offer accepted and request marked as fulfilled');
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: 'Fulfilled' } : req
        )
      );
      setViewingRequestId(null); // hide offers
    } catch (err) {
      toast.error('Failed to accept offer');
    } finally {
      setAcceptingOfferId(null);
    }
  };

  if (loading)
    return <p className="text-center mt-6 text-gray-600">Loading requests...</p>;

  if (error)
    return <p className="text-center mt-6 text-red-500 font-semibold">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Product Requests</h2>
      {requests.length === 0 ? (
        <p className="text-center text-gray-600">No product requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Buyer Name</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Product Name</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Request Date</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Status</th>
                <th className="py-3 px-4 text-center text-gray-700 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <React.Fragment key={req._id}>
                  <tr className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{req.buyer?.username || 'N/A'}</td>
                    <td className="py-3 px-4">{req.productName}</td>
                    <td className="py-3 px-4">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {req.status === 'Pending' && <span className="text-yellow-600">Pending</span>}
                      {req.status === 'Notified' && <span className="text-blue-600">Notified</span>}
                      {req.status === 'Fulfilled' && <span className="text-green-600">Fulfilled</span>}
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      {req.status === 'Pending' && (
                        <button
                          onClick={() => handleBroadcast(req._id)}
                          disabled={broadcastingId === req._id}
                          className={`px-4 py-1 rounded-md  text-black transition ${
                            broadcastingId === req._id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'hover:text-gray-800 hover:underline text-black'
                          }`}
                        >
                          {broadcastingId === req._id ? 'Broadcasting...' : 'Broadcast to Sellers'}
                        </button>
                      )}
                      {req.status === 'Notified' && (
                        <button
                          onClick={() => handleViewOffers(req._id)}
                          className="px-4 py-1  hover:text-gray-800 hover:underline text-black rounded-md"
                        >
                          {viewingRequestId === req._id ? 'Hide Offers' : 'View Offers'}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Offers Section */}
                  {viewingRequestId === req._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="p-4">
                        <h4 className="text-md font-semibold mb-2 text-gray-800">Seller Offers</h4>
                        {offersMap[req._id]?.length === 0 ? (
                          <p className="text-sm text-gray-600">No offers submitted yet.</p>
                        ) : (
                          <ul className="space-y-2">
                            {offersMap[req._id].map((offer) => (
                              <li
                                key={offer._id}
                                className="border border-gray-300 rounded p-3 flex justify-between items-center"
                              >
                                <div>
                                  <p className="text-sm text-gray-800">
                                    <strong>Seller:</strong> {offer.seller?.username || 'Unknown'}
                                  </p>
                                  <p className="text-sm text-gray-800">
                                    <strong>Qty:</strong> {offer.quantity} | <strong>Price:</strong> ₹{offer.price}
                                  </p>
                                  <p className="text-sm italic text-gray-500">{offer.message}</p>
                                </div>
                                <button
                                  onClick={() => handleAcceptOffer(offer._id, req._id)}
                                  disabled={acceptingOfferId === offer._id}
                                  className={`px-3 py-1 text-white rounded-md transition ${
                                    acceptingOfferId === offer._id
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : 'bg-green-600 hover:bg-green-700'
                                  }`}
                                >
                                  {acceptingOfferId === offer._id ? 'Accepting...' : 'Accept Offer'}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRequestList;
