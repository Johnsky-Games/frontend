import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/ApiService';
import Swal from 'sweetalert2';

interface SpecialHour {
    id: number;
    date: string;
    is_closed: boolean;
    open_time: string | null;
    close_time: string | null;
    reason: string | null;
}

const SpecialHoursEditor: React.FC = () => {
    const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newSpecialHour, setNewSpecialHour] = useState({
        date: '',
        is_closed: true,
        open_time: '',
        close_time: '',
        reason: ''
    });

    useEffect(() => {
        fetchSpecialHours();
    }, []);

    const fetchSpecialHours = async () => {
        try {
            const response = await api.get('/business-owner/special-hours');
            if (response.data.code === 'SUCCESS') {
                setSpecialHours(response.data.special_hours);
            }
        } catch (error) {
            console.error('Error fetching special hours:', error);
            toast.error('Failed to load special hours');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newSpecialHour.date) {
            toast.error('Date is required');
            return;
        }

        if (!newSpecialHour.is_closed) {
            if (!newSpecialHour.open_time || !newSpecialHour.close_time) {
                toast.error('Open and close times are required if not closed');
                return;
            }
        }

        try {
            setAdding(true);
            const response = await api.post('/business-owner/special-hours', newSpecialHour);
            if (response.data.code === 'SUCCESS') {
                toast.success('Special hour added successfully');
                setNewSpecialHour({
                    date: '',
                    is_closed: true,
                    open_time: '',
                    close_time: '',
                    reason: ''
                });
                fetchSpecialHours();
            }
        } catch (error: any) {
            console.error('Error adding special hour:', error);
            toast.error(error.response?.data?.message || 'Failed to add special hour');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/business-owner/special-hours/${id}`);
                toast.success('Special hour deleted successfully');
                fetchSpecialHours();
            } catch (error) {
                console.error('Error deleting special hour:', error);
                toast.error('Failed to delete special hour');
            }
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading special hours...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Add New Special Hour (Holiday/Exception)</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 items-end">
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                        <input
                            type="date"
                            value={newSpecialHour.date}
                            onChange={(e) => setNewSpecialHour({ ...newSpecialHour, date: e.target.value })}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        />
                    </div>

                    <div className="lg:col-span-1 flex items-center h-full pb-2">
                        <div className="flex items-center">
                            <input
                                id="is_closed"
                                type="checkbox"
                                checked={newSpecialHour.is_closed}
                                onChange={(e) => setNewSpecialHour({ ...newSpecialHour, is_closed: e.target.checked })}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                            />
                            <label htmlFor="is_closed" className="ml-2 block text-sm text-gray-900 dark:text-white">
                                Closed?
                            </label>
                        </div>
                    </div>

                    {!newSpecialHour.is_closed && (
                        <>
                            <div className="lg:col-span-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Open</label>
                                <input
                                    type="time"
                                    value={newSpecialHour.open_time}
                                    onChange={(e) => setNewSpecialHour({ ...newSpecialHour, open_time: e.target.value })}
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Close</label>
                                <input
                                    type="time"
                                    value={newSpecialHour.close_time}
                                    onChange={(e) => setNewSpecialHour({ ...newSpecialHour, close_time: e.target.value })}
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                                />
                            </div>
                        </>
                    )}

                    <div className={newSpecialHour.is_closed ? "lg:col-span-3" : "lg:col-span-1"}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reason (Optional)</label>
                        <input
                            type="text"
                            value={newSpecialHour.reason}
                            onChange={(e) => setNewSpecialHour({ ...newSpecialHour, reason: e.target.value })}
                            placeholder="e.g. Public Holiday"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={adding}
                            className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {adding ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {specialHours.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No special hours configured.
                        </li>
                    ) : (
                        specialHours.map((hour) => (
                            <li key={hour.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate w-32">
                                            {new Date(hour.date).toLocaleDateString()}
                                        </p>
                                        <div className="ml-0 sm:ml-4 flex-shrink-0 flex flex-col sm:flex-row">
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hour.is_closed ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' : 'bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200'
                                                }`}>
                                                {hour.is_closed ? 'Closed' : `${hour.open_time} - ${hour.close_time}`}
                                            </p>
                                            {hour.reason && (
                                                <p className="mt-1 sm:mt-0 sm:ml-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {hour.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(hour.id)}
                                            className="font-medium text-red-600 hover:text-red-500"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default SpecialHoursEditor;
