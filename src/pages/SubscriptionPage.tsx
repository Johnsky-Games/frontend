import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import ApiService from '../services/ApiService';
import { useAuth } from '../context/AuthContext';

interface SubscriptionPlan {
    id: number;
    name: string;
    price: string;
    duration_months: number;
    trial_days: number;
    features: string[];
    is_active: boolean;
}

interface Subscription {
    id: number;
    plan_id: number;
    status: 'active' | 'trial' | 'expired' | 'cancelled';
    start_date: string;
    end_date: string;
    auto_renew: boolean;
    plan_name: string;
    price: string;
}

const SubscriptionPage: React.FC = () => {
    const { user, business } = useAuth();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        try {
            setLoading(true);

            // Fetch plans first
            const plansRes = await ApiService.get('/subscriptions/plans');
            setPlans(plansRes.data.data || []);

            // Try to fetch current subscription
            const subRes = await ApiService.get('/subscriptions/current');
            setCurrentSubscription(subRes.data.data || null);
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            toast.error('Failed to load subscription details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId: number) => {
        try {
            setProcessing(true);
            // In a real app, this would redirect to a payment gateway (Stripe, etc.)
            // For now, we'll simulate a successful subscription

            await ApiService.post('/subscriptions/subscribe', { plan_id: planId });

            toast.success('Subscription updated successfully!');
            fetchSubscriptionData();
        } catch (error: any) {
            console.error('Error subscribing:', error);
            toast.error(error.response?.data?.message || 'Failed to update subscription');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        const result = await Swal.fire({
            title: 'Cancel Subscription?',
            text: 'Are you sure you want to cancel your subscription? You will lose access to premium features after the current period ends.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setProcessing(true);
            await ApiService.post('/subscriptions/cancel', {});
            toast.success('Subscription cancelled successfully');
            fetchSubscriptionData();
        } catch (error: any) {
            console.error('Error cancelling subscription:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel subscription');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Simple, transparent pricing
                </h2>
                <p className="mt-4 text-xl text-gray-500">
                    Choose the plan that best fits your business needs.
                </p>
            </div>

            {/* Current Subscription Status */}
            {currentSubscription && (
                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg max-w-3xl mx-auto">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Current Subscription
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Your plan details and status.
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentSubscription.status === 'active' ? 'bg-green-100 text-green-800' :
                            currentSubscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                                currentSubscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {currentSubscription.status.toUpperCase()}
                        </span>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-gray-200">
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {currentSubscription.plan_name}
                                </dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Valid Until</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {new Date(currentSubscription.end_date).toLocaleDateString()}
                                </dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Auto Renewal</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {currentSubscription.auto_renew ? 'On' : 'Off'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
                        {currentSubscription.status !== 'cancelled' && currentSubscription.status !== 'expired' && (
                            <button
                                onClick={handleCancel}
                                disabled={processing}
                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                            >
                                Cancel Subscription
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                {plans.map((plan) => (
                    <div key={plan.id} className={`border rounded-lg shadow-sm divide-y divide-gray-200 bg-white flex flex-col ${currentSubscription?.plan_id === plan.id ? 'ring-2 ring-indigo-500' : ''
                        }`}>
                        <div className="p-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h2>
                            <p className="mt-4">
                                <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                                <span className="text-base font-medium text-gray-500">/{plan.duration_months === 1 ? 'mo' : 'yr'}</span>
                            </p>
                            {plan.trial_days > 0 && (
                                <p className="mt-1 text-sm text-indigo-600 font-semibold">
                                    {plan.trial_days}-day free trial
                                </p>
                            )}
                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={processing || currentSubscription?.plan_id === plan.id}
                                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${currentSubscription?.plan_id === plan.id
                                    ? 'bg-indigo-50 text-indigo-700 cursor-default'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                {currentSubscription?.plan_id === plan.id ? 'Current Plan' : 'Select Plan'}
                            </button>
                        </div>
                        <div className="pt-6 pb-8 px-6 flex-grow">
                            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                            <ul className="mt-6 space-y-4">
                                {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                                    <li key={index} className="flex space-x-3">
                                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                                        <span className="text-sm text-gray-500">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPage;
