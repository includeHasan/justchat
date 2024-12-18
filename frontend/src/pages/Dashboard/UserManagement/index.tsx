import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import UserTable from './UserTable';
import UserForm from './UserForm';
import api from '@/lib/api';
import type { User } from '@/lib/types';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: Omit<User, 'id'>) => {
    try {
      if (selectedUser) {
        await api.put(`/admin/user/${selectedUser.id}`, data);
        toast({ title: 'Success', description: 'User updated successfully' });
      } else {
        await api.post('/admin/user', data);
        toast({ title: 'Success', description: 'User created successfully' });
      }
      fetchUsers();
      setIsFormOpen(false);
      setSelectedUser(undefined);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`/admin/user/${userId}`);
      toast({ title: 'Success', description: 'User deleted successfully' });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleToggleRestrict = async (userId: string, restricted: boolean) => {
    try {
      await api.post(`/admin/restrict/${userId}`, { restricted });
      toast({ 
        title: 'Success', 
        description: `User ${restricted ? 'restricted' : 'unrestricted'} successfully` 
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user restriction',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button
            onClick={() => {
              setSelectedUser(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <UserTable
          users={users}
          onEdit={(user) => {
            setSelectedUser(user);
            setIsFormOpen(true);
          }}
          onDelete={handleDelete}
          onToggleRestrict={handleToggleRestrict}
        />

        <UserForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSubmit}
          user={selectedUser}
        />
      </div>
    </DashboardLayout>
  );
}