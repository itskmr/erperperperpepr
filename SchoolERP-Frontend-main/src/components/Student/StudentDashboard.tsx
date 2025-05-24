import React, { useState } from 'react';
import { CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const [timeframe, setTimeframe] = useState<'7days' | '30days'>('30days');
  
  const sampleData = [
    { day: 'Mon', value: 40 },
    { day: 'Tue', value: 35 },
    { day: 'Wed', value: 50 },
    // Add more data points
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <CheckCircle className="text-blue-500" />
          <h3>Completed Assignments</h3>
          <p className="text-2xl font-bold">48</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <Clock className="text-purple-500" />
          <h3>Study Hours</h3>
          <p className="text-2xl font-bold">42h 18m</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Study Progress</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleData}>
              <Line type="monotone" dataKey="value" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
