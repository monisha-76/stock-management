import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ProductRequestForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    quantity: '',
    urgency: 'Medium',
  });
  const [loading, setLoading] = useState(false);

  const { productName, description, quantity, urgency } = formData;

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
  e.preventDefault();

  if (!productName.trim() || !quantity.trim()) {
    toast.error('Product Name and Quantity are required');
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post(
      'http://localhost:5000/api/requests',
      { productName, description, quantity, urgency },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    toast.success(res.data.message || 'Product request submitted successfully');

    setFormData({
      productName: '',
      description: '',
      quantity: '',
      urgency: 'Medium',
    });

    // Navigate after short delay so toast can show
    setTimeout(() => {
      navigate('/browse');
    }, 2000);
  } catch (err) {
    toast.error(
      err.response?.data?.message || 'Failed to submit product request'
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Request a Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="productName"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={productName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min={1}
              value={quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="urgency"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              value={urgency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Low">Low (Needed in a week)</option>
              <option value="Medium">Medium (Needed in couple of days)</option>
              <option value="High">High (Needed Immediately)</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductRequestForm;
