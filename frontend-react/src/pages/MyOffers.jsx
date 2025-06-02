import { useEffect, useState } from 'react';
import axios from 'axios';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyOffers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/offers/seller', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('API response:', res.data);

        if (Array.isArray(res.data)) {
          setOffers(res.data);
        } else {
          throw new Error('Unexpected API response');
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError('Failed to load offers.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyOffers();
  }, []);

  if (loading) return <p className="p-6 text-lg">Loading your offers...</p>;
  if (error) return <p className="p-6 text-red-500 text-lg">{error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📦 My Submitted Offers</h2>

      {offers.length === 0 ? (
        <p className="text-gray-600">You haven't submitted any offers yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => {
            const statusColor =
              offer.status === 'Accepted'
                ? 'border-green-500'
                : offer.status === 'Rejected'
                ? 'border-red-500'
                : 'border-gray-300';

            return (
              <div
                key={offer._id}
                className={`border-l-4 ${statusColor} bg-white shadow-md rounded-xl p-5 transition hover:shadow-lg`}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{offer.requestId?.productName}</h3>
                <p className="text-sm text-gray-500 mb-3">{offer.requestId?.description}</p>

                <div className="space-y-1 text-sm text-gray-700">
                  <p><span className="font-medium">Request Status:</span> {offer.requestId?.status}</p>
                  <p><span className="font-medium">Quantity Offered:</span> {offer.quantity}</p>
                  <p><span className="font-medium">Offered Price:</span> ${offer.price}</p>
                  <p><span className="font-medium">Message:</span> {offer.message || 'N/A'}</p>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      offer.status === 'Accepted'
                        ? 'bg-green-100 text-green-700'
                        : offer.status === 'Rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {offer.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(offer.offeredAt).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOffers;
