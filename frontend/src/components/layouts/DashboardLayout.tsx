import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  MessageSquare, 
  UserCircle, 
  LogOut 
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <div className="h-full px-3 py-4 flex flex-col">
            <div className="mb-8 px-3">
              <h2 className="text-xl font-bold">Admin Panel</h2>
            </div>
            
            <nav className="flex-1 space-y-2">
              {user?.role === 'admin' && (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/dashboard/users">
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      User Management
                    </Button>
                  </Link>
                  <Link to="/dashboard/migration">
                    <Button variant="ghost" className="w-full justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      Data Migration
                    </Button>
                  </Link>
                </>
              )}
              <Link to="/chat">
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" className="w-full justify-start">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}