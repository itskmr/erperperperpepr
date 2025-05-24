import React, { useState, useEffect } from 'react';

// Types
interface Event {
  id: string;
  title: string;
  date: Date;
  category: 'academic' | 'school-activity' | 'resource' | 'administrative';
  description: string;
  location?: string;
  time?: string;
  organizer?: string;
  participants?: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

interface CalendarDay {
  date: Date;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const SchoolCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium',
    status: 'upcoming',
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const dummyEvents: Event[] = [
      {
        id: '1',
        title: 'Final Exams',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        category: 'academic',
        description: 'End of semester examinations for all grades',
        location: 'All Classrooms',
        time: '9:00 AM - 12:00 PM',
        organizer: 'Academic Department',
        participants: ['All Students', 'All Teachers'],
        status: 'upcoming',
        priority: 'high',
      },
      {
        id: '2',
        title: 'Sports Day',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
        category: 'school-activity',
        description: 'Annual sports competition',
        location: 'School Grounds',
        time: '8:00 AM - 4:00 PM',
        organizer: 'Physical Education Department',
        status: 'upcoming',
        priority: 'medium',
      },
      {
        id: '3',
        title: 'IT Equipment Maintenance',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        category: 'resource',
        description: 'Regular maintenance of computer labs',
        location: 'Computer Labs',
        time: '2:00 PM - 5:00 PM',
        organizer: 'IT Department',
        status: 'upcoming',
        priority: 'medium',
      },
      {
        id: '4',
        title: 'Staff Meeting',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        category: 'administrative',
        description: 'Monthly staff meeting to discuss school operations',
        location: 'Conference Room',
        time: '3:30 PM - 5:00 PM',
        organizer: 'Principal',
        participants: ['All Staff'],
        status: 'upcoming',
        priority: 'high',
      },
    ];

