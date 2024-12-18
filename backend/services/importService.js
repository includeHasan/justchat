

const XLSX = require('xlsx');
const User = require('../models/User');

class ImportService {
  static async importFromExcel(buffer) {
    // Read workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    let newUsers = 0;
    let updatedUsers = 0;
    const errors = [];

    // Process each user
    for (const userData of jsonData) {
      try {
        const { Name, Email, 'Mobile Number': MobileNo, Password } = userData;

        // Check for required fields
        if (!Name || !Email || !MobileNo) {
          errors.push(`Skipping row: Missing required fields - ${JSON.stringify(userData)}`);
          continue;
        }

        // Find existing user
        let user = await User.findOne({ 
          $or: [{ email: Email }, { mobileNo: MobileNo }] 
        });

        if (user) {
          // Update existing user
          user.name = Name;
          user.email = Email;
          user.mobileNo = MobileNo;
          
          if (Password) {
            user.password = Password;
          }

          await user.save();
          updatedUsers++;
        } else {
          // Create new user
          user = new User({
            name: Name,
            email: Email,
            mobileNo: MobileNo,
            password: Password || Math.random().toString(36).slice(-8), // Random password if not provided
            isVerified: true
          });

          await user.save();
          newUsers++;
        }
      } catch (error) {
        errors.push(`Error processing user: ${error.message}`);
      }
    }

    return {
      totalUsers: jsonData.length,
      newUsers,
      updatedUsers,
      errors
    };
  }
}

module.exports = ImportService;