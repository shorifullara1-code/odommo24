import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './src/lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'odommo24-secret-key-change-me';
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[Server] ${new Date().toISOString()} ${req.method} ${req.url}`);
  }
  next();
});

// --- API Routes ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    time: new Date().toISOString() 
  });
});

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

// Register
app.post('/api/auth/register', async (req, res) => {
  const { 
    userId, password, name, email, phone, 
    father_name, mother_name, present_address, permanent_address,
    blood_group, dob, profession, educational_qualification,
    nid_number, emergency_contact, profile_image
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const role = userCount === 0 ? 'admin' : 'member';
    
    const { data: lastUser } = await supabase.from('users').select('id').order('id', { ascending: false }).limit(1).single();
    const nextIdNumber = lastUser ? (1001 + lastUser.id) : 1001;
    const memberIdNumber = `OD24-${String(nextIdNumber).padStart(4, '0')}`;

    const { data, error } = await supabase.from('users').insert([{
      userId, password: hashedPassword, name, email, phone, role,
      father_name, mother_name, present_address, permanent_address,
      blood_group, dob, profession, educational_qualification,
      nid_number, emergency_contact, profile_image, member_id_number: memberIdNumber,
      status: role === 'admin' ? 'approved' : 'pending'
    }]).select().single();

    if (error) throw error;
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err: any) {
    if (err.code === '23505') { // Postgres unique violation
      res.status(400).json({ error: 'User ID or Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { userId, password } = req.body;
  const { data: user, error } = await supabase.from('users').select('*').eq('userId', userId).single();
  
  if (error || !user) return res.status(400).json({ error: 'User not found' });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: user.id, userId: user.userId, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  
  res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      userId: user.userId, 
      name: user.name, 
      role: user.role,
      email: user.email,
      profile_image: user.profile_image,
      bio: user.bio,
      father_name: user.father_name,
      mother_name: user.mother_name,
      present_address: user.present_address,
      permanent_address: user.permanent_address,
      blood_group: user.blood_group,
      dob: user.dob,
      profession: user.profession,
      educational_qualification: user.educational_qualification,
      nid_number: user.nid_number,
      emergency_contact: user.emergency_contact,
      member_id_number: user.member_id_number
    } 
  });
});

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const { data: user, error } = await supabase.from('users')
      .select(`
        id, userId, name, email, phone, role, profile_image, bio,
        father_name, mother_name, present_address, permanent_address,
        blood_group, dob, profession, educational_qualification,
        nid_number, emergency_contact, member_id_number, status
      `)
      .eq('id', req.user.id)
      .single();
    
    if (error) return res.status(404).json({ error: 'User not found' });
    
    if (user.status !== 'approved' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Your membership is pending approval' });
    }
    
    res.json(user);
  });

  // Update profile
  app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
    const { 
      name, email, phone, bio,
      father_name, mother_name, present_address, permanent_address,
      blood_group, dob, profession, educational_qualification,
      nid_number, emergency_contact
    } = req.body;
    try {
      const { error } = await supabase.from('users')
        .update({ 
          name, email, phone, bio,
          father_name, mother_name, present_address, permanent_address,
          blood_group, dob, profession, educational_qualification,
          nid_number, emergency_contact
        })
        .eq('id', req.user.id);
      
      if (error) throw error;
      res.json({ message: 'Profile updated' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Upload profile image
  app.post('/api/auth/profile-image', authenticateToken, async (req: any, res) => {
    const { image } = req.body;
    try {
      const { error } = await supabase.from('users')
        .update({ profile_image: image })
        .eq('id', req.user.id);
      
      if (error) throw error;
      res.json({ message: 'Profile image updated' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Get all users
  app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    const { data: users, error } = await supabase.from('users')
      .select(`
        id, userId, name, email, phone, role, created_at, status,
        father_name, mother_name, present_address, permanent_address,
        blood_group, dob, profession, educational_qualification,
        nid_number, emergency_contact, member_id_number
      `);
    if (error) return res.status(500).json({ error: error.message });
    res.json(users);
  });

  // Admin: Create user manually
  app.post('/api/admin/users/create', authenticateToken, isAdmin, async (req, res) => {
    const { 
      userId, password, name, email, phone, role, status,
      blood_group, profession
    } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const { data: lastUser } = await supabase.from('users').select('id').order('id', { ascending: false }).limit(1).single();
      const nextIdNumber = lastUser ? (1001 + lastUser.id) : 1001;
      const memberIdNumber = `OD24-${String(nextIdNumber).padStart(4, '0')}`;

      const { data, error } = await supabase.from('users').insert([{
        userId, password: hashedPassword, name, email, phone, role: role || 'member',
        blood_group, profession, member_id_number: memberIdNumber,
        status: status || 'approved'
      }]).select().single();

      if (error) throw error;
      delete apiCache['members'];
      res.status(201).json({ message: 'User created successfully', user: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Approve user
  app.patch('/api/admin/users/:id/approve', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { error } = await supabase.from('users').update({ status: 'approved' }).eq('id', req.params.id);
      if (error) throw error;
      delete apiCache['members'];
      res.json({ message: 'User approved' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public: Get approved members list
  app.get('/api/members', async (req, res) => {
    try {
      if (apiCache['members'] && Date.now() - apiCache['members'].time < CACHE_TTL) {
        return res.json(apiCache['members'].data);
      }
      const { data: members, error } = await supabase.from('users')
        .select('id, name, profile_image, member_id_number')
        .eq('status', 'approved')
        .order('name', { ascending: true });
      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('Could not find the table'))) {
          return res.json([]);
        }
        throw error;
      }
      apiCache['members'] = { data: members, time: Date.now() };
      res.json(members);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Notices CRUD
  app.get('/api/admin/notices', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { data: notices, error } = await supabase.from('notices')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(notices);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/notices', async (req, res) => {
    try {
      const { data: notices, error } = await supabase.from('notices')
        .select('*')
        .eq('is_active', 1)
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('Could not find the table'))) {
          return res.json([]);
        }
        throw error;
      }
      res.json(notices);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/notices', authenticateToken, isAdmin, async (req, res) => {
    const { title, content, link } = req.body;
    try {
      const { error } = await supabase.from('notices').insert([{ title, content, link }]);
      if (error) throw error;
      res.status(201).json({ message: 'Notice created' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/notices/:id', authenticateToken, isAdmin, async (req, res) => {
    const { title, content, link, is_active } = req.body;
    try {
      const { error } = await supabase.from('notices').update({ title, content, link, is_active }).eq('id', req.params.id);
      if (error) throw error;
      res.json({ message: 'Notice updated' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/notices/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { error } = await supabase.from('notices').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ message: 'Notice deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Events CRUD
  app.get('/api/events', async (req, res) => {
    try {
      const { data: events, error } = await supabase.from('events').select('*').order('date', { ascending: false });
      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('Could not find the table'))) {
          return res.json([]);
        }
        throw error;
      }
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/events', authenticateToken, isAdmin, async (req, res) => {
    const { title, description, date, location, image_url } = req.body;
    const { error } = await supabase.from('events').insert([{ title, description, date, location, image_url }]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: 'Event created' });
  });

  // Donations CRUD
  app.get('/api/donations', async (req, res) => {
    try {
      const { data: donations, error } = await supabase.from('donations').select('*').order('date', { ascending: false });
      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('Could not find the table'))) {
          return res.json([]);
        }
        throw error;
      }
      res.json(donations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/donations', async (req, res) => {
    const { donor_name, amount, message, phone_email, fund_type, payment_method, donor_type } = req.body;
    const { error } = await supabase.from('donations').insert([{ 
      donor_name, 
      amount, 
      message,
      phone_email,
      fund_type,
      payment_method,
      donor_type,
      date: new Date().toISOString()
    }]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: 'Donation recorded' });
  });

  // Site Settings
  app.get('/api/site-settings', async (req, res) => {
    try {
      const { data: settings, error } = await supabase.from('site_settings').select('*');
      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('Could not find the table'))) {
          return res.json({});
        }
        throw error;
      }
      const settingsMap = settings.reduce((acc: any, s: any) => {
        acc[s.key] = s.value;
        return acc;
      }, {});
      res.json(settingsMap);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/site-settings', authenticateToken, isAdmin, async (req, res) => {
    const { key, value } = req.body;
    try {
      const { error } = await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      res.json({ message: 'Setting updated' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Cache for public endpoints to improve speed
  const apiCache: Record<string, {data: any, time: number}> = {};
  const CACHE_TTL = 300000; // 5 minutes

  // Committee CRUD
  app.get('/api/committee', async (req, res) => {
    try {
      if (apiCache['committee'] && Date.now() - apiCache['committee'].time < CACHE_TTL) {
        return res.json(apiCache['committee'].data);
      }
      const { data: members, error } = await supabase.from('committee_members')
        .select('*')
        .eq('is_active', 1)
        .order('sort_order', { ascending: true });
      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('Could not find the table'))) {
          return res.json([]);
        }
        throw error;
      }
      apiCache['committee'] = { data: members, time: Date.now() };
      res.json(members);
    } catch (err: any) {
      console.error('Error fetching committee:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/committee', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { name, role, image_url, sort_order, userId, password } = req.body;
      if (!name || !role) {
        return res.status(400).json({ error: 'Name and Role are required' });
      }
      
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const { data, error } = await supabase.from('committee_members')
        .insert([{ 
          name, 
          role, 
          image_url, 
          sort_order: sort_order || 0
        }]).select().single();
        
      if (error) throw error;

      // If credentials provided, also create a record in users table for login
      if (userId && password) {
        const { data: lastUser } = await supabase.from('users').select('id').order('id', { ascending: false }).limit(1).single();
        const nextIdNumber = lastUser ? (1001 + lastUser.id) : 1001;
        const memberIdNumber = `OD24-${String(nextIdNumber).padStart(4, '0')}`;

        await supabase.from('users').insert([{
          userId,
          password: hashedPassword,
          name,
          role: 'member',
          member_id_number: memberIdNumber,
          status: 'approved',
          profile_image: image_url
        }]);
      }

      delete apiCache['committee'];
      res.status(201).json({ message: 'Committee member added', member: data });
    } catch (err: any) {
      console.error('Error creating committee member:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/committee/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { name, role, image_url, sort_order, is_active, userId, password } = req.body;
      
      const updateData: any = { 
        name, 
        role, 
        image_url, 
        sort_order, 
        is_active: is_active === undefined ? 1 : is_active
      };

      const { error } = await supabase.from('committee_members')
        .update(updateData)
        .eq('id', req.params.id);

      if (error) throw error;

      // Update user password if provided
      if (userId && password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await supabase.from('users').update({ password: hashedPassword }).eq('userId', userId);
      }

      delete apiCache['committee'];
      res.json({ message: 'Committee member updated' });
    } catch (err: any) {
      console.error('Error updating committee member:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/committee/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { error } = await supabase.from('committee_members').delete().eq('id', req.params.id);
      if (error) throw error;
      delete apiCache['committee'];
      res.json({ message: 'Committee member deleted' });
    } catch (err: any) {
      console.error('Error deleting committee member:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Update user role
  app.patch('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
    const { role } = req.body;
    try {
      const { error } = await supabase.from('users').update({ role }).eq('id', req.params.id);
      if (error) throw error;
      delete apiCache['members'];
      res.json({ message: 'Role updated' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Delete user
  app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { error } = await supabase.from('users').delete().eq('id', req.params.id);
      if (error) throw error;
      delete apiCache['members'];
      res.json({ message: 'User deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Update user picture
  app.patch('/api/admin/users/:id/picture', authenticateToken, isAdmin, async (req, res) => {
    const { profile_image } = req.body;
    try {
      const { error } = await supabase.from('users').update({ profile_image }).eq('id', req.params.id);
      if (error) throw error;
      delete apiCache['members'];
      res.json({ message: 'User picture updated successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Vite Middleware ---

  // --- Products CRUD ---
  app.get('/api/products', async (req, res) => {
    try {
      const { data: products, error } = await supabase.from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('Could not find the table'))) {
          console.warn('Products table does not exist in Supabase.');
          return res.json([]);
        }
        throw error;
      }
      res.json(products || []);
    } catch (err: any) {
      console.error('Error fetching products:', err.message || err);
      res.status(500).json({ error: err.message || 'Database error' });
    }
  });

  app.post('/api/admin/products', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { name, description, price, image_url, category, stock_status } = req.body;
      const { error } = await supabase.from('products').insert([{ 
        name, 
        description, 
        price: parseFloat(price) || 0, 
        image_url, 
        category, 
        stock_status: stock_status || 'available',
        created_at: new Date().toISOString()
      }]);
      if (error) {
        if (error.code === '42P01') {
          return res.status(404).json({ error: 'Products table does not exist. Please run the setup SQL.' });
        }
        throw error;
      }
      res.status(201).json({ message: 'Product created successfully' });
    } catch (err: any) {
      console.error('Error creating product:', err.message || err);
      res.status(500).json({ error: err.message || 'Failed to create product' });
    }
  });

  app.put('/api/admin/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { name, description, price, image_url, category, stock_status } = req.body;
      const { error } = await supabase.from('products')
        .update({ name, description, price: parseFloat(price) || 0, image_url, category, stock_status })
        .eq('id', req.params.id);
      if (error) {
        if (error.code === '42P01') {
          return res.status(404).json({ error: 'Products table does not exist.' });
        }
        throw error;
      }
      res.json({ message: 'Product updated successfully' });
    } catch (err: any) {
      console.error('Error updating product:', err.message || err);
      res.status(500).json({ error: err.message || 'Failed to update product' });
    }
  });

  app.delete('/api/admin/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', req.params.id);
      if (error) {
        if (error.code === '42P01') {
          return res.status(404).json({ error: 'Products table does not exist.' });
        }
        throw error;
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (err: any) {
      console.error('Error deleting product:', err.message || err);
      res.status(500).json({ error: err.message || 'Failed to delete product' });
    }
  });

  // --- Orders CRUD ---
  app.get('/api/admin/orders', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { data: orders, error } = await supabase.from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('Could not find the table'))) {
          return res.json([]);
        }
        throw error;
      }
      res.json(orders || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const { 
        customer_name, 
        phone, 
        address, 
        email, 
        total_amount, 
        items, 
        payment_method 
      } = req.body;

      if (!customer_name || !phone || !address || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required order fields' });
      }

      const { data, error } = await supabase.from('orders').insert([{
        customer_name,
        phone,
        address,
        email,
        total_amount: parseFloat(total_amount),
        items: JSON.stringify(items),
        payment_method: payment_method || 'Cash on Delivery',
        status: 'pending',
        created_at: new Date().toISOString()
      }]).select().single();

      if (error) {
        if (error.code === '42P01') {
          return res.status(404).json({ error: 'Orders table does not exist. Contact site admin.' });
        }
        throw error;
      }

      res.status(201).json({ message: 'Order placed successfully', order: data });
    } catch (err: any) {
      console.error('Error placing order:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/admin/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const { error } = await supabase.from('orders')
        .update({ status })
        .eq('id', req.params.id);
      if (error) throw error;
      res.json({ message: 'Order status updated' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/orders/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ message: 'Order deleted' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Visitors Stats ---
  app.get('/api/visitors', async (req, res) => {
    try {
      // For a real production app, we would use a dedicated redis or stats server.
      // Here we store a JSON in site_settings.
      let stats: Record<string, number> = {};
      const { data: settings } = await supabase.from('site_settings').select('*').eq('key', 'visitor_stats').single();
      
      const todayDate = new Date().toISOString().split('T')[0];
      
      if (settings && settings.value) {
        try {
          stats = JSON.parse(settings.value);
        } catch(e) {}
      }
      
      // Only track if not an admin? Or just track always. The `GET` doubles as tracking hit for simplicity.
      stats[todayDate] = (stats[todayDate] || 0) + 1;
      
      // Prune old data more than 365 days
      const activeStats: Record<string, number> = {};
      const now = new Date();
      let today = 0, weekly = 0, monthly = 0, yearly = 0;
      
      Object.keys(stats).forEach(dateStr => {
         const dateObj = new Date(dateStr);
         const diffDays = Math.ceil(Math.abs(now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
         const count = stats[dateStr];
         if (diffDays <= 366) {
           activeStats[dateStr] = count;
           if (dateStr === todayDate) today += count;
           if (diffDays <= 7) weekly += count;
           if (diffDays <= 30) monthly += count;
           if (diffDays <= 365) yearly += count;
         }
      });
      
      // Save it back without blocking
      supabase.from('site_settings').upsert({ 
        key: 'visitor_stats', 
        value: JSON.stringify(activeStats), 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'key' }).then();
      
      res.json({ today, weekly, monthly, yearly });
    } catch (err: any) {
      res.json({ today: 1, weekly: 1, monthly: 1, yearly: 1 });
    }
  });

  // --- API Catch-all ---
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  // --- Vite / Static Middleware ---
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

// Export the app for Vercel
export default app;

// Start server for local development or traditional hosting
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