    setEvents(dummyEvents);
  }, []);

  // Generate calendar days
  useEffect(() => {
    const days: CalendarDay[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Add days from previous month to fill the first week
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        events: events.filter(event => 
          event.date.getDate() === date.getDate() && 
          event.date.getMonth() === date.getMonth() && 
          event.date.getFullYear() === date.getFullYear()
        ),
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        events: events.filter(event => 
          event.date.getDate() === date.getDate() && 
          event.date.getMonth() === date.getMonth() && 
          event.date.getFullYear() === date.getFullYear()
        ),
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
      });
    }
    
    // Add days from next month to complete the grid (6 weeks total)
    const daysNeeded = 42 - days.length;
    for (let i = 1; i <= daysNeeded; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        events: events.filter(event => 
          event.date.getDate() === date.getDate() && 
          event.date.getMonth() === date.getMonth() && 
          event.date.getFullYear() === date.getFullYear()
        ),
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, events]);

  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  const handleAddEvent = () => {
    if (selectedDate && newEvent.title && newEvent.category && newEvent.description) {
      const eventToAdd: Event = {
        id: Date.now().toString(),
        title: newEvent.title || '',
        date: selectedDate,
        category: newEvent.category as 'academic' | 'school-activity' | 'resource' | 'administrative',
        description: newEvent.description || '',
        location: newEvent.location,
        time: newEvent.time,
        organizer: newEvent.organizer,
        participants: newEvent.participants,
        status: newEvent.status as 'upcoming' | 'ongoing' | 'completed',
        priority: newEvent.priority as 'high' | 'medium' | 'low',
      };

      setEvents(prev => [...prev, eventToAdd]);
      setShowAddEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        category: 'academic',
        priority: 'medium',
        status: 'upcoming',
      });
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const filteredEvents = activeCategory === 'all' 
    ? events 
    : events.filter(event => event.category === activeCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'bg-blue-500';
      case 'school-activity': return 'bg-green-500';
      case 'resource': return 'bg-yellow-500';
      case 'administrative': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto my-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar */}
        <div className="lg:w-1/4 bg-gray-50 rounded-lg p-4 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">School Profile</h2>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                SP
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-gray-800">Springfield High School</h3>
                <p className="text-sm text-gray-600">Est. 1985</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <p className="mb-1"><span className="font-semibold">Principal:</span> Dr. Jane Smith</p>
              <p className="mb-1"><span className="font-semibold">Students:</span> 1,250</p>
              <p className="mb-1"><span className="font-semibold">Staff:</span> 85</p>
              <p><span className="font-semibold">Academic Year:</span> 2023-2024</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Event Categories</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'all' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                  All Events
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveCategory('academic')}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'academic' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Academic Events
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveCategory('school-activity')}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'school-activity' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  School Activities
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveCategory('resource')}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'resource' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  Resource Management
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveCategory('administrative')}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeCategory === 'administrative' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  Administrative Tasks
                </button>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Upcoming Events</h3>
            <div className="space-y-3">
              {events
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map(event => (
                  <div 
                    key={event.id} 
                    className="bg-white p-3 rounded-md shadow-sm border-l-4 cursor-pointer hover:bg-gray-50"
                    style={{ borderLeftColor: event.category === 'academic' ? '#3b82f6' : 
                                            event.category === 'school-activity' ? '#22c55e' : 
                                            event.category === 'resource' ? '#eab308' : 
                                            '#a855f7' }}
                    onClick={() => handleEventClick(event)}
                  >
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {event.time ? ` • ${event.time}` : ''}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Main calendar section */}
        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">School Calendar</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Today
              </button>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold text-gray-800 min-w-[140px] text-center">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button 
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {weekdays.map(day => (
                <div key={day} className="py-2 text-center text-sm font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`min-h-[100px] border-b border-r p-1 ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                  } ${day.isToday ? 'bg-blue-50' : ''} ${
                    isSameDay(day.date, selectedDate || new Date(-1)) ? 'ring-2 ring-blue-500 ring-inset' : ''
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${day.isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                      {day.date.getDate()}
                    </span>
                    {day.events.length > 0 && (
                      <span className="text-xs font-medium bg-gray-100 rounded-full px-2 py-0.5">
                        {day.events.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                    {day.events.map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded truncate cursor-pointer ${getCategoryColor(event.category)} text-white`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected day events */}
          {selectedDate && (
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <button
                  onClick={() => setShowAddEventModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Event
                </button>
              </div>
              
              {events.filter(event => isSameDay(event.date, selectedDate)).length > 0 ? (
                <div className="space-y-3">
                  {events
                    .filter(event => isSameDay(event.date, selectedDate))
                    .map(event => (
                      <div 
                        key={event.id} 
                        className="bg-gray-50 p-3 rounded-md shadow-sm border-l-4 cursor-pointer hover:bg-gray-100"
                        style={{ borderLeftColor: event.category === 'academic' ? '#3b82f6' : 
                                               event.category === 'school-activity' ? '#22c55e' : 
                                               event.category === 'resource' ? '#eab308' : 
                                               '#a855f7' }}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-800">{event.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClass(event.priority)}`}>
                            {event.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {event.time && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {event.time}
                            </span>
                          )}
                          {event.location && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {event.location}
                            </span>
                          )}
                          {event.organizer && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              {event.organizer}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No events scheduled for this day.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Event</h3>
              <button 
                onClick={() => setShowAddEventModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Enter event title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({...newEvent, category: e.target.value as any})}
                >
                  <option value="academic">Academic Event</option>
                  <option value="school-activity">School Activity</option>
                  <option value="resource">Resource Management</option>
                  <option value="administrative">Administrative Task</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Enter event description"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEvent.location || ''}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEvent.time || ''}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    placeholder="e.g. 9:00 AM - 12:00 PM"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent({...newEvent, priority: e.target.value as any})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      value={newEvent.status}
                                      onChange={(e) => setNewEvent({...newEvent, status: e.target.value as any})}
                                    >
                                      <option value="upcoming">Upcoming</option>
                                      <option value="ongoing">Ongoing</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newEvent.organizer || ''}
                                    onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                                    placeholder="Event organizer"
                                  />
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                  <button
                                    onClick={() => setShowAddEventModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleAddEvent}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    Add Event
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                  
                        {/* Event Details Modal */}
                        {showEventDetails && selectedEvent && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                                    <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${getPriorityClass(selectedEvent.priority)}`}>
                                      {selectedEvent.priority} priority
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {selectedEvent.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => setShowEventDetails(false)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="flex items-center mb-4">
                                  <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(selectedEvent.category)}`}></div>
                                  <span className="text-sm font-medium capitalize">{selectedEvent.category.replace('-', ' ')}</span>
                                </div>
                                <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedEvent.time && (
                                    <div className="flex items-start">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      </svg>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">Time</p>
                                        <p className="text-sm text-gray-600">{selectedEvent.time}</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {selectedEvent.location && (
                                    <div className="flex items-start">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                      </svg>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">Location</p>
                                        <p className="text-sm text-gray-600">{selectedEvent.location}</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {selectedEvent.organizer && (
                                    <div className="flex items-start">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                      </svg>
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">Organizer</p>
                                        <p className="text-sm text-gray-600">{selectedEvent.organizer}</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm0-3a1 1 0 10-2 0V8a1 1 0 102 0v2z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Status</p>
                                      <p className="text-sm text-gray-600 capitalize">{selectedEvent.status}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Participants</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedEvent.participants.map((participant, index) => (
                                      <span 
                                        key={index}
                                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                      >
                                        {participant}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                  onClick={() => {
                                    // In a real app, this would open an edit form
                                    setShowEventDetails(false);
                                  }}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    // In a real app, this would confirm deletion
                                    setEvents(events.filter(event => event.id !== selectedEvent.id));
                                    setShowEventDetails(false);
                                  }}
                                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  };
                  
                  export default SchoolCalendar;