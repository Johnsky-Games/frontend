import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Report {
  id: number;
  business_id: number;
  report_type: string;
  title: string;
  description: string;
  filters: any;
  generated_by: number;
  generated_at: string;
  data: any;
}

const ReportsPage: React.FC = () => {
  const { user, business } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    // In a real app, you would fetch reports from the backend
    // For now, let's simulate with mock data
    const mockReports: Report[] = [
      {
        id: 1,
        business_id: 1,
        report_type: 'revenue',
        title: 'Monthly Revenue Report',
        description: 'Revenue generated for the month',
        filters: { from: '2023-01-01', to: '2023-01-31' },
        generated_by: 1,
        generated_at: new Date().toISOString(),
        data: { total_revenue: 12500, appointments: 150, avg_per_appointment: 83.33 }
      },
      {
        id: 2,
        business_id: 1,
        report_type: 'appointments',
        title: 'Weekly Appointment Report',
        description: 'Appointment statistics for the week',
        filters: { from: '2023-01-01', to: '2023-01-07' },
        generated_by: 1,
        generated_at: new Date().toISOString(),
        data: { total_appointments: 45, completed: 42, cancelled: 3, no_shows: 0 }
      }
    ];
    
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 500);
  }, []);

  const generateReport = () => {
    // In a real app, you would call the backend to generate a report
    // For now, we'll just simulate data
    let data;
    
    switch (reportType) {
      case 'revenue':
        data = {
          total_revenue: Math.floor(Math.random() * 10000) + 5000,
          appointments: Math.floor(Math.random() * 100) + 50,
          avg_per_appointment: Math.floor(Math.random() * 100) + 50
        };
        break;
      case 'appointments':
        data = {
          total_appointments: Math.floor(Math.random() * 100) + 20,
          completed: Math.floor(Math.random() * 90) + 15,
          cancelled: Math.floor(Math.random() * 10) + 1,
          no_shows: Math.floor(Math.random() * 5)
        };
        break;
      case 'clients':
        data = {
          new_clients: Math.floor(Math.random() * 20) + 5,
          returning_clients: Math.floor(Math.random() * 50) + 20,
          total_clients: Math.floor(Math.random() * 100) + 50
        };
        break;
      default:
        data = {};
    }
    
    setReportData(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Access Denied</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Please sign in to view reports.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
      </div>

      {/* Report Generation Panel */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Generate New Report</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Create custom reports for your business</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">
                Report Type
              </label>
              <select
                id="report-type"
                name="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="revenue">Revenue Report</option>
                <option value="appointments">Appointments Report</option>
                <option value="clients">Clients Report</option>
                <option value="services">Services Report</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="from-date" className="block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                name="from-date"
                id="from-date"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="to-date" className="block text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                name="to-date"
                id="to-date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={generateReport}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report */}
      {reportData && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Generated for {dateRange.from} to {dateRange.to}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {reportType === 'revenue' && (
                <>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">${reportData.total_revenue}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">Total Revenue</div>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">{reportData.appointments}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">Appointments</div>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">${reportData.avg_per_appointment}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">Avg per Appointment</div>
                    </div>
                  </div>
                </>
              )}
              
              {reportType === 'appointments' && (
                <>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">{reportData.total_appointments}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">Total Appointments</div>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">{reportData.completed}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">Completed</div>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">{reportData.cancelled}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">Cancelled</div>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">{reportData.no_shows}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">No Shows</div>
                    </div>
                  </div>
                </>
              )}
              
              {reportType === 'clients' && (
                <>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">{reportData.new_clients}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">New Clients</div>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">{reportData.returning_clients}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">Returning Clients</div>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="text-3xl font-semibold text-gray-900">{reportData.total_clients}</div>
                      <div className="mt-1 text-sm font-medium text-gray-500">Total Clients</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">
                  This {reportType} report shows the performance of your business from {dateRange.from} to {dateRange.to}. 
                  {reportType === 'revenue' && ` You generated $${reportData.total_revenue} in revenue from ${reportData.appointments} appointments, with an average of $${reportData.avg_per_appointment} per appointment.`}
                  {reportType === 'appointments' && ` You had ${reportData.total_appointments} appointments total, with ${reportData.completed} completed, ${reportData.cancelled} cancelled, and ${reportData.no_shows} no-shows.`}
                  {reportType === 'clients' && ` You gained ${reportData.new_clients} new clients, had ${reportData.returning_clients} returning clients, for a total of ${reportData.total_clients} clients.`}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3">
                Download Report
              </button>
              <button className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Reports */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Saved Reports</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Previously generated reports</p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-indigo-600 truncate">{report.title}</div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {report.report_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Generated: {new Date(report.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      <button className="text-gray-600 hover:text-gray-900">Download</button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{report.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;