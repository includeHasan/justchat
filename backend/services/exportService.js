

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs').promises;

class ExportService {
  static async exportToExcel(users) {
    // Prepare data for export
    const exportData = users.map(user => ({
      Name: user.name,
      Email: user.email,
      'Mobile Number': user.mobileNo
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Create export directory if not exists
    const exportDir = path.join(process.cwd(), 'exports');
    await fs.mkdir(exportDir, { recursive: true });

    // Generate unique filename
    const filename = `users_export_${Date.now()}.xlsx`;
    const exportPath = path.join(exportDir, filename);

    // Write to file
    XLSX.writeFile(workbook, exportPath);

    return filename;
  }
}

module.exports = ExportService;
