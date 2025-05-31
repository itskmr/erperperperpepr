import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import AuthLanding from './pages/auth/AuthLanding';
import AdminLogin from './pages/auth/AdminLogin';
import SchoolLogin from './pages/auth/SchoolLogin';
import TeacherLogin from './pages/auth/TeacherLogin';
import ParentLogin from './pages/auth/ParentLogin';
import StudentLogin from './pages/auth/StudentLogin';
import StudentManagement from './pages/StudentManagement';
import FeeStructure from './pages/FeeStructure';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import StudentRegistrationForm from './pages/StudentForm';
import StudentEdit from './pages/StudentEdit';
// import AuthPage from './pages/AuthPage';
import AccountsPage from './pages/AccountsPage';
import UserManagement from './pages/UserManagement';
import UserEdit from './pages/UserEdit';
import LoginForm from './pages/LoginForm';
import CreateExam from './components/Teacher/Exam'
// import TCFrom from './components/Schools/TCFrom' 
import TCList from './components/Schools/TCForm/TCList' 

import Timetable from './components/Schools/Timetable';

// import { ClassSectionManagement } from './components/Admin/Class'
// import { ManageTeachers } from './pages/ManageTeachers'
// import { StudentManagement } from './`'
// import  StudentFeeDetails  from './components/StudentFeeDetails'
import TeacherProfile from './components/Teacher/TeacherProfile'
import SchoolProfile from './components/Schools/SchoolProfile'

import ManageSchools from './components/Admin/ManageSchools';
import ManageUsers from './components/Admin/ManageUser';
import StaffDirectory from './components/Admin/StaffDirectory';
import StaffDocumentManagement from "./components/Admin/StaffDocumentManagement";
import SchoolReports from "./components/Schools/Reports";
import SchoolCalendar from "./components/Schools/Calender";
import BudgetPlanning from "./components/Schools/BudgetPlanning";
import ExpenseTracker from "./components/Schools/ExpenseTracker";
import AccreditationComponent from "./components/Schools/Accreditation";
import DepartmentManagement from "./components/Schools/DepartmentManagement";
import ReportsDashboard from "./components/Admin/MainReports";
import ClassAssignmentManager from "./components/Schools/Assignment";
import TeacherEvaluationPage from "./components/Schools/TeacherEvaluation";
import ClassManagement from "./components/Teacher/classManagement";
import TeachingMaterials from "./components/Teacher/TeachingMaterials";
import AssignmentManager from './components/Teacher/Assignment';
import TeacherDirectory from './components/Schools/TeacherDirectory/TeacherDirectory';
import DriverDirectory from './components/Schools/DriverDirectory/DriverDirectory';
import VehicleManagement from './components/Schools/VehicleManagement/VehicleManagement';
import TransportRoutes from './components/Schools/TransportRoutes/TransportRoutes';
import ExamSchedule from './components/Teacher/ExamSchedule';
import FeeCollectionApp from "./components/Schools/FeesCollection";
import  AttendanceManagement from "./components/Teacher/AttendanceManagement";
import CheckBounceSystem from "./components/Schools/ChequeBounce";
import GradeManagementSchool from "./components/Schools/ExamGrade";
import BusTracking from "./components/Schools/Bustracking";
import StudentRegistration from "./pages/StudentRegister";
import AdminDashboard from "./components/Admin/AdminDashboard";
import TeacherDashboard from "./components/Teacher/TeacherDashboard";
import RegisterStudentDataTable from "./components/StudentForm/RegisterStudentDataTable";
// import StudentFormProgress from "./components/StudentForm/StudentFormProgress";
// Student components


// Parent components
import { ParentDashboard, ParentAttendance } from './components/parent';
// import FeedbackPage from './pages/parent/FeedbackPage';
import TeacherFeedbackPage from './pages/teacher/TeacherFeedbackPage';
import SchoolFeedbackPage from './pages/school/SchoolFeedbackPage';
// Uncomment these when the components are available
// import StudentFeeDetails from './pages/StudentFeeDetails';
// import PaymentGateway from './pages/PaymentGateway';
// import UserProfile from './pages/UserProfile';
// import NotFound from './pages/NotFound';

// Loader for all pages

import { Toaster } from 'react-hot-toast';

// Add imports for the auth components

import StudentChat from './components/Student/chat';
import StudentProfileDashboard from './components/Student/StudentProfileDashboard';
import StudentFAQ from './components/Student/StudentFAQ';

