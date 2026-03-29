import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginScreen } from './components/LoginScreen';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

type UserType = 'student' | 'admin' | null;

export default function App() {
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState<number>(0);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');

const handleLogin = (email: string, type: 'student' | 'admin', id: number, deptId?: number) => {
    setUserEmail(email);
    setUserType(type);
    setUserId(id);
    setDepartmentId(deptId || null);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setUserType(null);
  };

  if (isLoggedIn && userType === 'student') {
    return (
      <>
        <StudentDashboard email={userEmail} userId={userId} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  if (isLoggedIn && userType === 'admin') {
    return (
      <>
        <AdminDashboard email={userEmail} userId={userId} departmentId={departmentId} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex">
        {/* Left Section - Branding Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-12 flex-col justify-center items-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32" />
          
          <div className="relative z-10 max-w-xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
                GRIEVO
              </h1>
              <p className="text-xl text-white/90 mb-12 leading-relaxed">
                Student Grievance & Feedback Management System
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-12"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwY29sbGVnZSUyMHN0dWRlbnRzJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NzAxODg3OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Students collaboration"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-4 text-white/80"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-left">
                  <span className="block font-semibold text-white">Register Complaints</span>
                  <span className="text-sm">Submit and track your grievances</span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="text-left">
                  <span className="block font-semibold text-white">Track Progress</span>
                  <span className="text-sm">Monitor real-time status updates</span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-left">
                  <span className="block font-semibold text-white">Get Resolution</span>
                  <span className="text-sm">Quick response within 7 days</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Section - Interactive Area */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden text-center mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                GRIEVO
              </h1>
              <p className="text-sm text-gray-600">
                Student Grievance & Feedback Management
              </p>
            </motion.div>

            {/* Role Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 flex gap-2">
                <button
                  onClick={() => setSelectedRole('student')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    selectedRole === 'student'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => setSelectedRole('admin')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    selectedRole === 'admin'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Admin
                </button>
              </div>
            </motion.div>

            {/* Login Form with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, x: selectedRole === 'student' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: selectedRole === 'student' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginScreen userType={selectedRole} onLogin={handleLogin} />
              </motion.div>
            </AnimatePresence>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-gray-500">
                A trusted platform for university grievance management
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Your concerns matter. We're here to help.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
