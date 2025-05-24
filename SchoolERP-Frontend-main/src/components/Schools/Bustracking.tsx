import React, { useState } from 'react';
import { BusTrackingProvider } from './BusTrackingContext';
import BusFleetManagement from './BusFleetManagement';
import BusRouteTracking from './BusRouteTracking';
import DriverManagement from './DriverManagement';
import MaintenanceManagement from './MaintenanceManagement';
import TripSchedule from './TripSchedule';
import StudentAllocation from './StudentAllocation';
import { 
  MapPin, Bus, Route, User, FileText, Wrench, Calendar, AlertTriangle
} from 'lucide-react';

// Define the tabs for the bus tracking system
interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const BusTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Define tabs - only keeping the ones requested
  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <FileText className="h-5 w-5" /> },
    { id: 'fleet', label: 'Fleet Management', icon: <Bus className="h-5 w-5" /> },
    { id: 'routes', label: 'Routes & Tracking', icon: <Route className="h-5 w-5" /> },
    { id: 'drivers', label: 'Drivers', icon: <User className="h-5 w-5" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="h-5 w-5" /> },
    { id: 'schedule', label: 'Trip Schedule', icon: <Calendar className="h-5 w-5" /> },
    { id: 'students', label: 'Student Allocation', icon: <User className="h-5 w-5" /> },
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <BusTrackingDashboard />;
      case 'fleet':
        return <BusFleetManagement />;
      case 'routes':
        return <BusRouteTracking />;
      case 'drivers':
        return <DriverManagement />;
      case 'maintenance':
        return <MaintenanceManagement />;
      case 'schedule':
        return <TripSchedule />;
      case 'students':
        return <StudentAllocation />;
      default:
        return <BusTrackingDashboard />;
    }
  };

  return (
    <BusTrackingProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Bus className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Bus Tracking System</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  Live Tracking
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Top Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-4 text-sm font-medium border-b-2 flex items-center mx-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderTabContent()}
        </main>
      </div>
    </BusTrackingProvider>
  );
};

// Leave the existing BusTrackingDashboard component as is
const BusTrackingDashboard: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Bus className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Buses</h3>
              <p className="text-3xl font-bold text-gray-700">24</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Buses: 26</span>
              <span className="text-green-500">92% Active</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div className="h-full rounded-full bg-green-500" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Route className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Routes</h3>
              <p className="text-3xl font-bold text-gray-700">18</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">On-time Performance</span>
              <span className="text-sm font-medium text-green-500">96%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div className="h-full rounded-full bg-green-500" style={{ width: '96%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Students Transported</h3>
              <p className="text-3xl font-bold text-gray-700">842</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Capacity</span>
              <span className="text-sm font-medium text-purple-500">1,040</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div className="h-full rounded-full bg-purple-500" style={{ width: '81%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Trips */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Trips</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ETA
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KA-01-MX-1234
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      North Route
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        On Schedule
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      8:15 AM
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KA-01-MX-5678
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      South Route
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Delayed (5 min)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      8:20 AM
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KA-01-MX-9101
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      East Route
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        On Schedule
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      8:30 AM
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Maintenance Alerts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-red-50 rounded-lg">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">KA-01-MX-9012 - Brake System Repair</h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>Scheduled for completion on Sep 20, 2023. Currently in service center.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">KA-01-MX-4567 - Oil Change Due</h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>Due in 3 days. 4,500 km since last service.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">KA-01-MX-7890 - Tire Replacement</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>Scheduled for Sep 25, 2023. Front tires showing signs of wear.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bus className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Bus KA-01-MX-1234 started morning route</p>
                <p className="text-sm text-gray-500">Today at 6:45 AM</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Bus KA-01-MX-5678 serviced</p>
                <p className="text-sm text-gray-500">Yesterday at 5:30 PM</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Trip scheduled for Special Event</p>
                <p className="text-sm text-gray-500">Yesterday at 2:15 PM</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BusTracking;