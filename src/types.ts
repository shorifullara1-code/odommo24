export interface User {
  id: number;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'member';
  profile_image?: string;
  bio?: string;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string;
  image_url?: string;
  created_at: string;
}

export interface Donation {
  id: number;
  donor_name: string;
  amount: number;
  currency: string;
  message?: string;
  date: string;
}
