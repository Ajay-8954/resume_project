// src/components/admin/CreateOrganisation.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, User, Mail, Save, ArrowLeft } from 'lucide-react';

const CreateOrganisation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hr_admin_name: '',
    hr_admin_email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/organisations',
        formData,
        {
          withCredentials: true
        }
      );

      setCredentials({
        email: formData.hr_admin_email,
        tempPassword: response.data.hr_admin.temp_password
      });
      setShowCredentialsDialog(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create organisation');
      console.error('Create organisation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDialogClose = () => {
    setShowCredentialsDialog(false);
    navigate('/admin/organisations');
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/organisations')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Organisation</h1>
            <p className="mt-2 text-gray-600">
              Create a new organisation and set up the HR admin account
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            {/* Organisation Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-500" />
                Organisation Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Organisation Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter organisation name"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the organisation"
                  />
                </div>
              </div>
            </div>

            {/* HR Admin Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-500" />
                HR Admin Account
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hr_admin_name" className="block text-sm font-medium text-gray-700">
                    HR Admin Name *
                  </label>
                  <input
                    type="text"
                    id="hr_admin_name"
                    name="hr_admin_name"
                    required
                    value={formData.hr_admin_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label htmlFor="hr_admin_email" className="block text-sm font-medium text-gray-700">
                    HR Admin Email *
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="email"
                      id="hr_admin_email"
                      name="hr_admin_email"
                      required
                      value={formData.hr_admin_email}
                      onChange={handleChange}
                      className="block w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@organisation.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/organisations')}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Organisation
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showCredentialsDialog && credentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Organisation Created Successfully!</h2>
            <p className="text-gray-600 mb-6">Here are the HR Admin credentials:</p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span className="text-gray-900">{credentials.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Temporary Password:</span>
                <span className="text-gray-900">{credentials.tempPassword}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">Please share these credentials with the HR admin.</p>
            <button
              onClick={handleDialogClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateOrganisation;