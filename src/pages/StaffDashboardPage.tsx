import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/ApiService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Calendar, Clock, CheckCircle, TrendingUp, DollarSign,
    Award, Star, Activity, Zap, ArrowRight
} from 'lucide-react';

interface Business {
    id: number;
    name: string;
    logo: string | null;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
}

interface Staff {
    id: number;
    job_title: string;
    bio: string;
    streak: number;
}

interface Appointment {
    id: number;
    client_id: number;
    client_name: string;
    service_id: number;
    service_name: string;
    duration: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    notes: string;
    total_price: string;
}

interface Service {
    id: number;
    name: string;
    description: string;
    price: string;
    duration: number;
    image: string | null;
}

interface ChartData {
    name: string;
    date: string;
    appointments: number;
    revenue: number;
}

interface TopService {
    id: number;
    name: string;
    price: string;
    count: number;
    total_revenue: number;
}

interface DashboardStats {
    business: Business | null;
    staff: Staff;
    today: {
        total: number;
        scheduled: number;
        completed: number;
        cancelled: number;
        revenue: number;
    };
    week: {
        total: number;
        completed: number;
        revenue: number;
    };
    month: {
        total: number;
        completed: number;
        completion_rate: number;
        revenue: number;
    };
    upcoming_appointments: Appointment[];
    chart_data: ChartData[];
    top_services: TopService[];
}

const StaffDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, servicesRes] = await Promise.all([
                api.get('/staff/dashboard'),
                api.get('/staff/services')
            ]);

            setStats(statsRes.data.stats);
            setServices(servicesRes.data.services);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!stats) return null;

    const { business, staff, today, week, month, upcoming_appointments, chart_data, top_services } = stats;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Section with Business Branding */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                            {business?.logo ? (
                                <img
                                    src={business.logo}
                                    alt={business.name}
                                    className="h-16 w-16 rounded-lg object-cover shadow-md border border-gray-100"
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                                    {business?.name.charAt(0)}
                                </div>
                            )}
                            <div className="ml-4">
                                <h1 className="text-2xl font-bold text-gray-900">{business?.name}</h1>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <span className="font-medium text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full mr-2">
                                        {staff.job_title}
                                    </span>
                                    <span>Welcome back, {user?.name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex items-center">
                                <Zap className="h-5 w-5 text-orange-500 mr-2" />
                                <div>
                                    <div className="text-xs text-orange-600 font-medium uppercase tracking-wide">Streak</div>
                                    <div className="text-lg font-bold text-orange-700">{staff.streak} Days 🔥</div>
                                </div>
                            </div>
                            <Link
                                to="/staff/appointments"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                My Schedule
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Today's Performance */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="h-24 w-24 text-primary-600" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today's Focus</p>
                            <div className="mt-2 flex items-baseline">
                                <p className="text-3xl font-bold text-gray-900">{today.scheduled}</p>
                                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">appointments</p>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className={`flex items-center font-medium ${today.completed > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {today.completed} Done
                                </span>
                                <span className="mx-2 text-gray-300">|</span>
                                <span className="text-primary-600 font-medium">
                                    ${Number(today.revenue).toFixed(0)} Earned
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Revenue */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Weekly Revenue</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">${Number(week.revenue).toFixed(0)}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((week.completed / 20) * 100, 100)}%` }} // Assuming 20 apts/week goal
                                ></div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">{week.completed} appointments completed</p>
                        </div>
                    </div>

                    {/* Monthly Success */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Success Rate</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{month.completion_rate}%</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full">
                                <Award className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="text-green-600 font-medium">Excellent!</span> Keep it up.
                        </p>
                    </div>

                    {/* Total Clients/Impact */}
                    <div className="bg-gradient-to-br from-purple-600 to-primary-700 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-purple-100 uppercase tracking-wider">Monthly Impact</p>
                            <p className="mt-2 text-3xl font-bold">{month.total}</p>
                            <p className="text-sm text-purple-100">Clients Served</p>
                            <div className="mt-4 flex items-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                                <Star className="h-4 w-4 text-yellow-300 mr-2" />
                                <span className="text-sm font-medium">Top Rated Pro</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-20">
                            <Award className="h-32 w-32" />
                        </div>
                    </div>
                </div>

                {/* Legacy Stats Grid (Restored by Request) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Today's Stats */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-primary-500">
                        <div className="px-4 py-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Clock className="h-8 w-8 text-primary-500" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500">Hoy</div>
                                    <div className="text-2xl font-bold text-gray-900">{today.total}</div>
                                    <div className="text-xs text-gray-500">
                                        {today.completed} completadas
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* This Week */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-green-500">
                        <div className="px-4 py-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Calendar className="h-8 w-8 text-green-500" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500">Esta Semana</div>
                                    <div className="text-2xl font-bold text-gray-900">{week.total}</div>
                                    <div className="text-xs text-gray-500">
                                        {week.completed} completadas
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* This Month */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-purple-500">
                        <div className="px-4 py-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Activity className="h-8 w-8 text-purple-500" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500">Este Mes</div>
                                    <div className="text-2xl font-bold text-gray-900">{month.total}</div>
                                    <div className="text-xs text-gray-500">
                                        {month.completed} completadas
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg border-l-4 border-yellow-500">
                        <div className="px-4 py-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Award className="h-8 w-8 text-yellow-500" />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-500">Tasa de Completación</div>
                                    <div className="text-2xl font-bold text-gray-900">{month.completion_rate}%</div>
                                    <div className="text-xs text-gray-500">
                                        Este mes
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Activity Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
                                Activity & Revenue Trend
                            </h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Last 7 Days</div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chart_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} hide />
                                    <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#4F46E5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        name="Revenue ($)"
                                    />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="appointments"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        fill="none"
                                        name="Appointments"
                                        dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Services */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <Star className="h-5 w-5 text-yellow-500 mr-2" />
                            Top Services
                        </h2>
                        <div className="space-y-6">
                            {top_services.map((service, index) => (
                                <div key={service.id} className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900 flex items-center">
                                            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs mr-3 font-bold">
                                                {index + 1}
                                            </span>
                                            {service.name}
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">${Number(service.total_revenue).toFixed(0)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-primary-500 h-2 rounded-full"
                                            style={{ width: `${(service.count / top_services[0].count) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 text-right">
                                        {service.count} appointments
                                    </div>
                                </div>
                            ))}
                            {top_services.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No service data available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upcoming Appointments */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Upcoming Appointments</h2>
                            <Link to="/staff/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                                View All <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {upcoming_appointments.length > 0 ? (
                                upcoming_appointments.map((apt) => (
                                    <div key={apt.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 font-bold text-lg">
                                                    {apt.client_name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-900">{apt.client_name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{apt.service_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 flex items-center justify-end">
                                                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                                    {formatTime(apt.start_time)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(apt.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No upcoming appointments scheduled.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Services Quick View */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">My Services</h2>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {services.map((service) => (
                                <div key={service.id} className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-secondary-100 hover:bg-secondary-50 transition-all">
                                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                                        {service.image ? (
                                            <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-secondary-100 text-secondary-500">
                                                <Star className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                                        <p className="text-xs text-gray-500">{service.duration} mins</p>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">${service.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StaffDashboardPage;
