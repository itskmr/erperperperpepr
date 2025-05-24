import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Phone, Settings, Calendar, Download, RefreshCw, Trash2, Plus, Search } from 'lucide-react';

// Enhanced types for notification system
interface NotificationSetting {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  description: string;
  recipients: 'student' | 'parent' | 'both';
  events: string[];
}

interface NotificationLog {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  message: string;
  category: 'payment' | 'reminder' | 'receipt' | 'overdue';
  studentName?: string;
  studentId?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  subject?: string;
  content: string;
  variables: string[];
  category: 'payment' | 'reminder' | 'receipt' | 'overdue';
}

const NotificationsManager: React.FC = () => {
  // States for notification components
  const [activeTab, setActiveTab] = useState('settings');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<NotificationTemplate>>({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    variables: [],
    category: 'payment'
  });

  // Sample data
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      type: 'email',
      enabled: true,
      frequency: 'weekly',
      description: 'Email notifications for upcoming fee payments',
      recipients: 'both',
      events: ['payment_due', 'payment_received', 'payment_overdue']
    },
    {
      id: '2',
      type: 'sms',
      enabled: true,
      frequency: 'monthly',
      description: 'SMS reminders for due payments',
      recipients: 'student',
      events: ['payment_due', 'payment_overdue']
    },
    {
      id: '3',
      type: 'whatsapp',
      enabled: false,
      frequency: 'daily',
      description: 'WhatsApp notifications for payment updates',
      recipients: 'parent',
      events: ['payment_received', 'payment_due']
    },
    {
      id: '4',
      type: 'push',
      enabled: true,
      frequency: 'immediate',
      description: 'Push notifications for all fee-related activities',
      recipients: 'both',
      events: ['payment_due', 'payment_received', 'payment_overdue', 'payment_partial']
    }
  ]);

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([
    {
      id: '1',
      type: 'email',
      recipient: 'student@example.com',
      status: 'sent',
      timestamp: '2024-02-22 10:30 AM',
      message: 'Fee payment reminder for March 2024',
      category: 'reminder',
      studentName: 'John Smith',
      studentId: 'STD-2024-001'
    },
    {
      id: '2',
      type: 'sms',
      recipient: '+1234567890',
      status: 'sent',
      timestamp: '2024-02-21 02:15 PM',
      message: 'Your fee payment is due in 5 days',
      category: 'payment',
      studentName: 'Emily Johnson',
      studentId: 'STD-2024-042'
    },
    {
      id: '3',
      type: 'email',
      recipient: 'parent@example.com',
      status: 'failed',
      timestamp: '2024-02-20 09:45 AM',
      message: 'Receipt for payment of $500',
      category: 'receipt',
      studentName: 'Michael Brown',
      studentId: 'STD-2024-103'
    },
    {
      id: '4',
      type: 'whatsapp',
      recipient: '+0987654321',
      status: 'pending',
      timestamp: '2024-02-24 11:20 AM',
      message: 'Fee payment is now overdue by 15 days',
      category: 'overdue',
      studentName: 'Sarah Williams',
      studentId: 'STD-2024-078'
    }
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Payment Due Reminder',
      type: 'email',
      subject: 'Upcoming Fee Payment Reminder',
      content: 'Dear {{studentName}}, this is a reminder that your fee payment of {{amount}} is due on {{dueDate}}. Please ensure timely payment to avoid late fees.',
      variables: ['studentName', 'amount', 'dueDate'],
      category: 'reminder'
    },
    {
      id: '2',
      name: 'Payment Receipt',
      type: 'email',
      subject: 'Fee Payment Receipt',
      content: 'Dear {{studentName}}, we have received your payment of {{amount}} for {{feeType}}. Transaction ID: {{transactionId}}. Thank you!',
      variables: ['studentName', 'amount', 'feeType', 'transactionId'],
      category: 'receipt'
    },
    {
      id: '3',
      name: 'Overdue Payment SMS',
      type: 'sms',
      content: 'URGENT: {{studentName}}, your fee payment of {{amount}} was due on {{dueDate}} and is now overdue. Please pay immediately to avoid penalties.',
      variables: ['studentName', 'amount', 'dueDate'],
      category: 'overdue'
    }
  ]);

  // Utility functions
  const toggleNotification = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
      case 'whatsapp':
        return <Phone className="h-5 w-5" />;
      case 'push':
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payment':
        return 'bg-blue-100 text-blue-800';
      case 'reminder':
        return 'bg-purple-100 text-purple-800';
      case 'receipt':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.content) {
      const template: NotificationTemplate = {
        id: (templates.length + 1).toString(),
        name: newTemplate.name,
        type: newTemplate.type as 'email' | 'sms' | 'whatsapp' | 'push',
        subject: newTemplate.subject,
        content: newTemplate.content,
        variables: newTemplate.variables || [],
        category: newTemplate.category as 'payment' | 'reminder' | 'receipt' | 'overdue'
      };
      setTemplates([...templates, template]);
      setNewTemplate({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        variables: [],
        category: 'payment'
      });
      setIsCreateTemplateOpen(false);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const handleDeleteLog = (id: string) => {
    setNotificationLogs(notificationLogs.filter(log => log.id !== id));
  };

  const filteredLogs = notificationLogs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.studentName && log.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.studentId && log.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (currentFilter === 'all') return matchesSearch;
    if (currentFilter === 'sent') return matchesSearch && log.status === 'sent';
    if (currentFilter === 'failed') return matchesSearch && log.status === 'failed';
    if (currentFilter === 'pending') return matchesSearch && log.status === 'pending';
    if (currentFilter === 'payment') return matchesSearch && log.category === 'payment';
    if (currentFilter === 'reminder') return matchesSearch && log.category === 'reminder';
    if (currentFilter === 'receipt') return matchesSearch && log.category === 'receipt';
    if (currentFilter === 'overdue') return matchesSearch && log.category === 'overdue';
    
    return matchesSearch;
  });

  // Create a manual notification
  const [newNotification, setNewNotification] = useState({
    type: 'email',
    recipient: '',
    message: '',
    templateId: '',
    studentName: '',
    studentId: '',
    category: 'payment'
  });

  const handleCreateNotification = () => {
    if (newNotification.recipient && (newNotification.message || newNotification.templateId)) {
      let message = newNotification.message;
      
      // If using a template, populate the message
      if (newNotification.templateId) {
        const template = templates.find(t => t.id === newNotification.templateId);
        if (template) {
          message = template.content
            .replace('{{studentName}}', newNotification.studentName)
            .replace('{{studentId}}', newNotification.studentId);
          // In a real app, you would replace all variables with actual values
        }
      }
      
      const notification: NotificationLog = {
        id: (notificationLogs.length + 1).toString(),
        type: newNotification.type as 'email' | 'sms' | 'whatsapp' | 'push',
        recipient: newNotification.recipient,
        status: 'pending',
        timestamp: new Date().toLocaleString(),
        message: message,
        category: newNotification.category as 'payment' | 'reminder' | 'receipt' | 'overdue',
        studentName: newNotification.studentName,
        studentId: newNotification.studentId
      };
      
      setNotificationLogs([notification, ...notificationLogs]);
      setNewNotification({
        type: 'email',
        recipient: '',
        message: '',
        templateId: '',
        studentName: '',
        studentId: '',
        category: 'payment'
      });
      setIsCreateNotificationOpen(false);
    }
  };

  // Setup bulk notifications
  const handleSendBulkReminders = () => {
    alert('This would trigger bulk fee reminders for all students with upcoming payments.');
  };

  const handleSendOverdueNotices = () => {
    alert('This would send overdue notices to all students with past-due payments.');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notification Center</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage all fee-related notifications and communication
            </p>
          </div>
          <button 
            onClick={() => alert('Global settings would open here')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </button>
        </div>

        <div className="flex space-x-8">
          <button
            className={`pb-4 px-1 ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            Notification Settings
          </button>
          <button
            className={`pb-4 px-1 ${activeTab === 'logs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('logs')}
          >
            Notification History
          </button>
          <button
            className={`pb-4 px-1 ${activeTab === 'templates' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('templates')}
          >
            Message Templates
          </button>
          <button
            className={`pb-4 px-1 ${activeTab === 'bulk' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('bulk')}
          >
            Bulk Operations
          </button>
        </div>
      </div>

      {/* Notification Settings Tab */}
      {activeTab === 'settings' && (
        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {settings.map((setting) => (
                <li key={setting.id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getNotificationIcon(setting.type)}
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 capitalize">
                            {setting.type} Notifications
                          </h3>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {setting.events.map((event, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {event.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 capitalize mr-2">
                            Send to: <span className="font-medium">{setting.recipients}</span>
                          </span>
                          <span className="text-sm text-gray-500 capitalize mr-2">
                            Frequency: <span className="font-medium">{setting.frequency}</span>
                          </span>
                          <label className="inline-flex relative items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={setting.enabled}
                              onChange={() => toggleNotification(setting.id)}
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                              <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${setting.enabled ? 'transform translate-x-5' : ''}`}></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {setting.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </label>
                        </div>
                        <button
                          className="text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => alert(`Edit settings for ${setting.type} notifications`)}
                        >
                          Edit settings
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Notification Logs Tab */}
      {activeTab === 'logs' && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="w-1/3 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={currentFilter}
                onChange={(e) => setCurrentFilter(e.target.value)}
              >
                <option value="all">All Notifications</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="payment">Payment</option>
                <option value="reminder">Reminder</option>
                <option value="receipt">Receipt</option>
                <option value="overdue">Overdue</option>
              </select>
              <button
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setIsCreateNotificationOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Send Notification
              </button>
              <button
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => alert('Export functionality would go here')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <li key={log.id}>
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getNotificationIcon(log.type)}
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">{log.message}</h3>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                {log.status}
                              </span>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                                {log.category}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              <span>Recipient: {log.recipient}</span>
                              {log.studentName && (
                                <span className="ml-3">Student: {log.studentName} ({log.studentId})</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{log.timestamp}</span>
                          <button
                            className="text-gray-400 hover:text-gray-500"
                            onClick={() => handleDeleteLog(log.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No notification logs matching your criteria.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Message Templates</h2>
            <button
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setIsCreateTemplateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div key={template.id} className="bg-white shadow rounded-lg p-5 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {getNotificationIcon(template.type)}
                    <h3 className="ml-2 text-lg font-medium text-gray-900">{template.name}</h3>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
                {template.subject && (
                  <div className="mt-2 text-sm text-gray-700 font-medium">
                    Subject: {template.subject}
                  </div>
                )}
                <div className="mt-3 text-sm text-gray-500 border border-gray-200 rounded-md p-3 bg-gray-50">
                  {template.content}
                </div>
                {template.variables.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs text-gray-500">Variables:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {template.variables.map((variable, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => alert(`Edit template: ${template.name}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Operations Tab */}
      {activeTab === 'bulk' && (
        <div className="mt-6">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Bulk Fee Payment Reminders
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Send payment reminders to all students with upcoming fee deadlines. 
                  This will use the "Payment Due Reminder" template by default.
                </p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleSendBulkReminders}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Send Fee Reminders
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Overdue Payment Notices
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Send overdue notices to all students with past-due payments.
                  This will use the "Overdue Payment SMS" template and send through all available channels.
                </p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleSendOverdueNotices}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Send Overdue Notices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {isCreateTemplateOpen && (
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create New Template
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">
                      Template Name
                    </label>
                    <input
                      type="text"
                      id="template-name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="template-type" className="block text-sm font-medium text-gray-700">
                      Notification Type
                    </label>
                    <select
                      id="template-type"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newTemplate.type}
                      onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value as 'email' | 'sms' | 'whatsapp' | 'push'})}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>
                  {newTemplate.type === 'email' && (
                    <div>
                      <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="template-subject"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="template-category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="template-category"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value as 'payment' | 'reminder' | 'receipt' | 'overdue'})}
                    >
                      <option value="payment">Payment</option>
                      <option value="reminder">Reminder</option>
                      <option value="receipt">Receipt</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="template-content" className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <textarea
                      id="template-content"
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                      placeholder="Use {{variableName}} for dynamic content"
                    />
                  </div>
                  <div>
                    <label htmlFor="template-variables" className="block text-sm font-medium text-gray-700">
                      Variables (comma separated)
                    </label>
                    <input
                      type="text"
                      id="template-variables"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="studentName, amount, dueDate"
                      onChange={(e) => setNewTemplate({
                        ...newTemplate, 
                        variables: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  onClick={handleCreateTemplate}
                >
                  Create Template
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:text-sm"
                  onClick={() => setIsCreateTemplateOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {isCreateNotificationOpen && (
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Send Notification
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="notification-type" className="block text-sm font-medium text-gray-700">
                      Notification Type
                    </label>
                    <select
                      id="notification-type"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="notification-recipient" className="block text-sm font-medium text-gray-700">
                      Recipient
                    </label>
                    <input
                      type="text"
                      id="notification-recipient"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={newNotification.type === 'email' ? 'Email address' : 'Phone number'}
                      value={newNotification.recipient}
                      onChange={(e) => setNewNotification({...newNotification, recipient: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="notification-template" className="block text-sm font-medium text-gray-700">
                      Template (Optional)
                    </label>
                    <select
                      id="notification-template"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newNotification.templateId}
                      onChange={(e) => setNewNotification({...newNotification, templateId: e.target.value})}
                    >
                      <option value="">None (Custom Message)</option>
                      {templates.filter(t => t.type === newNotification.type).map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!newNotification.templateId && (
                    <div>
                      <label htmlFor="notification-message" className="block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <textarea
                        id="notification-message"
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={newNotification.message}
                        onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="notification-category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="notification-category"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newNotification.category}
                      onChange={(e) => setNewNotification({...newNotification, category: e.target.value})}
                    >
                      <option value="payment">Payment</option>
                      <option value="reminder">Reminder</option>
                      <option value="receipt">Receipt</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="notification-student" className="block text-sm font-medium text-gray-700">
                      Student Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="notification-student"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newNotification.studentName}
                      onChange={(e) => setNewNotification({...newNotification, studentName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="notification-studentid" className="block text-sm font-medium text-gray-700">
                      Student ID (Optional)
                    </label>
                    <input
                      type="text"
                      id="notification-studentid"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={newNotification.studentId}
                      onChange={(e) => setNewNotification({...newNotification, studentId: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  onClick={handleCreateNotification}
                >
                  Send Notification
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:text-sm"
                  onClick={() => setIsCreateNotificationOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManager;