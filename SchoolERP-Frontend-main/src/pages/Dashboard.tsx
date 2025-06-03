import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, AlertCircle, TrendingUp, Bell, PieChart, 
  GraduationCap, FileText, School, MapPin,
  Truck, DollarSign, UserPlus, FileX, Minus, User, Plus,
  Activity, BarChart3, ArrowUp, ArrowDown, Zap, Calendar, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  PieChart as RechartsPieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { dashboardService, formatCurrency, formatNumber, getRelativeTime } from '../services/dashboardService';
import type { DashboardStats, FeeAnalytics, QuickAccessData } from '../services/dashboardService';

// Icon mapping for quick access shortcuts
const iconMap: { [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>> } = {
  UserPlus: UserPlus,
  FileText: FileText,
  FileX: FileX,
  Truck: Truck,
  MapPin: MapPin,
  GraduationCap: GraduationCap,
  User: User,
  Users: Users,
  DollarSign: DollarSign,
  CreditCard: CreditCard,
  Minus: Minus,
  Plus: Plus,
  Activity: Activity,
  BarChart3: BarChart3,
  Calendar: Calendar,
  Clock: Clock,
  School: School
};

// Enhanced color scheme
const THEME_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981', 
  accent: '#8b5cf6',
  warning: '#f97316',
  error: '#ef4444',
  success: '#22c55e',
  info: '#06b6d4',
  slate: '#64748b',
  emerald: '#059669',
  violet: '#7c3aed',
  rose: '#e11d48',
  amber: '#d97706'
};

const SmartSchoolDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'6months' | '12months'>('12months');
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [feeAnalytics, setFeeAnalytics] = useState<FeeAnalytics | null>(null);
  const [quickAccessData, setQuickAccessData] = useState<QuickAccessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load fee analytics when timeframe changes
  useEffect(() => {
    if (!isLoading && dashboardData) {
      loadFeeAnalytics();
    }
  }, [timeframe]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [stats, analytics, quickAccess] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getFeeAnalytics(timeframe),
        dashboardService.getQuickAccessData()
      ]);

      setDashboardData(stats);
      setFeeAnalytics(analytics);
      setQuickAccessData(quickAccess);
    } catch (err: unknown) {
      console.error('Failed to load dashboard data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeeAnalytics = async () => {
    try {
      const analytics = await dashboardService.getFeeAnalytics(timeframe);
      setFeeAnalytics(analytics);
    } catch (err: unknown) {
      console.error('Failed to load fee analytics:', err);
    }
  };

  const handleQuickAccessClick = (route: string) => {
    navigate(route);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.4 }
    })
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Smart Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load dashboard data'}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { school, overview, financial, recentActivities } = dashboardData;

  // Prepare statistics cards
  const mainStats = [
    {
      name: 'Total Students',
      value: formatNumber(overview.totalStudents),
      icon: Users,
      trend: `${overview.activeStudents} active`,
      color: THEME_COLORS.primary,
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Total Teachers',
      value: formatNumber(overview.totalTeachers),
      icon: GraduationCap,
      trend: `${overview.activeTeachers} active`,
      color: THEME_COLORS.emerald,
      bgColor: 'bg-emerald-50'
    },
    {
      name: 'Fees Collected',
      value: formatCurrency(financial.totalFeesCollected),
      icon: CreditCard,
      trend: 'This period',
      color: THEME_COLORS.success,
      bgColor: 'bg-green-50'
    },
    {
      name: 'Amount Pending',
      value: formatCurrency(financial.totalFeesPending),
      icon: AlertCircle,
      trend: 'Outstanding',
      color: THEME_COLORS.warning,
      bgColor: 'bg-orange-50'
    }
  ];

  const transportStats = [
    {
      name: 'Total Vehicles',
      value: formatNumber(overview.totalVehicles),
      icon: Truck,
      color: THEME_COLORS.violet,
      bgColor: 'bg-violet-50'
    },
    {
      name: 'Total Drivers',
      value: formatNumber(overview.totalDrivers),
      icon: User,
      color: THEME_COLORS.slate,
      bgColor: 'bg-slate-50'
    },
    {
      name: 'Transport Routes',
      value: formatNumber(overview.totalRoutes),
      icon: MapPin,
      color: THEME_COLORS.rose,
      bgColor: 'bg-rose-50'
    },
    {
      name: 'Net Income',
      value: formatCurrency(financial.netIncome),
      icon: TrendingUp,
      color: financial.netIncome >= 0 ? THEME_COLORS.success : THEME_COLORS.error,
      bgColor: financial.netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <School className="h-10 w-10 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{school.name}</h1>
              <p className="mt-2 text-gray-600">
                Welcome back! Here's your School overview for {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Statistics Cards */}
      <motion.div 
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {mainStats.map((stat, index) => (
          <motion.div 
            key={stat.name} 
            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4`}
            style={{ borderColor: stat.color }}
            variants={cardVariants}
            custom={index}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center">
              <div className={`rounded-xl p-4 ${stat.bgColor}`}>
                <stat.icon className="h-8 w-8" style={{ color: stat.color }} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Secondary Statistics */}
      <motion.div 
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
        }}
      >
        {transportStats.map((stat, index) => (
          <motion.div 
            key={stat.name} 
            className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border-l-4`}
            style={{ borderColor: stat.color }}
            variants={cardVariants}
            custom={index}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-medium text-gray-500">{stat.name}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
        }}
      >
        {/* Fee Collection Chart */}
        {feeAnalytics && (
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6"
            variants={cardVariants}
            custom={0}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Fee Collection Trends</h2>
              </div>
              <select 
                className="text-sm border rounded-lg px-3 py-2 border-gray-300"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as '6months' | '12months')}
              >
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={feeAnalytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis tickFormatter={(value) => formatCurrency(value).replace('₹', '')} stroke="#64748b" />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    stackId="1"
                    stroke={THEME_COLORS.success} 
                    fill={THEME_COLORS.success}
                    fillOpacity={0.6}
                    name="Collected" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stackId="2"
                    stroke={THEME_COLORS.warning} 
                    fill={THEME_COLORS.warning}
                    fillOpacity={0.6}
                    name="Pending" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Class-wise Distribution */}
        {feeAnalytics && (
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6"
            variants={cardVariants}
            custom={1}
          >
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Class-wise Fee Distribution</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={feeAnalytics.classWiseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}: {name: string; percent: number}) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {feeAnalytics.classWiseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(THEME_COLORS)[index % Object.values(THEME_COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Access Shortcuts */}
      {quickAccessData && (
        <motion.div 
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05, delayChildren: 0.4 } }
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {quickAccessData.shortcuts.map((shortcut, index) => {
              const IconComponent = iconMap[shortcut.icon] || Plus;
              return (
                <motion.button
                  key={shortcut.name}
                  onClick={() => handleQuickAccessClick(shortcut.route)}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 text-center group border border-gray-100 hover:border-blue-200"
                  variants={cardVariants}
                  custom={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <div className="bg-blue-50 group-hover:bg-blue-100 rounded-lg p-3 mx-auto w-fit mb-3 transition-colors">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    {shortcut.count !== null && shortcut.count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {shortcut.count > 99 ? '99+' : shortcut.count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {shortcut.name}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Activities & Summary */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } }
        }}
      >
        {/* Recent Activities */}
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6"
          variants={cardVariants}
          custom={0}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivities.slice(0, 5).map((activity, index) => {
              const IconComponent = iconMap[activity.icon] || Bell;
              return (
                <motion.div 
                  key={activity.id} 
                  className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                >
                  <div className="bg-blue-100 rounded-full p-2">
                    <IconComponent className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{getRelativeTime(activity.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Financial Summary */}
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6"
          variants={cardVariants}
          custom={1}
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Financial Summary</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Fees Collected</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(financial.totalFeesCollected)}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(financial.totalFeesPending)}</p>
              </div>
              <ArrowDown className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(financial.totalExpenses)}</p>
              </div>
              <Minus className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-100 rounded-lg border-t-2 border-slate-300">
              <div>
                <p className="text-sm text-gray-600">Net Income</p>
                <p className={`text-2xl font-bold ${financial.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financial.netIncome)}
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${financial.netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SmartSchoolDashboard;