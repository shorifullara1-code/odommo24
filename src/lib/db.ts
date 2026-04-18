import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('odommo24.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'member', -- 'admin' or 'member'
    profile_image TEXT,
    bio TEXT,
    father_name TEXT,
    mother_name TEXT,
    present_address TEXT,
    permanent_address TEXT,
    blood_group TEXT,
    dob TEXT,
    profession TEXT,
    educational_qualification TEXT,
    nid_number TEXT,
    emergency_contact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_name TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'BDT',
    message TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS committee_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Seed initial committee members if empty
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'মো: শিহাব খান', 'আহ্বায়ক', 1 WHERE NOT EXISTS (SELECT 1 FROM committee_members LIMIT 1);
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'মো: ফয়সাল হোসেন ফাল্গুন', 'যুগ্ম আহ্বায়ক', 2 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'মো: ফয়সাল হোসেন ফাল্গুন');
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'আশরাফ মিয়াজী', 'সদস্য সচিব', 3 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'আশরাফ মিয়াজী');
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'আবিদ উল্লাহ আফিফ', 'সদস্য', 4 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'আবিদ উল্লাহ আফিফ');
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'মো: নজরুল ইসলাম শোভ', 'সদস্য', 5 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'মো: নজরুল ইসলাম শোভ');
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'মো: কামাল হোসেন', 'সদস্য', 6 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'মো: কামাল হোসেন');
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'মোহাম্মদ তৌফিক হাসান', 'সদস্য', 7 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'মোহাম্মদ তৌফিক হাসান');
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'মো: জুবাইরুল ইসলাম সানিম', 'সদস্য', 8 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'মো: জুবাইরুল ইসলাম সানিম');
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'মো: মেরাজুল ইসলাম', 'সদস্য', 9 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'মো: মেরাজুল ইসলাম');
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'মো: আসাদুল্লাহ আল-নাইম', 'সদস্য', 10 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'মো: আসাদুল্লাহ আল-নাইম');
  INSERT INTO committee_members (name, role, sort_order) 
  SELECT 'মিম আক্তার', 'সদস্য', 11 WHERE NOT EXISTS (SELECT 1 FROM committee_members WHERE name = 'মিম আক্তার');