// PathTracker component to save current path in sessionStorage
const PathTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Don't track auth and login pages
    if (location.pathname !== '/auth' && location.pathname !== '/login' && location.pathname !== '/') {
      sessionStorage.setItem('lastPath', location.pathname);
    }
  }, [location]);
  
  return null;
};

// Student components 
import StudentDashboard from "./components/Student/StudentDashboard";

// The main App component that provides authentication state
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  // Function to check authentication from localStorage
  const checkAuthFromStorage = () => {
    const storedToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole') || localStorage.getItem('role');

    console.log("Checking auth state:", { storedToken: storedToken ? '***' : null, storedRole });

    if (storedToken && storedRole) {
      // Validate token is not expired (basic check)
      try {
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        const isExpired = tokenPayload.exp * 1000 < Date.now();
        
        if (isExpired) {
          console.log("Token is expired, clearing auth data");
          handleLogout();
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log("Invalid token format, clearing auth data", error);
        handleLogout();
        setIsLoading(false);
        return;
      }
      
      setUserRole(storedRole);
      setIsAuthenticated(true);
      console.log("User authenticated as:", storedRole);
    } else {
      setUserRole(null);
      setIsAuthenticated(false);
      console.log("No authentication found in localStorage");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Check if user is authenticated on component mount
    checkAuthFromStorage();
    
    // Add event listener for storage events to detect changes in other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'userRole' || e.key === 'token' || e.key === 'role') {
        console.log('Auth storage changed:', e.key, 'New value:', e.newValue);
        checkAuthFromStorage();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleAuthSuccess = (token: string, role: string = 'user') => {
    // Store auth info in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('token', token); // For backward compatibility
    localStorage.setItem('role', role); // For backward compatibility

    // Update state
    setUserRole(role);
    setIsAuthenticated(true);
    
    console.log("Authentication successful:", { token: token ? '***' : null, role });
  };

  const handleLogout = () => {
    // Clear auth info from local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");
    localStorage.removeItem("loginTimestamp");
    
    // Clear any session storage
    sessionStorage.clear();
    
    // Clear any auth cookies if present
    document.cookie = 'authCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Reset state
    setUserRole(null);
    setIsAuthenticated(false);
    
    console.log("Logout successful");
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // The main App component that provides authentication state
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <AppContent 
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          handleAuthSuccess={handleAuthSuccess}
          handleLogout={handleLogout}
        />
      </Router>
    </>
  );
}

// Component to handle routing with path tracking
function AppContent({
  isAuthenticated,
  userRole,
  handleAuthSuccess,
  handleLogout
}: {
  isAuthenticated: boolean;
  userRole: string | null;
  handleAuthSuccess: (token: string, role: string) => void;
  handleLogout: () => void;
}) {
  // Protected route component
  const ProtectedRoute = ({
    children,
    allowedRoles = ['admin', 'school', 'teacher', 'user']
  }: {
    children: JSX.Element,
    allowedRoles?: string[]
  }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }

    if (userRole && !allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  return (
    <>
      <PathTracker />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ?
              userRole === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
              userRole === 'teacher' ? <Navigate to="/teacher/dashboard" replace /> :
              userRole === 'parent' ? <Navigate to="/parent/dashboard" replace /> :
              userRole === 'student' ? <Navigate to="/student/dashboard" replace /> :
              <Navigate to="/dashboard" replace /> :
              <LoginForm onLoginSuccess={handleAuthSuccess} />
          }
        />

        {/* Auth routes */}
        <Route path="/auth" element={
            isAuthenticated ?
            userRole === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
            userRole === 'teacher' ? <Navigate to="/teacher/dashboard" replace /> :
            userRole === 'parent' ? <Navigate to="/parent/dashboard" replace /> :
            userRole === 'student' ? <Navigate to="/student/dashboard" replace /> :
            <Navigate to="/dashboard" replace /> :
            <AuthLanding />
        } />
        
        <Route path="/auth/admin-login" element={
          isAuthenticated && userRole === 'admin' ?
            <Navigate to="/admin/dashboard" replace /> :
            isAuthenticated ?
              <Navigate to={`/${userRole}/dashboard`} replace /> :
              <AdminLogin />
        } />
        
        <Route path="/auth/school-login" element={
          isAuthenticated && userRole === 'school' ?
            <Navigate to="/dashboard" replace /> :
            isAuthenticated ?
              <Navigate to={`/${userRole}/dashboard`} replace /> :
              <SchoolLogin />
        } />
        
        <Route path="/auth/teacher-login" element={
          isAuthenticated && userRole === 'teacher' ?
            <Navigate to="/teacher/dashboard" replace /> :
            isAuthenticated ?
              <Navigate to={`/${userRole}/dashboard`} replace /> :
              <TeacherLogin />
        } />
        
        <Route path="/auth/parent-login" element={
          isAuthenticated && userRole === 'parent' ?
            <Navigate to="/parent/dashboard" replace /> :
            isAuthenticated ?
              <Navigate to={`/${userRole}/dashboard`} replace /> :
              <ParentLogin />
        } />
        
        <Route path="/auth/student-login" element={
          isAuthenticated && userRole === 'student' ?
            <Navigate to="/student/dashboard" replace /> :
            isAuthenticated ?
              <Navigate to={`/${userRole}/dashboard`} replace /> :
              <StudentLogin />
        } />
        
        {/* <Route path="/auth/parent-signup" element={
          isAuthenticated && userRole === 'parent' ?
            <Navigate to="/parent/dashboard" replace /> :
            isAuthenticated ?
              <Navigate to={`/${userRole}/dashboard`} replace /> :
              <ParentSignup />  
        } />
        
        <Route path="/auth/student-signup" element={
          isAuthenticated && userRole === 'student' ?
            <Navigate to="/student/dashboard" replace /> :
            isAuthenticated ?
              <Navigate to={`/${userRole}/dashboard`} replace /> :
              <StudentSignup />
        } /> */}

        {/* Default route - redirect to login if not authenticated, dashboard if authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ?
              userRole === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
              userRole === 'teacher' ? <Navigate to="/teacher/dashboard" replace /> :
              userRole === 'parent' ? <Navigate to="/parent/dashboard" replace /> :
              userRole === 'student' ? <Navigate to="/student/dashboard" replace /> :
              <Navigate to="/dashboard" replace /> :
              <Navigate to="/auth" replace />
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/school/students/manage-students"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <StudentManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/school/financial-management/fee-structure"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <FeeStructure />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Attendence"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/students/tc-form"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <TCList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/school/reports"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/school/financial-management/account-page"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <AccountsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/faculty-management/teacher-directory"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <TeacherDirectory />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Transport Management Routes */}
        <Route
          path="/school/transport-management/driver-directory"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <DriverDirectory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/transport-management/vehicle-management"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <VehicleManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/transport-management/transport-routes"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <TransportRoutes />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/school/students/register/allStudents"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <RegisterStudentDataTable />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/school/profile"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <SchoolProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
      

        <Route
          path="/school/BusTracking"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <BusTracking />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/StudentRegistrationForm"
          element={
            <ProtectedRoute allowedRoles={['admin', 'school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <StudentRegistrationForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/student-edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <StudentEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/myclasses/assignment"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <AssignmentManager />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/examination/create-exam"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <CreateExam />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <TeacherProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/students/Attendance"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <AttendanceManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <TeacherDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers/examination/exam-schedule"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <ExamSchedule />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/School/BudgetPlanning"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                < BudgetPlanning />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/School/FeeCollection"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                < FeeCollectionApp/>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/School/ExpenseTracker"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                < ExpenseTracker />
              </Layout>
              </ProtectedRoute>
          }
        />


        <Route
          path="/School/Accreditation"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                < AccreditationComponent />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/School/CheckBounceSystem"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <CheckBounceSystem />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/feedback"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                          <SchoolFeedbackPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/students/register/addNew"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <StudentRegistration />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/administration/departments"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <DepartmentManagement/>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/GradeManagementSchool"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <GradeManagementSchool/>
              </Layout>
              </ProtectedRoute>
          }
        />
        <Route
          path="/classes/manage"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <ClassManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes/TeachingMaterials"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <TeachingMaterials />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/feedback"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <TeacherFeedbackPage />
              </Layout>
            </ProtectedRoute>
          }
        />



        {/* < Route
          path='/master/class-section'
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <ManageStudent />
              </Layout>
            </ProtectedRoute>
          }
        /> */}

        {/* <Route
          path='/school/students/manage-students'
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <ManageStudent />
              </Layout>
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
            path='/school/administration/manage-teachers'
            element={
              <ProtectedRoute>
                <Layout userRole={userRole} onLogout={handleLogout}>
                  <ManageTeachers />
                </Layout>
              </ProtectedRoute>
            } > </Route> */}


        <Route
          path="/Calender"
          element={
            <ProtectedRoute allowedRoles={['admin', 'school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <SchoolCalendar />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/school/administration/timetable"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <Timetable />
              </Layout>
            </ProtectedRoute>
          }
        />
        

        {/* Uncomment these routes when the components are available */}
        {/* 
        <Route 
          path="/student-fee/:id" 
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <StudentFeeDetails />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/payment/:studentId" 
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <PaymentGateway />
              </Layout>
            </ProtectedRoute>
          } 
        />
        */}


        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Parent Routes */}
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <ParentDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Parent Academic Routes */}
        <Route
          path="/parent/academics/grades"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Grades & Progress</h1>
                  <p className="text-gray-600">Detailed grade information coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/academics/assignments"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Assignments & Homework</h1>
                  <p className="text-gray-600">Detailed assignment information coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/academics/attendance"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <ParentAttendance />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/communication/messages"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Messages</h1>
                  <p className="text-gray-600">Messaging system coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/communication/announcements"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Announcements</h1>
                  <p className="text-gray-600">School announcements coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/communication/calendar"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Event Calendar</h1>
                  <p className="text-gray-600">School calendar coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Parent Schedule Routes */}
        <Route
          path="/parent/schedule/timetable"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Class Schedule</h1>
                  <p className="text-gray-600">Detailed class schedule coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/schedule/extracurricular"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Extracurricular Activities</h1>
                  <p className="text-gray-600">Extracurricular activities information coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Parent Fee Routes */}
        <Route
          path="/parent/fees/details"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Fee Details</h1>
                  <p className="text-gray-600">Detailed fee information coming soon.</p>
                </div>
              </Layout>
              </ProtectedRoute>
          }
        />

        <Route
          path="/parent/fees/payment"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Make Payment</h1>
                  <p className="text-gray-600">Payment gateway coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/fees/history"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment History</h1>
                  <p className="text-gray-600">Payment history coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Other Parent Routes */}
        <Route
          path="/parent/health"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Health Records</h1>
                  <p className="text-gray-600">Health information coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/resources"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Learning Resources</h1>
                  <p className="text-gray-600">Learning resources coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/parent/settings"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
                  <p className="text-gray-600">User settings coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/profile"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Parent Profile</h1>
                  <p className="text-gray-600">Profile settings coming soon.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/schools"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <ManageSchools />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <ManageUsers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <StaffDirectory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/documents"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <StaffDocumentManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Report-admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <ReportsDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/School/report"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <SchoolReports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/School/ClassAssignment"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <ClassAssignmentManager />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/School/TeacherEvaluationPage"
          element={
            <ProtectedRoute allowedRoles={['school']}>
              <Layout onLogout={handleLogout} userRole={userRole}>
                <TeacherEvaluationPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* User Management Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        



        {/* Uncomment these routes when the components are available */}
        {/*
        <Route 
          path="/users/:id" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'school']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <UserProfile />
              </Layout>
            } 
          } 
        />
        */}

        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <UserEdit />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Profile route - accessible by all authenticated users */}
        {/*
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <UserProfile />
              </Layout>
            } 
          } 
        />
        */}

        {/* Unauthorized access page */}
        <Route
          path="/unauthorized"
          element={
            <Layout userRole={userRole} onLogout={handleLogout}>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
                <p className="mb-4">You don't have permission to access this resource.</p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Go Back
                </button>
              </div>
            </Layout>
          }
        />

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Layout userRole={userRole} onLogout={handleLogout}>
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">Page Not Found</h1>
                  <p className="mb-4">The page you are looking for does not exist.</p>
                  <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Go Back
                  </button>
                </div>
              </Layout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <StudentDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/Chat"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <StudentChat />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/StudentFAQ"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <StudentFAQ />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/StudentProfileDashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <StudentProfileDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Student Academics Routes */}
        <Route
          path="/student/academics/schedule"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Class Schedule</h1>
                  <p className="text-gray-600">Your class schedule information will appear here.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/academics/assignments"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Assignments</h1>
                  <p className="text-gray-600">Your assignments will appear here.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/academics/grades"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Grades & Reports</h1>
                  <p className="text-gray-600">Your grades and academic reports will appear here.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Student Examinations Routes */}
        <Route
          path="/student/examinations/upcoming"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Exams</h1>
                  <p className="text-gray-600">Your upcoming exams will appear here.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/examinations/results"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Exam Results</h1>
                  <p className="text-gray-600">Your exam results will appear here.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Other Student Routes */}
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">My Attendance</h1>
                  <p className="text-gray-600">Your attendance record will appear here.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout userRole={userRole} onLogout={handleLogout}>
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Profile</h1>
                  <p className="text-gray-600">Your profile information will appear here.</p>
                </div>
              </Layout>
              </ProtectedRoute>
          }
        />

        
      </Routes>
    </>
  );
}

export default App;
