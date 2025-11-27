import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Download, Users, Building, CreditCard, TrendingUp, Calendar, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import AccessDenied from '../components/AccessDenied';

interface SystemOverview {
    total_users: number;
    total_businesses: number;
    active_subscriptions: number;
    total_revenue: number;
    total_appointments: number;
    avg_revenue_per_user: number;
}

interface GrowthData {
    date: string;
    count: number;
}

interface RevenueData {
    plan_type: string;
    total: number;
    [key: string]: any;
}

interface TopBusiness {
    id: number;
    name: string;
    total_paid?: number;
    average_rating?: number;
    review_count?: number;
}

interface AppointmentStats {
    breakdown: { status: string; count: number }[];
    total: number;
    completion_rate: number;
}

interface SubscriptionStats {
    status_distribution: { status: string; count: number }[];
    plan_distribution: { plan_type: string; count: number }[];
    churn_rate: number;
}

interface ServiceStats {
    categories: { category: string; count: number }[];
}

const AdminReportsPage: React.FC = () => {
    const [overview, setOverview] = useState<SystemOverview | null>(null);
    const [growthData, setGrowthData] = useState<{ users: GrowthData[], businesses: GrowthData[] }>({ users: [], businesses: [] });
    const [revenueData, setRevenueData] = useState<{ by_plan: RevenueData[], over_time: any[] }>({ by_plan: [], over_time: [] });
    const [topBusinesses, setTopBusinesses] = useState<{ by_revenue: TopBusiness[], by_rating: TopBusiness[] }>({ by_revenue: [], by_rating: [] });
    const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
    const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);
    const [serviceStats, setServiceStats] = useState<ServiceStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30_days');

    const { hasPermission, isMainAdmin } = usePermissions();

    useEffect(() => {
        if (isMainAdmin() || hasPermission('view_reports')) {
            fetchAllData();
        } else {
            setLoading(false);
        }
    }, [period]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [overviewRes, growthRes, revenueRes, topRes, apptRes, subRes, servRes] = await Promise.all([
                ApiService.get('/admin/reports/overview'),
                ApiService.get(`/admin/reports/growth?period=${period}`),
                ApiService.get('/admin/reports/revenue'),
                ApiService.get('/admin/reports/top-businesses'),
                ApiService.get('/admin/reports/appointments'),
                ApiService.get('/admin/reports/subscriptions'),
                ApiService.get('/admin/reports/services')
            ]);

            setOverview(overviewRes.data.data);
            setGrowthData(growthRes.data.data);
            setRevenueData(revenueRes.data.data);
            setTopBusinesses(topRes.data.data);
            setAppointmentStats(apptRes.data.data);
            setSubscriptionStats(subRes.data.data);
            setServiceStats(servRes.data.data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const rows = [
            // Header
            ['ADMIN SYSTEM REPORT'],
            [`Generated: ${new Date().toLocaleString()}`],
            [`Period: ${period}`],
            [],

            // Overview Metrics
            ['OVERVIEW METRICS'],
            ['Metric', 'Value'],
            ['Total Users', overview?.total_users || 0],
            ['Total Businesses', overview?.total_businesses || 0],
            ['Active Subscriptions', overview?.active_subscriptions || 0],
            ['Total Revenue', `$${overview?.total_revenue?.toFixed(2) || 0}`],
            ['Total Appointments', overview?.total_appointments || 0],
            ['Avg Revenue per User', `$${overview?.avg_revenue_per_user?.toFixed(2) || 0}`],
            ['Completion Rate', `${appointmentStats?.completion_rate?.toFixed(1) || 0}%`],
            ['Churn Rate', `${subscriptionStats?.churn_rate?.toFixed(1) || 0}%`],
            [],

            // Appointment Status Breakdown
            ['APPOINTMENT STATUS BREAKDOWN'],
            ['Status', 'Count'],
            ...(appointmentStats?.breakdown.map(item => [item.status, item.count]) || []),
            [],

            // Subscription Status Distribution
            ['SUBSCRIPTION STATUS DISTRIBUTION'],
            ['Status', 'Count'],
            ...(subscriptionStats?.status_distribution.map(item => [item.status, item.count]) || []),
            [],

            // Subscription Plan Distribution
            ['SUBSCRIPTION PLAN DISTRIBUTION'],
            ['Plan Type', 'Count'],
            ...(subscriptionStats?.plan_distribution.map(item => [item.plan_type, item.count]) || []),
            [],

            // Service Categories
            ['TOP SERVICE CATEGORIES'],
            ['Category', 'Count'],
            ...(serviceStats?.categories.map(item => [item.category, item.count]) || []),
            [],

            // User Growth Trend
            ['USER GROWTH TREND'],
            ['Date', 'New Users'],
            ...growthData.users.map(item => [new Date(item.date).toLocaleDateString(), item.count]),
            [],

            // Business Growth Trend
            ['BUSINESS GROWTH TREND'],
            ['Date', 'New Businesses'],
            ...growthData.businesses.map(item => [new Date(item.date).toLocaleDateString(), item.count]),
            [],

            // Revenue Over Time
            ['REVENUE TREND (12 MONTHS)'],
            ['Date', 'Revenue'],
            ...revenueData.over_time.map(item => [new Date(item.date).toLocaleDateString(), `$${item.total?.toFixed(2) || 0}`]),
            [],

            // Revenue by Plan
            ['REVENUE BY PLAN'],
            ['Plan Type', 'Total Revenue'],
            ...revenueData.by_plan.map(item => [item.plan_type, `$${item.total?.toFixed(2) || 0}`]),
            [],

            // Top Businesses by Revenue
            ['TOP BUSINESSES BY REVENUE'],
            ['Rank', 'Business Name', 'Total Paid'],
            ...topBusinesses.by_revenue.map((b, index) => [index + 1, b.name, `$${b.total_paid?.toFixed(2) || 0}`]),
            [],

            // Top Businesses by Rating
            ['TOP RATED BUSINESSES'],
            ['Rank', 'Business Name', 'Average Rating', 'Review Count'],
            ...topBusinesses.by_rating.map((b, index) => [index + 1, b.name, b.average_rating?.toFixed(1) || 0, b.review_count || 0])
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => Array.isArray(e) ? e.join(",") : e).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `admin_system_report_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isMainAdmin() && !hasPermission('view_reports')) {
        return <AccessDenied requiredPermission="view_reports" />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
                    <p className="mt-1 text-sm text-gray-500">Real-time insights into platform performance and growth</p>
                </div>
                <div className="flex space-x-4">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    >
                        <option value="7_days">Last 7 Days</option>
                        <option value="30_days">Last 30 Days</option>
                        <option value="90_days">Last 90 Days</option>
                        <option value="1_year">Last Year</option>
                    </select>
                    <button
                        onClick={exportToCSV}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Total Revenue */}
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                                <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">${overview?.total_revenue?.toLocaleString()}</dd>
                                    <dd className="text-xs text-green-600 mt-1 flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-1" /> +12.5% from last month
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Appointments */}
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Appointments</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{overview?.total_appointments?.toLocaleString()}</dd>
                                    <dd className="text-xs text-gray-500 mt-1">
                                        {appointmentStats?.completion_rate.toFixed(1)}% completion rate
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Subscriptions */}
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                                <Activity className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">{overview?.active_subscriptions}</dd>
                                    <dd className="text-xs text-gray-500 mt-1">
                                        {subscriptionStats?.churn_rate.toFixed(1)}% churn rate
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Users & Businesses */}
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 rounded-md bg-orange-100">
                                <Users className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Users / Businesses</dt>
                                    <dd className="text-2xl font-semibold text-gray-900">
                                        {overview?.total_users} <span className="text-sm text-gray-400">/</span> {overview?.total_businesses}
                                    </dd>
                                    <dd className="text-xs text-gray-500 mt-1">
                                        ${overview?.avg_revenue_per_user?.toFixed(2)} avg revenue/user
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section 1: Growth & Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Growth Chart */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Platform Growth</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData.users}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorBusiness" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                                <Legend />
                                <Area type="monotone" dataKey="count" name="Users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" data={growthData.businesses} dataKey="count" name="Businesses" stroke="#82ca9d" fillOpacity={1} fill="url(#colorBusiness)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Trend (12 Months)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData.over_time}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short' })} />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                                <Legend />
                                <Bar dataKey="total" name="Revenue" fill="#00C49F" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Section 2: Distributions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Appointment Status */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Appointment Status</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={appointmentStats?.breakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {appointmentStats?.breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subscription Plans */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Subscription Plans</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={subscriptionStats?.plan_distribution}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="plan_type"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    {subscriptionStats?.plan_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Categories */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Service Categories</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={serviceStats?.categories.slice(0, 5)}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" name="Services" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Businesses Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* By Revenue */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Top Businesses by Revenue</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topBusinesses.by_revenue.map((business, index) => (
                                    <tr key={business.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{business.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">${business.total_paid?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* By Rating */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Top Rated Businesses</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topBusinesses.by_rating.map((business, index) => (
                                    <tr key={business.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{business.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                            <div className="flex items-center justify-end">
                                                <span className="mr-1">{business.average_rating?.toFixed(1)}</span>
                                                <span className="text-xs text-gray-400">({business.review_count})</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReportsPage;
