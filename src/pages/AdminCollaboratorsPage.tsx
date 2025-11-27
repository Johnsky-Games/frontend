import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';
import { UserPlus, Shield, Edit, Trash2, Key, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../hooks/usePermissions';
import AccessDenied from '../components/AccessDenied';

interface Collaborator {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    permissions_count: number;
}

interface Permission {
    id: number;
    permission_key: string;
    permission_name: string;
    description: string;
    category: string;
}

const AdminCollaboratorsPage: React.FC = () => {
    const navigate = useNavigate();
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedCollaborator, setSelectedCollaborator] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [collaboratorToDelete, setCollaboratorToDelete] = useState<number | null>(null);

    // Create form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        permissions: [] as string[]
    });

    const { hasPermission, isMainAdmin } = usePermissions();

    useEffect(() => {
        if (isMainAdmin() || hasPermission('manage_collaborators')) {
            fetchCollaborators();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCollaborators = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get('/admin/collaborators');
            // Backend returns { code: 'SUCCESS', data: [...] }
            // Axios puts this in response.data, so we need response.data.data
            const collaboratorsData = response.data.data || [];
            setCollaborators(Array.isArray(collaboratorsData) ? collaboratorsData : []);
        } catch (error) {
            console.error('Error fetching collaborators:', error);
            setCollaborators([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollaborator = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Password is auto-generated on the backend
            const response = await ApiService.post('/admin/collaborators', {
                name: formData.name,
                email: formData.email,
                permissions: formData.permissions
            });

            setShowCreateModal(false);
            resetForm();
            fetchCollaborators();

            // Show success notification
            toast.success(`✅ Collaborator "${formData.name}" created successfully! Login credentials and verification email have been sent to ${formData.email}`, {
                autoClose: 6000,
                position: 'top-right'
            });
        } catch (error: any) {
            console.error('Error creating collaborator:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create collaborator';
            toast.error(`❌ ${errorMessage}`, {
                autoClose: 4000
            });
        }
    };

    const handleDeleteCollaborator = async (id: number) => {
        setCollaboratorToDelete(id);
    };

    const confirmDelete = async () => {
        if (!collaboratorToDelete) return;

        try {
            await ApiService.delete(`/admin/collaborators/${collaboratorToDelete}`);
            fetchCollaborators();
            toast.success('🗑️ Collaborator deleted successfully', {
                autoClose: 3000
            });
        } catch (error) {
            console.error('Error deleting collaborator:', error);
            toast.error('❌ Failed to delete collaborator', {
                autoClose: 4000
            });
        } finally {
            setCollaboratorToDelete(null);
        }
    };

    const handleManagePermissions = (collabId: number) => {
        toast.info('🔑 Redirecting to permissions management...', {
            autoClose: 2000
        });
        navigate(`/admin/collaborators/${collabId}/permissions`);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            permissions: []
        });
    };

    const filteredCollaborators = collaborators.filter(collab =>
        collab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collab.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isMainAdmin() && !hasPermission('manage_collaborators')) {
        return <AccessDenied requiredPermission="manage_collaborators" />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Shield className="mr-3 h-8 w-8 text-blue-600" />
                        Admin Collaborators
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage admin collaborators and their permissions
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add Collaborator
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Collaborators Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Permissions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCollaborators.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <Shield className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <p>No collaborators found</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Create your first collaborator
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            filteredCollaborators.map((collab) => (
                                <tr key={collab.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{collab.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{collab.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <Key className="mr-1 h-3 w-3" />
                                            {collab.permissions_count} permissions
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {collab.is_active ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleManagePermissions(collab.id)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                            title="Manage Permissions"
                                        >
                                            <Key className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCollaborator(collab.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-xl font-semibold text-gray-900">Create New Collaborator</h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCollaborator} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-800">
                                                <strong>Password Auto-Generated:</strong> A secure temporary password will be automatically generated and sent to the collaborator's email address. They will be required to change it on first login.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-xs text-gray-600">
                                        <strong>Note:</strong> Permissions can be assigned after creating the collaborator.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Create Collaborator
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {collaboratorToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Collaborator</h3>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this collaborator? This action cannot be undone.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setCollaboratorToDelete(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <ToastContainer />
        </div>
    );
};

export default AdminCollaboratorsPage;
