import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import api from '@/lib/api';

export default function DataMigration() {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: 'Success', description: 'Data exported successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setImporting(true);
      await api.post('/admin/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: 'Success', description: 'Data imported successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import data',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Data Migration</h1>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Export Data</h2>
            <p className="text-gray-600 mb-4">
              Download all user data in Excel format
            </p>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Import Data</h2>
            <p className="text-gray-600 mb-4">
              Upload user data from Excel file
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                id="file-upload"
                disabled={importing}
              />
              <Button
                asChild
                disabled={importing}
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {importing ? 'Importing...' : 'Import from Excel'}
                </label>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}