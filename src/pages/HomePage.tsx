import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import api from '../services/ApiService';
import { Star, Calendar, Search, TrendingUp, Shield, Clock, MapPin } from 'lucide-react';

interface TopBusiness {
  id: number;
  name: string;
  appointments: number;
  revenue: number;
  // Add other fields if available from getTopPerformers or join
  logo?: string;
  city?: string;
  average_rating?: number;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [topBusinesses, setTopBusinesses] = useState<TopBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopBusinesses = async () => {
      try {
        const response = await api.get('/businesses/top-performers?limit=3');
        if (response.data.code === 'SUCCESS') {
          setTopBusinesses(response.data.businesses);
        }
      } catch (error) {
        console.error('Failed to fetch top businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBusinesses();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section - Dual Focus */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white dark:bg-gray-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28 fade-in">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block">Discover & Book</span>
                  <span className="block text-indigo-600 dark:text-indigo-400">The Best Beauty Services</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Whether you're looking for a fresh cut or managing a bustling salon, BeautySalon is your go-to platform. Connect, book, and grow.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start space-x-4">
                  <Link to="/businesses" className="no-underline">
                    <Button variant="primary" size="lg" className="w-full md:w-auto flex items-center justify-center gap-2">
                      <Search className="w-5 h-5" />
                      Find a Salon
                    </Button>
                  </Link>
                  <Link to="/register?role=business_owner" className="no-underline">
                    <Button variant="outline" size="lg" className="w-full md:w-auto">
                      List Your Business
                    </Button>
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Modern beauty salon interior"
          />
          <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply lg:hidden"></div>
        </div>
      </div>

      {/* Dynamic Top Performers Section */}
      <div className="py-12 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Popular Salons Near You
            </h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
              Discover the top-rated beauty destinations loved by our community.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : topBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {topBusinesses.map((business) => (
                <Link key={business.id} to={`/businesses/${business.id}`} className="group block">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                      {/* Placeholder for business image if not available in top performers response */}
                      <img
                        src={`https://source.unsplash.com/random/800x600/?salon,beauty,${business.id}`}
                        alt={business.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">4.9</span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {business.name}
                      </h3>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{business.city || 'City Center'}</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {business.appointments} bookings this month
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm flex items-center">
                          Book Now <TrendingUp className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No top businesses found yet. Be the first to join!</p>
              <Link to="/register?role=business_owner" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 font-medium">
                Register your business &rarr;
              </Link>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/businesses">
              <Button variant="outline" size="lg">View All Salons</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Value Proposition - For Clients */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-6">
                For Clients: <br />
                <span className="text-indigo-600 dark:text-indigo-400">Beauty at your fingertips</span>
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
                Say goodbye to phone calls and waiting on hold. Find the perfect stylist, barber, or esthetician and book instantly, 24/7.
              </p>

              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                      <Search className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Discover Local Gems</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Browse photos, read verified reviews, and find the best professionals in your area.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                      <Calendar className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Book Anytime</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      View real-time availability and book your appointment in seconds, even after hours.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                      <Star className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Manage Favorites</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Save your favorite salons and rebook with a single click.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transform skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Client booking on phone"
                className="relative rounded-3xl shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition - For Business Owners */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-l from-indigo-500 to-pink-600 transform -skew-y-6 sm:skew-y-0 sm:rotate-6 sm:rounded-3xl opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Business dashboard"
                className="relative rounded-3xl shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
            <div className="order-1 lg:order-2 mt-10 lg:mt-0">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-6">
                For Owners: <br />
                <span className="text-indigo-600 dark:text-indigo-400">Streamline your business</span>
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
                Take control of your schedule, clients, and revenue with our powerful all-in-one management platform.
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reduce No-Shows</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Automated reminders and confirmation emails keep your schedule full and efficient.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Business Insights</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Track revenue, popular services, and staff performance with detailed analytics.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">24/7 Booking</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Let clients book while you sleep. Your calendar fills up automatically.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link to="/register?role=business_owner">
                  <Button variant="primary" size="lg">Start Your Free Trial</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700 dark:bg-indigo-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-200">Join thousands of happy users today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 gap-4">
            <div className="inline-flex rounded-md shadow">
              <Link to="/register" className="no-underline">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Sign Up Now
                </Button>
              </Link>
            </div>
            <div className="inline-flex rounded-md shadow">
              <Link to="/login" className="no-underline">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white border-white hover:bg-indigo-600"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default HomePage;