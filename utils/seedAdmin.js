import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const seedAdmin = async () => {
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
  ) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in production');
  }

  const adminName = process.env.ADMIN_NAME || 'Foundation Admin';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    const passwordMatches = await bcrypt.compare(adminPassword, existingAdmin.password);

    if (passwordMatches) {
      existingAdmin.name = adminName;
      existingAdmin.email = adminEmail;
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(`Admin user verified: ${adminEmail}`);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    existingAdmin.name = adminName;
    existingAdmin.email = adminEmail;
    existingAdmin.password = await bcrypt.hash(adminPassword, salt);
    existingAdmin.role = 'admin';
    await existingAdmin.save();
    console.log(`Admin user updated: ${adminEmail}`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  await User.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
  });

  console.log(`Admin user created: ${adminEmail}`);
};

export default seedAdmin;
