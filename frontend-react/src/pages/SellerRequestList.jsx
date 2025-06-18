import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SellerNotifiedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submittedOffers, setSubmittedOffers] = useState([]);
  const [offerData, setOfferData] = useState({
    product: '',
    quantity: '',
    price: '',
    message: '',
    location: '',
    image: ''
  });

  useEffect(() => {
    fetchNotifiedRequests();
    fetchSubmittedOffers();
  }, []);

  const fetchNotifiedRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/requests/notified', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load notified product requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedOffers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/offers/seller/my-offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmittedOffers(data); // data is array of request IDs
    } catch (err) {
      toast.error('Failed to load your submitted offers.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setOfferData(prev => ({ ...prev, image: reader.result }));
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmitOffer = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/offers/${selectedRequest._id}`,
        offerData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Offer submitted successfully');
      setSubmittedOffers([...submittedOffers, selectedRequest._id]); // track submitted locally
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit offer');
    }
  };

  if (loading)
    return <p className="text-center mt-6 text-gray-600">Loading notified requests...</p>;

  if (requests.length === 0)
    return <p className="text-center mt-6 text-gray-500">No notified requests found.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Notified Product Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Buyer</th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Product</th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Quantity</th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Urgency</th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Date</th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => {
              const isSubmitted = submittedOffers.includes(req._id);
              return (
                <tr key={req._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{req.buyer?.username || 'N/A'}</td>
                  <td className="py-3 px-4">{req.productName}</td>
                  <td className="py-3 px-4">{req.quantity}</td>
                  <td className="py-3 px-4">{req.urgency}</td>
                  <td className="py-3 px-4">{new Date(req.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setOfferData({
                          product: '',
                          quantity: '',
                          price: '',
                          message: '',
                          location: '',
                        });
                      }}
                      className={`px-3 py-1 rounded ${isSubmitted
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      disabled={isSubmitted}
                    >
                      {isSubmitted ? 'Offer Submitted' : 'Propose Offer'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Offer Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Propose Offer</h3>

            <div className="mb-2">
              <label className="block text-gray-700 font-medium mb-1">Product Name:</label>
              <p className="p-2 border rounded bg-gray-100">{selectedRequest.productName}</p>
            </div>

            <input
              type="number"
              placeholder="Quantity"
              value={offerData.quantity}
              onChange={(e) => setOfferData({ ...offerData, quantity: e.target.value })}
              className="w-full border p-2 mb-2 rounded"
            />
            <input
              type="number"
              placeholder="Price per quantity"
              value={offerData.price}
              onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
              className="w-full border p-2 mb-2 rounded"
            />
            <textarea
              placeholder="Message (optional)"
              value={offerData.message}
              onChange={(e) => setOfferData({ ...offerData, message: e.target.value })}
              className="w-full border p-2 mb-4 rounded"
            ></textarea>

            <input
              type="text"
              placeholder="Location"
              value={offerData.location}
              onChange={(e) => setOfferData({ ...offerData, location: e.target.value })}
              className="w-full border p-2 mb-4 rounded"
            />

            <div className="mb-4">
              <label className="block text-gray-600 mb-1">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full border p-2 rounded text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOffer}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerNotifiedRequests;
