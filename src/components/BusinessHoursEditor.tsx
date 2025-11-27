import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface DayHours {
    enabled: boolean;
    open: string | null;
    close: string | null;
}

interface BusinessHours {
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
}

interface BusinessHoursEditorProps {
    initialHours?: BusinessHours;
    onSave: (hours: BusinessHours) => Promise<void>;
    loading?: boolean;
}

const defaultHours: BusinessHours = {
    monday: { enabled: true, open: '09:00', close: '18:00' },
    tuesday: { enabled: true, open: '09:00', close: '18:00' },
    wednesday: { enabled: true, open: '09:00', close: '18:00' },
    thursday: { enabled: true, open: '09:00', close: '18:00' },
    friday: { enabled: true, open: '09:00', close: '18:00' },
    saturday: { enabled: true, open: '09:00', close: '18:00' },
    sunday: { enabled: false, open: null, close: null }
};

const dayNames: (keyof BusinessHours)[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

const dayLabels: Record<keyof BusinessHours, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
};

const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({
    initialHours,
    onSave,
    loading = false
}) => {
    const [hours, setHours] = useState<BusinessHours>(initialHours || defaultHours);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialHours) {
            setHours(initialHours);
        }
    }, [initialHours]);

    const validateTimeRange = (day: keyof BusinessHours): boolean => {
        const dayHours = hours[day];
        if (!dayHours.enabled) return true;

        if (!dayHours.open || !dayHours.close) {
            setErrors(prev => ({ ...prev, [day]: 'Both open and close times are required' }));
            return false;
        }

        const [openHour, openMin] = dayHours.open.split(':').map(Number);
        const [closeHour, closeMin] = dayHours.close.split(':').map(Number);

        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        if (openMinutes >= closeMinutes) {
            setErrors(prev => ({ ...prev, [day]: 'Open time must be before close time' }));
            return false;
        }

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[day];
            return newErrors;
        });
        return true;
    };

    const handleToggleDay = (day: keyof BusinessHours) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                enabled: !prev[day].enabled,
                open: !prev[day].enabled ? '09:00' : null,
                close: !prev[day].enabled ? '18:00' : null
            }
        }));
    };

    const handleTimeChange = (day: keyof BusinessHours, field: 'open' | 'close', value: string) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    const handleCopyToAll = () => {
        const mondayHours = hours.monday;
        const newHours = { ...hours };

        dayNames.forEach(day => {
            if (day !== 'monday') {
                newHours[day] = { ...mondayHours };
            }
        });

        setHours(newHours);
        toast.success('Monday hours copied to all days');
    };

    const handleReset = () => {
        setHours(defaultHours);
        setErrors({});
        toast.info('Hours reset to default');
    };

    const handleSave = async () => {
        // Validate all enabled days
        let isValid = true;
        dayNames.forEach(day => {
            if (!validateTimeRange(day)) {
                isValid = false;
            }
        });

        // Check if at least one day is enabled
        const hasEnabledDay = dayNames.some(day => hours[day].enabled);
        if (!hasEnabledDay) {
            toast.error('At least one day must be enabled');
            return;
        }

        if (!isValid) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        try {
            setSaving(true);
            await onSave(hours);
            toast.success('Business hours updated successfully!');
        } catch (error: any) {
            console.error('Save hours error:', error);
            toast.error(error.response?.data?.message || 'Failed to save business hours');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Business Hours
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    Set your operating hours for each day of the week. Clients can only book appointments during these hours.
                </p>

                <div className="space-y-3">
                    {dayNames.map(day => (
                        <div key={day} className="flex items-center gap-4 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                            {/* Enable/Disable Toggle */}
                            <div className="flex items-center w-32">
                                <input
                                    type="checkbox"
                                    id={`${day}-enabled`}
                                    checked={hours[day].enabled}
                                    onChange={() => handleToggleDay(day)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`${day}-enabled`} className="ml-2 text-sm font-medium text-gray-700">
                                    {dayLabels[day]}
                                </label>
                            </div>

                            {/* Time Inputs */}
                            {hours[day].enabled ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="time"
                                        value={hours[day].open || ''}
                                        onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                                        onBlur={() => validateTimeRange(day)}
                                        className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="time"
                                        value={hours[day].close || ''}
                                        onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                                        onBlur={() => validateTimeRange(day)}
                                        className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {errors[day] && (
                                        <span className="text-sm text-red-600">{errors[day]}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 text-sm text-gray-500 italic">
                                    Closed
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleCopyToAll}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Copy Monday to All Days
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Reset to Default
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Business Hours'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusinessHoursEditor;