`);

// Seed initial site settings
const seedSettings = [
  { key: 'logo_url', value: 'https://scontent.fdac207-1.fna.fbcdn.net/v/t39.30808-6/600325065_122105978607153564_2431888853554226083_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeHJ7ZaEPusVkByoCIbB_Hz_JzgHKhNoMoknOAcqE2gyidseH5fmTVXb5oAV_9QNKELdYtPeFST0ATocVHw0WmgX&_nc_ohc=ASv8W_wRMskQ7kNvwHkxJBx&_nc_oc=AdpabOybfYe6OTpqTseL85GqFVRHNbq07Rddp_X_JUOi8J3XNL_mLDMaDyowdr5xi2E&_nc_zt=23&_nc_ht=scontent.fdac207-1.fna&_nc_gid=5s2uQMyxLpoI_wvoG1ZBmg&_nc_ss=7a3a8&oh=00_Af2lu0iSupL-xLGGBG-6CklogoJOTMiThK-5gxPCJqpf1g&oe=69E7960F' },
  { key: 'hero_images', value: JSON.stringify([
    "https://scontent.fdac207-1.fna.fbcdn.net/v/t39.30808-6/659216844_122126707371153564_6397416756080249660_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeGq9weetAFNbNxt6hOP1u1-n6ZVE1B5DfKfplUTUHkN8gk2uuByz3ZYq6NkIBuFvIhn5d2DFGu1uWuyZByBR2zK&_nc_ohc=dpGGUacXrdAQ7kNvwGEKm4_&_nc_oc=AdoOw2VxdBtT_K9BS_g0L8-JattJGBAcy3pp6Bc5LUght-ee7l1e-loCmwL98vIpDOo&_nc_zt=23&_nc_ht=scontent.fdac207-1.fna&_nc_gid=SwQzzpX4dFBO5tG96Rj1Lw&_nc_ss=7a3a8&oh=00_Af2LmN50WKl9t3CwC9O5CCihDSn__P6uB-9Wbg7KogR7IA&oe=69E7C42A",
    "https://scontent.fdac207-1.fna.fbcdn.net/v/t39.30808-6/671218210_122129515713153564_8856670999829030733_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeFVTFNslp1zRUDQHg1qOS-fXGKYxO8PjZZcYpjE7w-Nlhu5NCqUHp4s6WaQNUWuEP6TD6CYrk13srTG1ZVWIetw&_nc_ohc=EEXOWeJC4AkQ7kNvwFarq9n&_nc_oc=Adq3W7XCZnBRnOf77XQPRQiK0ZRz-KMDncTtR6PMG4khj8foguIurgS6MVT7ozERHq0&_nc_zt=23&_nc_ht=scontent.fdac207-1.fna&_nc_gid=lQgOEEUvQysscRwXIE5Fag&_nc_ss=7a3a8&oh=00_Af33Iu8JVB3u7L8cAYY8h3FgdDsZiwal8tuP9sOWDTZEEA&oe=69E7B775",
    "https://scontent.fdac207-1.fna.fbcdn.net/v/t39.30808-6/672155061_122129515719153564_604790446898429431_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeHz6IlHuyryAhfR3d7GbMxh_K2u5PZ_JeT8ra7k9n8l5OSUdzf2xnBuA23Ces56e0CgBllJ4u28nzbVp20PYNmL&_nc_ohc=qU8MkQ9G8UsQ7kNvwFtUApD&_nc_oc=Adq3BQDfV0E0FxvGAwpxJZEI1xLugy_OboPvOGD2Zx_vzbXiPkKJ156ldFFeSfYr5xQ&_nc_zt=23&_nc_ht=scontent.fdac207-1.fna&_nc_gid=ftm9ohH5e9YTE5JcK41Qxg&_nc_ss=7a3a8&oh=00_Af16Xx9VDFyodJMRQtAmDibNvejT-HvEJCE_sAo72jwmfA&oe=69E7AA36",
    "https://scontent.fdac207-1.fna.fbcdn.net/v/t39.30808-6/674220875_122129515749153564_17087766113401089_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=7b2446&_nc_eui2=AeGRgJJ23MV2ZV5bf7GNxLJYGNMVVdyviHoY0xVV3K-IesAvO9PNfEopHUd5rtOQc3FfjIraF3KA_nkduifemXhi&_nc_ohc=4g34BhRBCdMQ7kNvwGn9b8Y&_nc_oc=Adpiuz1PhIpkNLUQDFZG1paImZQ6aaEZAfE62fbuB4ttqyhlIk1XC3krvF0b1zgVAdY&_nc_zt=23&_nc_ht=scontent.fdac207-1.fna&_nc_gid=B-25-9dORNj7JYKjFjcQTQ&_nc_ss=7a3a8&oh=00_Af0NhJsOjiUjEP3FAwQ0eecbo9J-PnPiRR3REtZGG-LjxQ&oe=69E79CD1"
  ]) }
];

seedSettings.forEach(s => {
  const check = db.prepare('SELECT * FROM site_settings WHERE key = ?').get(s.key);
  if (!check) {
    db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)').run(s.key, s.value);
  }
});

// Simple migration to add columns if they don't exist
const columnsToAdd = [
  'father_name', 'mother_name', 'present_address', 'permanent_address', 
  'blood_group', 'dob', 'profession', 'educational_qualification', 
  'nid_number', 'emergency_contact', 'member_id_number'
];

columnsToAdd.forEach(col => {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`);
  } catch (e) {
    // Column already exists or other error
  }
});

// Populate member_id_number for existing users if null
const usersWithoutId = db.prepare('SELECT id FROM users WHERE member_id_number IS NULL').all();
usersWithoutId.forEach((u: any, index: number) => {
  const nextId = 1001 + index;
  const formattedId = `OD24-${String(nextId).padStart(4, '0')}`;
  db.prepare('UPDATE users SET member_id_number = ? WHERE id = ?').run(formattedId, u.id);
});

// Seed initial admin if not exists
const adminCheck = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
if (!adminCheck) {
  const adminId = 'admin';
  const adminPassword = 'admin123';
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);
  const formattedId = 'OD24-1000';
  
  db.prepare(`
    INSERT INTO users (
      userId, password, name, role, email, phone, 
      father_name, mother_name, present_address, permanent_address,
      blood_group, dob, profession, educational_qualification,
      nid_number, emergency_contact, member_id_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId, hashedPassword, 'System Admin', 'admin', 'admin@odommo24.org', '01700000000',
    'Mr. Father', 'Mrs. Mother', 'Savar, Dhaka', 'Savar, Dhaka',
    'O+', '1990-01-01', 'Software Engineer', 'B.Sc in CSE',
    '1234567890', '01800000000', formattedId
  );
}

export default db;
