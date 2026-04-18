import React, { useState, useEffect, createContext, useContext, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Users, MapPin, Phone, Mail, Calendar, Activity, 
  Menu, X, Shield, Lock, User as UserIcon, Camera, ChevronRight,
  Download, Search, Info, Trash2, LogIn, UserPlus, LogOut, Settings,
  Briefcase, GraduationCap, CreditCard, ArrowRight, Zap
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from './types.ts';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  siteSettings: any;
  updateSettings: (key: string, value: string) => Promise<void>;
  login: (data: { token: string; user: any }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- Helper: Input Field ---
const InputField = ({ label, icon: Icon, value, onChange, type = "text", placeholder = "", required = false, disabled = false }: any) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-[10px] font-black text-bento-light uppercase tracking-widest pl-1">
      {Icon && <Icon size={12} className="text-bento-primary" />}
      {label} {required && <span className="text-bento-primary">*</span>}
    </label>
    <input 
      type={type} 
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-5 py-4 rounded-2xl border-2 border-bento-border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-[rgba(192,57,43,0.05)] focus:border-bento-primary transition text-sm font-medium disabled:opacity-50"
      onChange={onChange}
      required={required}
    />
  </div>
);

// --- Pages ---

const HomeOverview = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const { user, siteSettings } = useAuth();

  const heroImages = useMemo(() => {
    try {
      const imgs = siteSettings?.hero_images ? JSON.parse(siteSettings.hero_images) : null;
      if (Array.isArray(imgs) && imgs.length > 0) return imgs;
    } catch (e) {
      console.error("Hero images parse error");
    }
    return [
      "https://picsum.photos/seed/odommo/1920/1080",
      "https://picsum.photos/seed/youth/1920/1080",
      "https://picsum.photos/seed/charity/1920/1080"
    ];
  }, [siteSettings?.hero_images]);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => console.log('API Status:', d)).catch(e => console.error('API Unreachable:', e));
    fetch('/api/events').then(r => r.ok ? r.json() : []).then(data => setEvents(Array.isArray(data) ? data : []));
    fetch('/api/donations').then(r => r.ok ? r.json() : []).then(data => setDonations(Array.isArray(data) ? data : []));
    fetch('/api/committee').then(r => r.ok ? r.json() : []).then(data => setCommittee(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIdx(prev => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const currentDonation = Array.isArray(donations) ? donations.reduce((sum, d) => sum + d.amount, 0) : 0;
  const goal = 100000;

  return (
    <div className="space-y-32 pb-32">
      {/* 1. Dynamic Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-bento-dark">
         <AnimatePresence mode="wait">
            <motion.div 
               key={currentImgIdx}
               initial={{ opacity: 0, scale: 1.1 }}
               animate={{ opacity: 0.4, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 1.5 }}
               className="absolute inset-0 z-0"
            >
               <img src={heroImages[currentImgIdx]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-r from-bento-dark via-bento-dark/80 to-transparent"></div>
            </motion.div>
         </AnimatePresence>

         <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                  <div className="space-y-6">
                     <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-6 py-2 bg-bento-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-xl"
                     >
                        Since 2024 • সাভার, বনগাঁও
                     </motion.span>
                     <h1 className="text-8xl md:text-[10rem] font-serif italic text-white leading-[0.8] tracking-tighter">
                        অদম্য <span className="text-bento-primary">২৪</span>
                     </h1>
                     <p className="text-2xl text-white/70 font-serif italic max-w-lg leading-relaxed pt-4">
                        "অদম্য মানুষের পাশে, অদম্য সাহসে"—আর্তমানবতার সেবায় নিবেদিত সাভারের একটি অদম্য তরুণ সংগঠন।
                     </p>
                  </div>
                  <div className="flex flex-wrap gap-6 pt-4">
                     <Link to="/register" className="vibrant-gradient text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-bento-primary/30 hover:scale-105 transition-all">সদস্য হতে আবেদন</Link>
                     <Link to="/donations" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-bento-dark transition-all">তহবিলে অনুদান</Link>
                  </div>
               </motion.div>

               <div className="hidden lg:block relative group">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 glass-morphism rounded-[4rem] p-10 space-y-8"
                  >
                     <div className="flex justify-between items-center border-b border-white/10 pb-6">
                        <h3 className="text-2xl font-black italic text-white flex items-center gap-3"><Activity className="text-bento-primary" /> সংগঠনে বর্তমান প্রভাব</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        {[
                           { label: 'সদস্য', val: '১২০+', color: 'text-white' },
                           { label: 'রক্তদান', val: '৩কে+', color: 'text-bento-primary' },
                           { label: 'সহায়তা', val: '৪৫০+', color: 'text-bento-accent' },
                           { label: 'সেবা', val: '২৪/৭', color: 'text-vibrant-yellow' }
                        ].map((s, i) => (
                           <div key={i} className="space-y-1">
                              <p className={`text-4xl font-black ${s.color}`}>{s.val}</p>
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{s.label}</p>
                           </div>
                        ))}
                     </div>
                     <Link to="/events" className="block w-full text-center py-5 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-bento-primary transition">ইভেন্ট ডায়েরি দেখুন</Link>
                  </motion.div>
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-bento-primary shadow-2xl rounded-[3rem] p-6 z-20 animate-bounce flex flex-col items-center justify-center text-center text-white">
                     <Heart size={24} fill="white" className="mb-2" />
                     <p className="text-[10px] font-black uppercase leading-tight">রক্তদানই মহৎ দান</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 2. Mission & Impact Section */}
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bento-card glass-morphism !p-20"
        >
          <div className="grid lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-8">
                <span className="text-[10px] font-black uppercase text-bento-primary tracking-[0.4em]">Our Core Mission</span>
                <h2 className="text-7xl font-serif text-bento-dark italic leading-tight">মানবতার টানে, অদম্য <span className="text-bento-primary">২৪</span> জানে।</h2>
                <p className="text-2xl text-bento-light font-serif italic leading-relaxed">
                   সাভার উপজেলাধীন বনগাঁও ইউনিয়ন ভিত্তিক একটি অরাজনৈতিক, প্রতিবাদী ও সামাজিক সংগঠন। আমরা রক্তদান কর্মসূচি, শীতবস্ত্র বিতরণ এবং অসহায় মানুষের চিকিৎসা সেবায় সর্বদা নিয়োজিত।
                </p>
                <div className="flex gap-8 pt-6">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-bento-primary"><Heart size={28} /></div>
                      <div className="text-left">
                         <p className="text-2xl font-black text-bento-dark">১.৫কে+</p>
                         <p className="text-[10px] font-black text-bento-light uppercase tracking-widest">রক্তদান</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-bento-accent"><Shield size={28} /></div>
                      <div className="text-left">
                         <p className="text-2xl font-black text-bento-dark">১০০%</p>
                         <p className="text-[10px] font-black text-bento-light uppercase tracking-widest">স্বচ্ছতা</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="relative group">
                <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl relative">
                   <img src="https://picsum.photos/seed/vision/1200/800" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-1000" />
                   <div className="absolute inset-0 bg-bento-primary/10 group-hover:bg-transparent transition duration-1000"></div>
                </div>
                <div className="absolute -bottom-8 -right-8 bg-bento-dark text-white p-10 rounded-[2.5rem] shadow-2xl space-y-2 hidden md:block">
                   <p className="text-4xl font-serif italic text-bento-primary">Since 2024</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/50">সাফল্যের ধারাবাহিকতা</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Interactive Bento Grid */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-12 gap-8 auto-rows-[250px]">
          {/* Quick Profile/Login */}
          <motion.div className="bento-card col-span-12 lg:col-span-4 row-span-2 bg-gray-50 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-[rgba(192,57,43,0.1)] rounded-[2rem] flex items-center justify-center text-bento-primary"><Users size={48} /></div>
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-bento-dark italic">সদস্য এলাকা</h3>
               <p className="text-xs text-bento-light uppercase tracking-widest">আপনার ড্যাশবোর্ড</p>
            </div>
            {user ? (
               <Link to="/profile" className="bg-bento-primary text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">প্রোফাইল</Link>
            ) : (
               <Link to="/login" className="bg-bento-dark text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition">লগইন</Link>
            )}
          </motion.div>

          {/* Emergency Fund */}
          <motion.div className="bento-card col-span-12 lg:col-span-8 row-span-1 bg-bento-primary text-white border-none flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <h3 className="text-2xl font-black flex items-center gap-3"><Heart fill="currentColor" /> জরুরি ত্রাণ তহবিল</h3>
               <span className="bg-white/20 text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase">Urgent</span>
            </div>
            <div className="space-y-4">
               <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${Math.min((currentDonation/goal)*100, 100)}%` }}></div>
               </div>
               <div className="flex justify-between items-end">
                  <p className="text-4xl font-black">৳{currentDonation.toLocaleString()}</p>
                  <Link to="/donations" className="bg-white text-bento-primary px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">দান করুন</Link>
               </div>
            </div>
          </motion.div>

          {/* Events Mini */}
          <motion.div className="bento-card col-span-12 lg:col-span-8 row-span-1 space-y-6">
            <div className="flex justify-between items-center border-b border-bento-border pb-4">
               <h3 className="text-xl font-black flex items-center gap-2"><Calendar className="text-bento-primary" /> আপকামিং ইভেন্ট</h3>
               <Link to="/events" className="text-[10px] font-black text-bento-primary uppercase tracking-widest">সকল ইভেন্ট &rarr;</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
               {events.slice(0, 2).map((e: any) => (
                 <div key={e.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-bento-border">
                    <div className="w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center border border-bento-border shrink-0">
                       <span className="text-[10px] font-black text-bento-primary">{new Date(e.date).getDate()}</span>
                       <span className="text-[8px] font-bold uppercase">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <p className="font-bold text-bento-dark text-sm line-clamp-1">{e.title}</p>
                 </div>
               ))}
               {events.length === 0 && <p className="text-center py-4 text-bento-light italic text-xs col-span-2">আপাতত কোনো ইভেন্ট নেই।</p>}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. Activities Grid */}
      <section className="container mx-auto px-6">
         <div className="text-center space-y-4 mb-20">
            <h2 className="text-6xl font-serif text-bento-dark italic">কার্যক্রমের পরিধি</h2>
            <p className="text-bento-light uppercase text-xs font-black tracking-[0.4em]">Our Daily Impact</p>
         </div>
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
               { icon: Heart, title: 'রক্তদান কর্মসূচি', desc: 'জরুরি রক্তের প্রয়োজনে আমাদের সদস্যরা সবসময় প্রস্তুত।' },
               { icon: Briefcase, title: 'চিকিৎসা সহায়তা', desc: 'অসহায় মানুষের চিকিৎসায় আর্থিক ও মানসিকভাবে পাশে থাকা।' },
               { icon: GraduationCap, title: 'শিক্ষা সহায়তা', desc: 'গরিব ছাত্র-ছাত্রীদের শিক্ষা উপকরণ বিতরণ।' },
               { icon: MapPin, title: 'দুর্যোগ ত্রাণ', desc: 'প্রাকৃতিক দুর্যোগে আমরা সাধ্যমতো ত্রাণ পৌঁছে দেই।' }
            ].map((act, i) => (
               <motion.div key={i} className="bento-card bg-white space-y-6 group hover:bg-bento-primary transition-colors duration-500">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-bento-primary group-hover:bg-white transition"><act.icon size={32} /></div>
                  <div className="space-y-3">
                     <h3 className="text-2xl font-black italic text-bento-dark group-hover:text-white transition">{act.title}</h3>
                     <p className="text-sm text-bento-light italic group-hover:text-white/70 transition leading-relaxed">{act.desc}</p>
                  </div>
               </motion.div>
            ))}
         </div>
      </section>

      {/* 5. Committee Section */}
      <section id="committee" className="py-20">
         <div className="container mx-auto px-6 space-y-24">
            <div className="text-center space-y-6">
               <span className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]">Guardians of Humanity</span>
               <h2 className="text-7xl font-serif text-bento-dark italic">কেন্দ্রীয় আহ্বায়ক কমিটি</h2>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-12">
               {committee.length > 0 ? committee.map((c, i) => (
                 <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group relative bg-[#1a1f26] rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="h-[400px] relative">
                       <img src={c.image_url || `https://picsum.photos/seed/mem${c.id}/800/800`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700" alt={c.name} referrerPolicy="no-referrer" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f26] via-transparent to-transparent"></div>
                       <div className="absolute bottom-8 left-8">
                          <h4 className="text-2xl font-serif italic text-white leading-tight">{c.name}</h4>
                          <span className="text-[10px] font-black uppercase tracking-widest text-bento-primary">{c.role}</span>
                       </div>
                    </div>
                 </motion.div>
               )) : (
                 <div className="col-span-full py-20 text-center text-bento-light italic font-serif opacity-50">
                    কমিটির তথ্য লোড হচ্ছে অথবা এখনও কোনো মেম্বার যোগ করা হয়নি...
                 </div>
               )}
            </div>
         </div>
      </section>

      {/* 6. Join CTA */}
      <section className="container mx-auto px-6 mb-32">
         <div className="bg-bento-primary rounded-[4rem] p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="relative z-10 space-y-12">
               <h2 className="text-7xl font-serif italic leading-tight">আপনিও কি অদম্য হতে চান?</h2>
               <div className="flex flex-wrap justify-center gap-8">
                  <Link to="/register" className="bg-white text-bento-primary px-16 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition">সদস্য আবেদন</Link>
                  <Link to="/donations" className="bg-bento-dark text-white px-16 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-bento-dark transition">সহযোগিতা করুন</Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        setError(`Server error: Expected JSON but got ${contentType || 'text'}. Check if API route is correct.`);
        return;
      }

      if (res.ok) {
        login(data);
        navigate('/profile');
      } else {
        setError(data.error || `Login failed (Status: ${res.status})`);
      }
    } catch (err) {
      console.error('Login connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Connection failed: ${errorMessage}. (Check Vercel logs or /api/health)`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 bento-card border-none shadow-2xl space-y-8">
        <div className="text-center space-y-2">
           <div className="w-20 h-20 bg-[rgba(192,57,43,0.05)] rounded-full flex items-center justify-center mx-auto text-bento-primary"><LogIn size={40} /></div>
           <h2 className="text-3xl font-serif text-bento-dark italic">সদস্য লগইন</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="ইউজার আইডি" value={userId} onChange={(e: any) => setUserId(e.target.value)} placeholder="@username" required />
          <InputField label="পাসওয়ার্ড" value={password} onChange={(e: any) => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
          {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          <button type="submit" className="w-full bg-bento-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[rgba(192,57,43,0.2)] hover:scale-[1.02] active:scale-100 transition">
            প্রবেশ করুন
          </button>
        </form>
        <p className="text-center text-xs font-bold text-bento-light uppercase tracking-widest">
          নতুন সদস্য? <Link to="/register" className="text-bento-primary">আবেদন করুন</Link>
        </p>
      </motion.div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({ 
    userId: '', password: '', name: '', email: '', phone: '',
    father_name: '', mother_name: '', present_address: '', permanent_address: '',
    blood_group: '', dob: '', profession: '', educational_qualification: '',
    nid_number: '', emergency_contact: '', profile_image: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 90 * 1024) {
        setError('ছবির সাইজ অবশ্যই ৯০কেবি এর কম হতে হবে!');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration connection error:', err);
      setError('Connection failed. Please check your API configuration.');
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-32 px-6 text-center space-y-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-32 h-32 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto ring-8 ring-green-100 mb-6 text-bento-accent"><Heart size={64} fill="currentColor" className="animate-pulse" /></motion.div>
        <div className="space-y-4">
           <h2 className="text-5xl font-serif text-bento-dark italic">অদম্য ২৪-এ আপনাকে স্বাগতম!</h2>
           <p className="text-bento-light italic text-xl leading-relaxed max-w-md mx-auto">পরবর্তী অদম্য সদস্য হিসেবে আপনার নাম অন্তর্ভুক্ত হলো। শীঘ্রই লগইন পেজে নিয়ে যাওয়া হচ্ছে...</p>
        </div>
        <div className="flex justify-center gap-3">
           <div className="w-2 h-2 bg-bento-primary rounded-full animate-bounce"></div>
           <div className="w-2 h-2 bg-bento-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
           <div className="w-2 h-2 bg-bento-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-32 px-6 space-y-20">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
         <span className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]">Become an Odommo member</span>
         <h2 className="text-7xl font-serif text-bento-dark italic leading-tight">সদস্য আবেদন ফর্ম</h2>
         <p className="text-lg text-bento-light font-serif italic leading-relaxed">অদম্য ২৪-এর অংশ হয়ে আর্তমানবতার সেবায় নিজেকে নিয়োজিত করুন। সকল তথ্য সঠিকভাবে পূরণ করুন।</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bento-card border-none shadow-2xl p-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-bento-primary via-bento-accent to-bento-primary"></div>
        
        <form onSubmit={handleSubmit} className="space-y-16">
          <div className="flex flex-col items-center space-y-4 mb-8">
             <div className="w-32 h-32 bg-gray-50 rounded-3xl border-2 border-dashed border-bento-border flex items-center justify-center overflow-hidden relative group">
                {formData.profile_image ? (
                  <img src={formData.profile_image} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={40} className="text-gray-300" />
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="absolute inset-0 bg-[rgba(47,54,64,0.4)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                   <span className="text-[10px] font-black uppercase tracking-widest">ছবি যুক্ত করুন</span>
                </div>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-bento-light">প্রোফাইল ছবি (সর্বোচ্চ ৯০কেবি)</p>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
             {/* Section 1: Basic Info */}
             <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-bento-border pb-4">
                   <div className="w-10 h-10 bg-[rgba(192,57,43,0.1)] rounded-xl flex items-center justify-center text-bento-primary"><UserIcon size={20} /></div>
                   <h3 className="text-xl font-black italic text-bento-dark">ব্যক্তিগত তথ্য</h3>
                </div>
                <div className="space-y-6">
                   <InputField label="পূর্ণ নাম" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder="উদা: মোহাম্মদ তামিম" required />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="block text-[10px] font-black text-bento-light uppercase tracking-widest pl-1">রক্তের গ্রুপ</label>
                         <select className="w-full px-5 py-4 rounded-2xl border-2 border-bento-border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-[rgba(192,57,43,0.05)] focus:border-bento-primary transition text-sm font-medium" value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}>
                            <option value="">নির্বাচন করুন</option>
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                         </select>
                      </div>
                      <InputField label="জন্ম তারিখ" type="date" value={formData.dob} onChange={(e: any) => setFormData({ ...formData, dob: e.target.value })} required />
                   </div>
                   <InputField label="পেশা" value={formData.profession} onChange={(e: any) => setFormData({ ...formData, profession: e.target.value })} placeholder="উদা: ছাত্র / চাকুরীজীবী" required />
                   <InputField label="শিক্ষাগত যোগ্যতা" value={formData.educational_qualification} onChange={(e: any) => setFormData({ ...formData, educational_qualification: e.target.value })} placeholder="উদা: স্নাতক" required />
                </div>
             </div>

             {/* Section 2: Family & Identification */}
             <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-bento-border pb-4">
                   <div className="w-10 h-10 bg-[rgba(39,174,96,0.1)] rounded-xl flex items-center justify-center text-bento-accent"><Shield size={20} /></div>
                   <h3 className="text-xl font-black italic text-bento-dark">পরিবার ও পরিচয়</h3>
                </div>
                <div className="space-y-6">
                   <InputField label="পিতার নাম" value={formData.father_name} onChange={(e: any) => setFormData({ ...formData, father_name: e.target.value })} required />
                   <InputField label="মাতার নাম" value={formData.mother_name} onChange={(e: any) => setFormData({ ...formData, mother_name: e.target.value })} required />
                   <InputField label="এনআইডি নম্বর" value={formData.nid_number} onChange={(e: any) => setFormData({ ...formData, nid_number: e.target.value })} required />
                   <InputField label="জরুরি যোগাযোগ" value={formData.emergency_contact} onChange={(e: any) => setFormData({ ...formData, emergency_contact: e.target.value })} placeholder="মোবাইল নম্বর" required />
                </div>
             </div>

             {/* Section 3: Contact & Account */}
             <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-bento-border pb-4">
                   <div className="w-10 h-10 bg-[rgba(59,130,246,0.1)] rounded-xl flex items-center justify-center text-blue-500"><Mail size={20} /></div>
                   <h3 className="text-xl font-black italic text-bento-dark">যোগাযোগ ও অ্যাকাউন্ট</h3>
                </div>
                <div className="space-y-6">
                   <InputField label="মোবাইল নম্বর" value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} placeholder="017XXXXXXXX" required />
                   <InputField label="ইমেইল" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} type="email" placeholder="example@mail.com" required />
                   <div className="grid grid-cols-2 gap-4">
                      <InputField label="ইউজার আইডি (English)" value={formData.userId} onChange={(e: any) => setFormData({ ...formData, userId: e.target.value })} placeholder="@username" required />
                      <InputField label="পাসওয়ার্ড" type="password" value={formData.password} onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required />
                   </div>
                </div>
             </div>
          </div>

          {/* Addresses - Wide Section */}
          <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-bento-border">
             <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-bento-light flex items-center gap-2"> <MapPin size={14} /> বর্তমান ঠিকানা</label>
                <textarea 
                  className="w-full bg-gray-50 border-2 border-bento-border rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-[rgba(192,57,43,0.05)] focus:border-bento-primary outline-none transition min-h-[120px]"
                  value={formData.present_address}
                  onChange={(e) => setFormData({ ...formData, present_address: e.target.value })}
                  placeholder="গ্রাম, ডাকঘর, থানা, জেলা..."
                  required
                />
             </div>
             <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-bento-light flex items-center gap-2"> <MapPin size={14} /> স্থায়ী ঠিকানা</label>
                <textarea 
                  className="w-full bg-gray-50 border-2 border-bento-border rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-[rgba(192,57,43,0.05)] focus:border-bento-primary outline-none transition min-h-[120px]"
                  value={formData.permanent_address}
                  onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                  placeholder="গ্রাম, ডাকঘর, থানা, জেলা..."
                  required
                />
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-10 bg-gray-50 p-10 rounded-[2.5rem] border border-bento-border">
             <div className="flex items-center gap-6 text-bento-light italic text-sm max-w-xl">
                <div className="w-16 h-16 bg-bento-primary rounded-[1.5rem] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[rgba(192,57,43,0.2)]"><Shield size={32} /></div>
                <p className="leading-relaxed font-serif">আপনার সকল তথ্য সম্পূর্ণ নিরাপদ এবং শুধুমাত্র সংগঠনের অভ্যন্তরীণ প্রয়োজনে ব্যবহৃত হবে। আবেদনের পর এডমিন প্যানেল আপনার তথ্য যাচাই করবে।</p>
             </div>
             <button type="submit" className="w-full md:w-auto bg-bento-primary text-white px-20 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-[rgba(192,57,43,0.3)] hover:scale-105 active:scale-95 transition">
               আবেদন সম্পূর্ণ করুন
             </button>
          </div>
          {error && <p className="text-red-500 text-sm font-black bg-red-50 p-6 rounded-[2rem] border border-red-100 text-center uppercase tracking-widest">{error}</p>}
        </form>
      </motion.div>
    </div>
  );
};

const MembershipCard = ({ profile, siteSettings }: { profile: any, siteSettings: any }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const logoUrl = siteSettings?.logo_url || "https://picsum.photos/seed/logo/100/100";

  const downloadCard = async () => {
    if (cardRef.current) {
      try {
        // We use a small delay to ensure any layout shifts are settled
        await new Promise(resolve => setTimeout(resolve, 100));
        const canvas = await html2canvas(cardRef.current, {
          scale: 4, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
             // You can manipulate the cloned document here if needed
             // But usually ensuring safe styles on original is better
          }
        });
        const link = document.createElement('a');
        link.download = `Odommo24_Member_${profile?.userId || 'Card'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Card download failed", err);
        alert("কার্ড ডাউনলোড ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    }
  };

  if (!profile) return null;

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem', 
        alignItems: 'center',
        padding: '2rem 0'
      }}
    >
      <div 
        ref={cardRef}
        style={{ 
          position: 'relative',
          width: '320px',
          height: '550px',
          background: '#ffffff',
          borderRadius: '1.25rem',
          overflow: 'hidden',
          color: '#1a1f26',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e1e8ed',
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          display: 'flex',
          flexDirection: 'column'
        }}
      >
         {/* Top Header Section */}
         <div 
           style={{ 
             backgroundColor: '#1a1f26', 
             padding: '1.5rem 1.25rem', 
             textAlign: 'center',
             position: 'relative',
             height: '140px',
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             justifyContent: 'center',
             borderBottom: '4px solid #c0392b'
           }}
         >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
               <img 
                 src={logoUrl} 
                 style={{ 
                   width: '3rem', 
                   height: '3rem', 
                   borderRadius: '50%', 
                   border: '2px solid #ffffff',
                   backgroundColor: '#ffffff',
                   objectFit: 'cover'
                 }} 
                 alt="Logo" 
                 crossOrigin="anonymous" 
                 referrerPolicy="no-referrer" 
               />
               <div style={{ textAlign: 'left', color: '#ffffff' }}>
                 <h3 style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, lineHeight: 1.1, letterSpacing: '0.02em' }}>ODOMMO 24</h3>
                 <p style={{ fontSize: '0.5rem', fontWeight: 600, textTransform: 'uppercase', margin: '0.25rem 0 0', opacity: 0.9, letterSpacing: '0.1em' }}>Humanity • Justice • Accountability</p>
               </div>
            </div>
            
            <div style={{ 
               marginTop: '0.5rem', 
               backgroundColor: 'rgba(255, 255, 255, 0.15)', 
               padding: '0.25rem 1rem', 
               borderRadius: '1rem',
               border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
               <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Identity Card</span>
            </div>

            {/* Decorative bottom curve */}
            <div style={{ 
               position: 'absolute', 
               bottom: '-1px', 
               left: 0, 
               width: '100%', 
               height: '25px', 
               backgroundColor: '#ffffff',
               clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)'
            }}></div>
         </div>

         {/* Middle Section (Photo & Basic Info) */}
         <div style={{ padding: '0 1.25rem 1.25rem', textAlign: 'center', marginTop: '-35px', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* User Photo */}
            <div 
              style={{ 
                width: '115px',
                height: '115px',
                borderRadius: '50%',
                border: '4px solid #ffffff',
                boxShadow: '0 8px 20px -4px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                backgroundColor: '#f8f9fa',
                zIndex: 10,
                marginBottom: '1rem'
              }}
            >
               {profile.profile_image ? (
                 <img 
                   src={profile.profile_image} 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   crossOrigin="anonymous" 
                   referrerPolicy="no-referrer" 
                 />
               ) : (
                 <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dee2e6' }}>
                   <UserIcon size={50} strokeWidth={1.5} />
                 </div>
               )}
            </div>

            {/* Name & Designation */}
            <div style={{ marginBottom: '1.5rem' }}>
               <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#1a1f26', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{profile.name || 'FULL NAME'}</h2>
               <div style={{ display: 'inline-block', backgroundColor: '#c0392b', height: '2px', width: '40px', margin: '0.25rem auto' }}></div>
               <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c0392b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>REGISTERED VOLUNTEER</p>
            </div>

            {/* Information Grid */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#718096', textTransform: 'uppercase' }}>MEMBER ID</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1a1f26' }}>{profile.member_id_number || profile.userId || 'N/A'}</span>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#718096', textTransform: 'uppercase' }}>FATHER'S NAME</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1f26' }}>{profile.father_name || 'NOT SPECIFIED'}</span>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#718096', textTransform: 'uppercase' }}>BLOOD GROUP</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#c0392b' }}>{profile.blood_group || 'N/A'}</span>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#718096', textTransform: 'uppercase' }}>PHONE</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1f26' }}>{profile.phone || 'N/A'}</span>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', padding: '0.4rem 0' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#718096', textTransform: 'uppercase' }}>VALIDITY</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38a169', fontStyle: 'italic' }}>LIFE TIME MEMBER</span>
               </div>
            </div>

            {/* Bottom Signature Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: '1.25rem' }}>
               <div style={{ textAlign: 'center', width: '80px' }}>
                  <div style={{ height: '30px', borderBottom: '1px solid #333', marginBottom: '4px' }}></div>
                  <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#7f8c8d', textTransform: 'uppercase' }}>Holder Sign</span>
               </div>
               <div style={{ textAlign: 'center' }}>
                  <div 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      padding: '3px',
                      borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #e1e8ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '56px',
                      height: '56px'
                    }}
                  >
                     <QRCodeCanvas 
                        value={`${window.location.origin}/profile/${profile.userId}`} 
                        size={50}
                        level="H"
                        includeMargin={false}
                     />
                  </div>
               </div>
               <div style={{ textAlign: 'center', width: '80px' }}>
                  <div style={{ height: '30px', position: 'relative', marginBottom: '4px' }}>
                     <img 
                       src={logoUrl} 
                       style={{ height: '25px', opacity: 0.3, filter: 'grayscale(100%)', position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }} 
                       alt="Seal"
                     />
                     <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderBottom: '1px solid #333' }}></div>
                  </div>
                  <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#7f8c8d', textTransform: 'uppercase' }}>Auth Seal</span>
               </div>
            </div>
         </div>

         {/* Footer Bar */}
         <div 
           style={{ 
             backgroundColor: '#1a1f26', 
             padding: '0.75rem 1rem', 
             textAlign: 'center',
             borderTop: '3px solid #c0392b'
           }}
         >
            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.15em' }}>WWW.ODOMMO24.ORG</p>
         </div>
         
         {/* Holographic Watermark Background */}
         <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%) rotate(-30deg)', 
            fontSize: '4rem', 
            fontWeight: 900, 
            color: 'rgba(0, 0, 0, 0.02)', 
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
         }}>
           ODOMMO 24
         </div>
      </div>
      <button 
        onClick={downloadCard} 
        className="flex items-center gap-2 bg-[#c0392b]/10 text-[#c0392b] hover:bg-[#c0392b] hover:text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md group"
      >
         <Download size={14} className="group-hover:scale-110 transition-transform" /> Download Vertical ID Card
      </button>
    </div>
  );
};

const ProfilePage = () => {
  const { user, siteSettings } = useAuth();
  const [profile, setProfile] = useState<any>(user);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Fetch profile failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      setMsg('আপডেট সফল হয়েছে!');
      setEditing(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const res = await fetch('/api/auth/profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String }),
      });
      if (res.ok) {
        setProfile({ ...profile, profile_image: base64String });
        setMsg('ছবি আপডেট করা হয়েছে!');
        setTimeout(() => setMsg(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-bento-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const profileData = profile || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f6fa] via-white to-[#eff6ff] pb-32">
      {/* Profile Hero Header */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bento-primary to-bento-accent opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/pattern/1920/1080')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f5f6fa] to-transparent"></div>
        
        <div className="container mx-auto px-6 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-4">
             <div className="w-44 h-44 bg-white rounded-[3rem] p-2 shadow-2xl relative group ring-8 ring-white/30">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-gray-100 flex items-center justify-center">
                   {profileData.profile_image ? (
                     <img src={profileData.profile_image} alt={profileData.name} className="w-full h-full object-cover" />
                   ) : (
                     <UserIcon size={80} className="text-gray-300" />
                   )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-2 bg-black/60 text-white rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1 backdrop-blur-sm"
                >
                   <Camera size={20} />
                   <span className="text-[8px] font-black uppercase tracking-widest italic">Update</span>
                </button>
             </div>
             <div className="text-center md:text-left space-y-2">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                   <h1 className="text-5xl md:text-6xl font-serif text-white italic drop-shadow-lg">{profileData.name || 'Anonymous User'}</h1>
                   <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md text-white border border-white/30`}>
                     {profileData.role}
                   </span>
                </div>
                <div className="flex flex-col items-center md:items-start gap-2">
                   <p className="text-white/80 font-serif italic text-xl">@{profileData.userId || 'username'}</p>
                   {profileData.member_id_number && (
                     <span className="text-white/90 font-black text-[10px] uppercase tracking-[0.3em] bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                       Member No: {profileData.member_id_number}
                     </span>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-10 relative z-20 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Left Column: Actions & Card */}
          <div className="lg:col-span-4 space-y-10">
             {/* Membership Card Display */}
             <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white/50 ring-1 ring-black/5">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-bento-light mb-8 text-center italic">ডিজিটাল মেম্বারশিপ কার্ড</h3>
                <MembershipCard profile={profileData} siteSettings={siteSettings} />
             </div>

             <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 shadow-xl border border-white/50 space-y-4">
                <button onClick={() => setEditing(!editing)} className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all duration-300 shadow-lg ${editing ? 'bg-bento-dark text-white' : 'bg-bento-primary text-white hover:scale-[1.02] hover:shadow-bento-primary/30'}`}>
                  {editing ? 'এডিট বন্ধ করুন' : 'প্রোফাইল আপডেট করুন'}
                </button>
                <Link to="/donations" className="block w-full text-center py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border-2 border-bento-accent text-bento-accent hover:bg-bento-accent hover:text-white transition-all duration-300">
                  সংগঠনে দান করুন
                </Link>
             </div>
          </div>

          {/* Right Column: Information Grid */}
          <div className="lg:col-span-8 space-y-10 focus:outline-none">
             {editing ? (
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border border-white/50 ring-1 ring-black/5">
                    <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-x-8 gap-y-10">
                       <div className="md:col-span-2 flex items-center gap-4 border-b border-gray-200 pb-4 mb-2">
                          <div className="w-10 h-10 bg-bento-primary/10 rounded-xl flex items-center justify-center text-bento-primary"><UserPlus size={20} /></div>
                          <h3 className="text-xl font-black italic text-bento-dark uppercase tracking-wider text-left">তথ্য সংশোধন করুন</h3>
                       </div>
                       
                       <div className="md:col-span-2 grid md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-bento-primary ml-1">ব্যক্তিগত তথ্য</h4>
                             <InputField label="নাম" value={profileData.name} onChange={(e:any)=>setProfile({...profileData, name: e.target.value})} icon={UserIcon} />
                             <InputField label="রক্তের গ্রুপ" value={profileData.blood_group || ''} onChange={(e:any)=>setProfile({...profileData, blood_group: e.target.value})} icon={Heart} />
                             <InputField label="জন্ম তারিখ" type="date" value={profileData.dob || ''} onChange={(e:any)=>setProfile({...profileData, dob: e.target.value})} icon={Calendar} />
                             <InputField label="পেশা" value={profileData.profession || ''} onChange={(e:any)=>setProfile({...profileData, profession: e.target.value})} icon={Briefcase} />
                             <InputField label="শিক্ষাগত যোগ্যতা" value={profileData.educational_qualification || ''} onChange={(e:any)=>setProfile({...profileData, educational_qualification: e.target.value})} icon={Shield} />
                             <InputField label="জাতীয় পরিচয়পত্র" value={profileData.nid_number || ''} onChange={(e:any)=>setProfile({...profileData, nid_number: e.target.value})} icon={CreditCard} />
                          </div>
                          
                          <div className="space-y-6">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-bento-accent ml-1">পারিবারিক ও যোগাযোগ</h4>
                             <InputField label="পিতার নাম" value={profileData.father_name || ''} onChange={(e:any)=>setProfile({...profileData, father_name: e.target.value})} icon={UserIcon} />
                             <InputField label="মাতার নাম" value={profileData.mother_name || ''} onChange={(e:any)=>setProfile({...profileData, mother_name: e.target.value})} icon={UserIcon} />
                             <InputField label="মোবাইল" value={profileData.phone || ''} onChange={(e:any)=>setProfile({...profileData, phone: e.target.value})} icon={Phone} />
                             <InputField label="জরুরি যোগাযোগ" value={profileData.emergency_contact || ''} onChange={(e:any)=>setProfile({...profileData, emergency_contact: e.target.value})} icon={Shield} />
                             <InputField label="ইমেইল" value={profileData.email || ''} onChange={(e:any)=>setProfile({...profileData, email: e.target.value})} icon={Mail} />
                          </div>
                       </div>

                       <div className="md:col-span-2 grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-bento-light ml-1 flex items-center gap-2"> <MapPin size={14} /> বর্তমান ঠিকানা</label>
                             <textarea 
                               className="w-full bg-white/50 border-2 border-bento-border rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-bento-primary/10 focus:border-bento-primary outline-none transition min-h-[120px]"
                               value={profileData.present_address || ''}
                               onChange={(e)=>setProfile({...profileData, present_address: e.target.value})}
                               placeholder="গ্রাম, ডাকঘর, থানা, জেলা..."
                             />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-bento-light ml-1 flex items-center gap-2"> <MapPin size={14} /> স্থায়ী ঠিকানা</label>
                             <textarea 
                               className="w-full bg-white/50 border-2 border-bento-border rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-bento-primary/10 focus:border-bento-primary outline-none transition min-h-[120px]"
                               value={profileData.permanent_address || ''}
                               onChange={(e)=>setProfile({...profileData, permanent_address: e.target.value})}
                               placeholder="গ্রাম, ডাকঘর, থানা, জেলা..."
                             />
                          </div>
                       </div>

                       <div className="md:col-span-2 space-y-4 pt-6 border-t border-gray-100">
                          <label className="text-[10px] font-black uppercase tracking-widest text-bento-light ml-1 flex items-center gap-2">বায়ো / নিজের সম্পর্কে</label>
                          <textarea 
                            className="w-full bg-white/50 border-2 border-bento-border rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-bento-primary/10 focus:border-bento-primary outline-none transition min-h-[100px]"
                            value={profileData.bio || ''}
                            onChange={(e)=>setProfile({...profileData, bio: e.target.value})}
                            placeholder="আপনার সম্পর্কে কিছু লিখুন..."
                          />
                       </div>

                       <div className="md:col-span-2 pt-8">
                          <button type="submit" className="w-full bg-bento-accent hover:bg-bento-dark text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.5em] shadow-xl shadow-bento-accent/20 transition hover:scale-[1.01] flex items-center justify-center gap-4">
                             <Shield size={18} /> সব তথ্য ডাটাবেজে সংরক্ষণ করুন
                          </button>
                       </div>
                    </form>
                </div>
             ) : (
               <div className="space-y-10">
                  {/* Identity Section */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { label: 'রক্তের গ্রুপ', value: profileData.blood_group, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
                      { label: 'জাতীয় পরিচয়পত্র', value: profileData.nid_number, icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
                      { label: 'জন্ম তারিখ', value: profileData.dob, icon: Calendar, color: 'text-green-500', bg: 'bg-green-50' },
                      { label: 'মোবাইল নং', value: profileData.phone, icon: Phone, color: 'text-bento-primary', bg: 'bg-red-50' },
                    ].map((field, idx) => (
                      <motion.div key={idx} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: idx*0.05}} className="p-8 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-lg hover:shadow-2xl hover:bg-white transition-all duration-500 flex items-center gap-6 group">
                         <div className={`w-16 h-16 ${field.bg} rounded-[1.5rem] flex items-center justify-center ${field.color} shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                            <field.icon size={28} />
                         </div>
                         <div className="space-y-1 text-left">
                            <p className="text-[10px] font-black text-bento-light uppercase tracking-widest leading-none">{field.label}</p>
                            <p className="text-xl font-black text-bento-dark italic">{field.value || 'N/A'}</p>
                         </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Professional & Address Section */}
                  <div className="bg-white/60 backdrop-blur-md rounded-[3rem] border border-white/50 shadow-xl p-10 grid md:grid-cols-2 gap-10">
                     <div className="space-y-8">
                        <div className="flex items-center gap-4">
                           <Briefcase className="text-purple-500" />
                           <div className="text-left">
                              <p className="text-[10px] font-black text-bento-light uppercase tracking-widest">পেশা ও শিক্ষা</p>
                              <p className="text-lg font-black text-bento-dark italic">{profileData.profession || 'N/A'}</p>
                              <p className="text-sm text-bento-light italic">{profileData.educational_qualification || 'N/A'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <Shield className="text-bento-accent" />
                           <div className="text-left">
                              <p className="text-[10px] font-black text-bento-light uppercase tracking-widest">জরুরী যোগাযোগ</p>
                              <p className="text-lg font-black text-bento-dark italic">{profileData.emergency_contact || 'N/A'}</p>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-8 text-left">
                        <div className="flex items-start gap-4">
                           <MapPin className="text-orange-500 shrink-0 mt-1" />
                           <div className="text-left">
                              <p className="text-[10px] font-black text-bento-light uppercase tracking-widest">বর্তমান ঠিকানা</p>
                              <p className="text-sm italic leading-relaxed text-bento-dark font-medium mt-1">{profileData.present_address || 'N/A'}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4">
                           <MapPin className="text-bento-primary shrink-0 mt-1" />
                           <div className="text-left">
                              <p className="text-[10px] font-black text-bento-light uppercase tracking-widest">স্থায়ী ঠিকানা</p>
                              <p className="text-sm italic leading-relaxed text-bento-dark font-medium mt-1">{profileData.permanent_address || 'N/A'}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Contribution Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-bento-border text-center space-y-2">
                       <Heart size={32} className="text-red-500 mx-auto" />
                       <h4 className="text-3xl font-black italic text-bento-dark">০৫ বার</h4>
                       <p className="text-[9px] font-black text-bento-light uppercase tracking-widest">রক্তদান</p>
                    </div>
                    <div className="bg-bento-dark p-8 rounded-[2.5rem] shadow-xl text-center space-y-2">
                       <Zap size={32} className="text-yellow-400 mx-auto" />
                       <h4 className="text-3xl font-black italic text-white">১২টি</h4>
                       <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">ইভেন্ট</p>
                    </div>
                    <div className="bg-bento-primary p-8 rounded-[2.5rem] shadow-xl text-center space-y-2 col-span-2 md:col-span-1">
                       <Shield size={32} className="text-white mx-auto" />
                       <h4 className="text-3xl font-black italic text-white">১.২ বছর</h4>
                       <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">সদস্যকাল</p>
                    </div>
                  </div>
               </div>
             )}
             {msg && <p className="text-center font-black text-bento-accent uppercase tracking-widest bg-green-50 p-6 rounded-3xl border border-green-100 animate-bounce">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, logout, siteSettings } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const logoUrl = siteSettings?.logo_url || "https://picsum.photos/seed/logo/100/100";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ to, children, icon: Icon }: any) => (
    <Link 
      to={to} 
      className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white/10 hover:text-bento-primary group text-white/70"
    >
      {Icon && <Icon size={14} className="group-hover:scale-125 transition-transform" />}
      {children}
    </Link>
  );

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="container mx-auto px-6">
        <div className={`flex items-center justify-between px-8 py-4 rounded-[2rem] transition-all duration-500 border border-white/10 ${scrolled ? 'bg-[#2f3640]/80 backdrop-blur-2xl shadow-2xl shadow-black/20' : 'bg-transparent'}`}>
           <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white rounded-2xl p-2 shadow-2xl transition group-hover:scale-110 group-hover:rotate-6">
                 <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="hidden sm:block">
                 <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Odommo 24</h2>
                 <p className="text-[7px] font-black text-bento-primary uppercase tracking-[0.3em] mt-1 italic leading-none">The Fearless Youth</p>
              </div>
           </Link>

           <div className="hidden lg:flex items-center gap-2">
              <NavLink to="/events" icon={Calendar}>ইভেন্ট</NavLink>
              <NavLink to="/donations" icon={Heart}>দান</NavLink>
              <a href="#committee" className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white/10 hover:text-bento-primary group text-white/70">কমিটি</a>
              <NavLink to="/gallery" icon={Camera}>গ্যালারি</NavLink>
           </div>

           <div className="flex items-center gap-4">
              {user ? (
                 <div className="flex items-center gap-4">
                    <Link to="/profile" className="hidden sm:flex items-center gap-3 bg-white/10 hover:bg-white hover:text-bento-dark px-6 py-3 rounded-2xl transition-all border border-white/10 group">
                       <div className="w-8 h-8 rounded-xl bg-bento-primary flex items-center justify-center text-white overflow-hidden shadow-inner font-serif italic text-sm">
                          {user.profile_image ? <img src={user.profile_image} className="w-full h-full object-cover" /> : user.name?.[0]}
                       </div>
                       <span className="text-[10px] font-black italic uppercase tracking-widest text-white group-hover:text-bento-dark shrink-0">{user.name}</span>
                    </Link>
                    {user.role === 'admin' && (
                       <Link to="/admin" className="p-3 bg-bento-primary text-white rounded-2xl shadow-lg shadow-bento-primary/30 hover:scale-105 transition"><Settings size={20} /></Link>
                    )}
                    <button onClick={logout} className="p-3 bg-white/5 hover:bg-red-500/10 text-white hover:text-red-500 rounded-2xl transition border border-white/10"><LogOut size={20} /></button>
                 </div>
              ) : (
                 <div className="flex items-center gap-3">
                    <Link to="/login" className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition">লগইন</Link>
                    <Link to="/register" className="bg-gradient-to-r from-bento-primary to-bento-accent text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-bento-primary/20 hover:scale-105 transition active:scale-95">আবেদন</Link>
                 </div>
              )}
              <button className="lg:hidden p-3 bg-white/5 text-white rounded-2xl" onClick={() => setIsOpen(!isOpen)}>
                 {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
         {isOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="lg:hidden mx-6 mt-4 p-8 bg-[#2f3640] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl space-y-4">
               <Link to="/events" className="flex items-center gap-4 text-white font-black uppercase text-xs p-4 bg-white/5 rounded-2xl" onClick={()=>setIsOpen(false)}>ইভেন্ট তালিকা</Link>
               <Link to="/donations" className="flex items-center gap-4 text-white font-black uppercase text-xs p-4 bg-white/5 rounded-2xl" onClick={()=>setIsOpen(false)}>তহবিলে দান</Link>
               <a href="#committee" className="flex items-center gap-4 text-white font-black uppercase text-xs p-4 bg-white/5 rounded-2xl" onClick={()=>setIsOpen(false)}>কেন্দ্রীয় কমিটি</a>
               <Link to="/gallery" className="flex items-center gap-4 text-white font-black uppercase text-xs p-4 bg-white/5 rounded-2xl" onClick={()=>setIsOpen(false)}>ফটো গ্যালারি</Link>
            </motion.div>
         )}
      </AnimatePresence>
    </nav>
  );
};

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [newEvenTitle, setNewEventTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'committee' | 'settings'>('members');
  const { siteSettings, updateSettings } = useAuth();
  const [logoInput, setLogoInput] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [committee, setCommittee] = useState<any[]>([]);
  const [newMember, setNewMember] = useState({ name: '', role: '', image_url: '', sort_order: 0 });
  const [adminStats, setAdminStats] = useState({ success: '', error: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const committeeFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'logo' | 'hero' | null>(null);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.ok ? r.json() : []).then(data => setUsers(Array.isArray(data) ? data : []));
    fetch('/api/events').then(r => r.ok ? r.json() : []).then(data => setEvents(Array.isArray(data) ? data : []));
    fetch('/api/committee').then(r => r.ok ? r.json() : []).then(data => setCommittee(Array.isArray(data) ? data : []));
  }, []);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setAdminStats({ ...adminStats, [type]: msg });
    setTimeout(() => setAdminStats({ success: '', error: '' }), 3000);
  };

  useEffect(() => {
    if (siteSettings?.logo_url) setLogoInput(siteSettings.logo_url);
  }, [siteSettings]);

  const handleLogoUpdate = async () => {
    try {
      await updateSettings('logo_url', logoInput);
      showFeedback('success', 'Logo updated successfully');
    } catch (err) {
      showFeedback('error', 'Logo update failed');
    }
  };

  const handleHeroAdd = async () => {
    if (!heroInput) return;
    try {
      let current = [];
      try {
        current = siteSettings?.hero_images ? JSON.parse(siteSettings.hero_images) : [];
        if (!Array.isArray(current)) current = [];
      } catch (e) {
        current = [];
      }
      const updated = [...current, heroInput];
      await updateSettings('hero_images', JSON.stringify(updated));
      setHeroInput('');
      showFeedback('success', 'Hero image added');
    } catch (err) {
      showFeedback('error', 'Add failed');
    }
  };

  const removeHeroImg = async (idx: number) => {
    try {
      let current = [];
      try {
        current = siteSettings?.hero_images ? JSON.parse(siteSettings.hero_images) : [];
      } catch (e) {
        current = [];
      }
      const updated = current.filter((_: any, i: number) => i !== idx);
      await updateSettings('hero_images', JSON.stringify(updated));
      showFeedback('success', 'Hero image removed');
    } catch (err) {
      showFeedback('error', 'Remove failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      if (uploadTarget === 'logo') {
        setLogoInput(base64);
        await updateSettings('logo_url', base64);
      } else {
        const current = siteSettings?.hero_images ? JSON.parse(siteSettings.hero_images) : [];
        const updated = [...current, base64];
        await updateSettings('hero_images', JSON.stringify(updated));
      }
      setUploadTarget(null);
    };
    reader.readAsDataURL(file);
  };

  const createEvent = async () => {
    if (!newEvenTitle) return;
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newEvenTitle, description: 'New event scheduled.', date: new Date().toISOString() })
    });
    setNewEventTitle('');
    fetch('/api/events').then(r => r.json()).then(setEvents);
  };

  const toggleRole = async (uId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    await fetch(`/api/admin/users/${uId}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) });
    fetch('/api/admin/users').then(r => r.ok ? r.json() : []).then(data => setUsers(Array.isArray(data) ? data : []));
  };

  const addCommitteeMember = async () => {
    if (!newMember.name || !newMember.role) return;
    try {
      const res = await fetch('/api/admin/committee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      if (res.ok) {
        showFeedback('success', 'মেম্বার সফলভাবে যোগ করা হয়েছে');
        setNewMember({ name: '', role: '', image_url: '', sort_order: 0 });
        fetch('/api/committee').then(r => r.json()).then(setCommittee);
      } else {
        const data = await res.json();
        showFeedback('error', data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      showFeedback('error', 'সার্ভার সংযোগে ত্রুটি');
    }
  };

  const deleteCommitteeMember = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/committee/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'মেম্বার মুছে ফেলা হয়েছে');
        fetch('/api/committee').then(r => r.json()).then(setCommittee);
      } else {
         showFeedback('error', 'মুছে ফেলা ব্যর্থ হয়েছে');
      }
    } catch (err) {
      showFeedback('error', 'সার্ভার সংযোগে ত্রুটি');
    }
  };

  const handleCommitteeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMember(prev => ({ ...prev, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Odommo 24 - Member List', 14, 15);
    const tableData = users.map(u => [
      u.name,
      u.userId,
      u.phone,
      u.blood_group,
      u.profession,
      u.role
    ]);
    autoTable(doc, {
      head: [['Name', 'ID', 'Phone', 'Blood', 'Profession', 'Role']],
      body: tableData,
      startY: 20,
    });
    doc.save('Odommo_Member_List.pdf');
  };

  const filteredUsers = users.filter(u => 
    (u.phone && u.phone.includes(searchTerm)) || 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-6 py-32 space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
         <div className="space-y-4">
            <span className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px] ml-1">Admin Control Room</span>
            <h2 className="text-7xl font-serif italic text-bento-dark leading-tight">অ্যাডমিন ড্যাশবোর্ড</h2>
         </div>
         <div className="flex gap-4">
            <div className="bg-white border-2 border-bento-border p-8 rounded-[2.5rem] text-center shadow-lg min-w-[160px]">
               <h4 className="text-5xl font-black italic text-bento-primary">{Array.isArray(users) ? users.length : 0}</h4>
               <p className="text-[10px] font-black uppercase tracking-widest text-bento-light mt-1">সদস্য</p>
            </div>
            <button onClick={downloadPDF} className="bg-bento-accent text-white p-8 rounded-[2.5rem] text-center shadow-lg min-w-[160px] flex flex-col items-center justify-center hover:scale-105 transition">
               <Download size={32} className="mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest">PDF লিস্ট</p>
            </button>
         </div>
      </div>

      <div className="flex gap-4 border-b border-bento-border pb-4 overflow-x-auto">
         {['members', 'events', 'committee', 'settings'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === tab ? 'bg-bento-primary text-white shadow-lg shadow-[rgba(192,57,43,0.2)]' : 'text-bento-light hover:bg-gray-100'}`}
            >
              {tab === 'members' ? 'সদস্য তালিকা' : tab === 'events' ? 'ইভেন্ট ম্যানেজমেন্ট' : tab === 'committee' ? 'কমিটি ম্যানেজমেন্ট' : 'সাইট সেটিংস'}
            </button>
         ))}
      </div>
      
      {activeTab === 'members' && (
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 rounded-[24px] bg-white p-12 shadow-2xl relative overflow-hidden group border border-gray-100">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition duration-1000"><Users size={200} /></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-bento-border pb-6">
              <h2 className="text-2xl font-black italic flex items-center gap-3"><Users className="text-bento-primary" /> সকল সদস্য তালিকা</h2>
              <div className="relative w-full md:w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-light" size={16} />
                 <input 
                   type="text" 
                   placeholder="Phone বা Name দিয়ে খুঁজুন..." 
                   className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-bento-border rounded-xl focus:border-bento-primary outline-none transition text-sm italic"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-6 pr-4 custom-scrollbar relative z-10">
               {Array.isArray(filteredUsers) && filteredUsers.map(u => (
                  <div key={u.id} className="bg-gray-50 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 border border-bento-border hover:bg-white hover:border-bento-primary hover:shadow-xl transition-all duration-500">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-inner border border-bento-border">
                           {u.profile_image ? (
                             <img src={u.profile_image} className="w-full h-full object-cover" />
                           ) : (
                             <span className="font-serif text-3xl text-bento-primary">{u.name ? u.name[0] : '?'}</span>
                           )}
                        </div>
                        <div>
                           <p className="font-black text-xl italic text-bento-dark">{u.name}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-bento-light">ID: @{u.userId} | Phone: {u.phone}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedUser(u)} className="p-3 bg-white border-2 border-bento-border rounded-xl text-bento-light hover:text-bento-primary hover:border-bento-primary transition"><Info size={20} /></button>
                        <button onClick={() => toggleRole(u.id, u.role)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition active:scale-95 ${u.role === 'admin' ? 'bg-bento-primary text-white' : 'bg-white border-2 border-bento-border text-bento-light hover:border-bento-primary hover:text-bento-primary'}`}>{u.role}</button>
                     </div>
                  </div>
               ))}
               {filteredUsers.length === 0 && <p className="text-center py-20 text-bento-light italic font-serif">কোন সদস্য পাওয়া যায়নি...</p>}
            </div>
         </div>
         <div className="lg:col-span-4 space-y-8">
            <div className="rounded-[24px] bg-[#2f3640] text-white p-12 shadow-2xl space-y-8 relative overflow-hidden text-center justify-center flex flex-col items-center">
               <div className="w-20 h-20 bg-[rgba(192,57,43,0.1)] rounded-full flex items-center justify-center text-bento-primary"><Shield size={40} /></div>
               <h3 className="text-2xl font-black italic">সদস্য তথ্য যাচাই</h3>
               <p className="text-xs text-[rgba(255,255,255,0.4)] leading-relaxed italic uppercase tracking-widest">সকল তথ্য সঠিকভাবে ইনপুট দিন</p>
            </div>
         </div>
      </div>
      )}

      {activeTab === 'events' && (
         <div className="bento-card border-none bg-white p-12 shadow-2xl space-y-12">
            <h3 className="text-3xl font-serif italic text-bento-dark border-b pb-6">ইভেন্ট ম্যানেজমেন্ট</h3>
            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-bento-primary">নতুন ইভেন্ট যোগ করুন</h4>
                  <div className="space-y-6">
                     <InputField label="ইভেন্ট টাইটেল" value={newEvenTitle} onChange={(e:any)=>setNewEventTitle(e.target.value)} placeholder="উদা: রক্তদান কর্মসূচি" />
                     <button onClick={createEvent} className="w-full bg-bento-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[rgba(192,57,43,0.2)] hover:scale-[1.02] active:scale-95 transition">পাবলিশ করুন</button>
                  </div>
               </div>
               <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-bento-light">বর্তমান ইভেন্টসমূহ</h4>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                     {events.map(e => (
                        <div key={e.id} className="p-4 bg-gray-50 rounded-2xl border border-bento-border flex justify-between items-center">
                           <p className="font-bold text-sm italic">{e.title}</p>
                           <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{new Date(e.date).toLocaleDateString()}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'committee' && (
         <div className="bento-card border-none bg-white p-12 shadow-2xl space-y-12">
            <h3 className="text-3xl font-serif italic text-bento-dark border-b pb-6">কেন্দ্রীয় আহ্বায়ক কমিটি ম্যানেজমেন্ট</h3>
            <div className="grid md:grid-cols-12 gap-12">
               <div className="md:col-span-5 space-y-8">
                  <h4 className="text-xs font-black uppercase tracking-widest text-bento-primary">নতুন মেম্বার যোগ করুন</h4>
                  <div className="space-y-6">
                     <div className="flex justify-center">
                        <div 
                           onClick={() => committeeFileInputRef.current?.click()}
                           className="w-32 h-32 bg-gray-50 rounded-3xl border-2 border-dashed border-bento-border flex flex-col items-center justify-center cursor-pointer hover:border-bento-primary transition overflow-hidden group"
                        >
                           {newMember.image_url ? (
                              <img src={newMember.image_url} className="w-full h-full object-cover" />
                           ) : (
                              <>
                                 <Camera size={24} className="text-bento-light group-hover:text-bento-primary transition" />
                                 <p className="text-[8px] font-black uppercase tracking-widest text-bento-light mt-2">ছবি আপলোড</p>
                              </>
                           )}
                        </div>
                        <input type="file" ref={committeeFileInputRef} className="hidden" accept="image/*" onChange={handleCommitteeImageUpload} />
                     </div>
                     <InputField label="সদস্যের নাম" value={newMember.name} onChange={(e:any)=>setNewMember({...newMember, name: e.target.value})} placeholder="উদা: মোহাম্মদ সজীব আহমেদ" />
                     <InputField label="পদবী" value={newMember.role} onChange={(e:any)=>setNewMember({...newMember, role: e.target.value})} placeholder="উদা: কোষাধ্যক্ষ" />
                     <InputField label="ক্রম (Sort Order)" type="number" value={newMember.sort_order} onChange={(e:any)=>setNewMember({...newMember, sort_order: parseInt(e.target.value) || 0})} placeholder="0, 1, 2..." />
                     <button onClick={addCommitteeMember} className="w-full bg-bento-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[rgba(192,57,43,0.2)] hover:scale-[1.02] active:scale-95 transition">সংরক্ষণ করুন</button>
                     {adminStats.success && <p className="text-green-500 text-[10px] font-black uppercase text-center">{adminStats.success}</p>}
                     {adminStats.error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{adminStats.error}</p>}
                  </div>
               </div>
               <div className="md:col-span-7 space-y-6">
                  <div className="flex justify-between items-center">
                     <h4 className="text-xs font-black uppercase tracking-widest text-bento-light">কমিটি সদস্যবৃন্দ ({committee.length})</h4>
                     <button onClick={() => fetch('/api/committee').then(r => r.json()).then(setCommittee)} className="text-[10px] font-black uppercase text-bento-primary hover:underline transition">রিফ্রেশ</button>
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                     {committee.map(m => (
                        <div key={m.id} className="p-4 bg-gray-50 rounded-2xl border border-bento-border flex justify-between items-center group">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-bento-border">
                                 <img src={m.image_url || `https://picsum.photos/seed/mem${m.id}/100/100`} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                 <p className="font-bold text-sm italic">{m.name}</p>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-bento-primary">{m.role}</p>
                              </div>
                           </div>
                           <button onClick={() => deleteCommitteeMember(m.id)} className="p-3 bg-white text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition hover:bg-red-50">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'settings' && (
         <div className="grid lg:grid-cols-2 gap-10">
            {/* Logo Settings */}
            <div className="bento-card border-none bg-white p-12 shadow-2xl space-y-8 relative">
               <h3 className="text-2xl font-black italic flex items-center gap-3 border-b-2 border-bento-border pb-4">
                  <Settings className="text-bento-primary" /> লোগো ম্যানেজমেন্ট
               </h3>
               {adminStats.success && <p className="absolute top-4 right-12 text-green-500 font-bold text-[10px] uppercase animate-bounce">{adminStats.success}</p>}
               <div className="flex flex-col items-center gap-6">
                  <div className="w-32 h-32 bg-gray-50 rounded-3xl border-2 border-bento-primary overflow-hidden shadow-xl">
                     <img src={logoInput || siteSettings?.logo_url} className="w-full h-full object-cover" />
                  </div>
                  <div className="w-full space-y-4">
                     <InputField label="লোগো URL" value={logoInput} onChange={(e:any)=>setLogoInput(e.target.value)} placeholder="Image URL এখানে দিন..." />
                     <div className="flex gap-4">
                        <button onClick={handleLogoUpdate} className="flex-grow bg-bento-primary text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition">URL আপডেট করুন</button>
                        <button 
                           onClick={() => { setUploadTarget('logo'); fileInputRef.current?.click(); }} 
                           className="bg-bento-dark text-white px-6 py-4 rounded-xl font-black text-center"
                        >
                           <Camera size={18} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Hero Slider Settings */}
            <div className="bento-card border-none bg-white p-12 shadow-2xl space-y-8 flex flex-col relative">
               <h3 className="text-2xl font-black italic flex items-center gap-3 border-b-2 border-bento-border pb-4">
                  <Activity className="text-bento-accent" /> হিরো স্লাইডার ম্যানেজমেন্ট
               </h3>
               {adminStats.success && <p className="absolute top-4 right-12 text-green-500 font-bold text-[10px] uppercase animate-bounce">{adminStats.success}</p>}
               {adminStats.error && <p className="absolute top-4 right-12 text-red-500 font-bold text-[10px] uppercase">{adminStats.error}</p>}
               <div className="space-y-6 flex-grow">
                  <div className="grid grid-cols-2 gap-4">
                     {siteSettings?.hero_images && JSON.parse(siteSettings.hero_images).map((url: string, idx: number) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-bento-border group">
                           <img src={url} className="w-full h-full object-cover" />
                           <button onClick={() => removeHeroImg(idx)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"><Trash2 size={12} /></button>
                        </div>
                     ))}
                  </div>
                  <div className="space-y-4 mt-auto pt-6 border-t">
                     <InputField label="নতুন ইমেজ URL" value={heroInput} onChange={(e:any)=>setHeroInput(e.target.value)} placeholder="নতুন ইমেজের URL এখানে দিন..." />
                     <div className="flex gap-4">
                        <button onClick={handleHeroAdd} className="flex-grow bg-bento-accent text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition">ইমেজ যোগ করুন</button>
                        <button 
                           onClick={() => { setUploadTarget('hero'); fileInputRef.current?.click(); }} 
                           className="bg-bento-dark text-white px-6 py-4 rounded-xl font-black text-center"
                        >
                           <Camera size={18} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
            
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
         </div>
      )}

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-[rgba(47,54,64,0.8)] backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
               <div className="p-8 border-b border-bento-border flex justify-between items-center bg-gray-50">
                  <h3 className="text-2xl font-black italic text-bento-dark flex items-center gap-3"><UserIcon className="text-bento-primary" /> সদস্যর পূর্ণ বিবরণ</h3>
                  <button onClick={() => setSelectedUser(null)} className="p-3 hover:bg-white rounded-2xl transition shadow-sm"><X size={24} /></button>
               </div>
               <div className="p-12 overflow-y-auto space-y-12 text-left">
                  <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
                     <div className="w-48 h-48 bg-gray-100 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden shrink-0">
                        {selectedUser.profile_image ? (
                           <img src={selectedUser.profile_image} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-[rgba(192,57,43,0.1)] text-bento-primary text-7xl font-serif">{selectedUser.name[0]}</div>
                        )}
                     </div>
                     <div className="space-y-4">
                        <h2 className="text-5xl font-serif italic text-bento-dark leading-tight">{selectedUser.name}</h2>
                        <div className="flex flex-wrap gap-3">
                           <span className="bg-[rgba(192,57,43,0.1)] text-bento-primary text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-[rgba(192,57,43,0.2)]">{selectedUser.role}</span>
                           <span className="bg-[rgba(39,174,96,0.1)] text-bento-accent text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-[rgba(39,174,96,0.2)]">{selectedUser.blood_group}</span>
                           <span className="bg-[rgba(59,130,246,0.1)] text-blue-500 text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-[rgba(59,130,246,0.1)]">ID: @{selectedUser.userId}</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                     <DetailGroup label="ব্যক্তিগত তথ্য" items={[
                        { label: 'জন্ম তারিখ', value: selectedUser.dob },
                        { label: 'পেশা', value: selectedUser.profession },
                        { label: 'শিক্ষাগত যোগ্যতা', value: selectedUser.educational_qualification },
                        { label: 'এনআইডি', value: selectedUser.nid_number }
                     ]} />
                     <DetailGroup label="পারিবারিক তথ্য" items={[
                        { label: 'পিতার নাম', value: selectedUser.father_name },
                        { label: 'মাতার নাম', value: selectedUser.mother_name },
                        { label: 'জরুরি যোগাযোগ', value: selectedUser.emergency_contact }
                     ]} />
                     <DetailGroup label="যোগাযোগ" items={[
                        { label: 'মোবাইল', value: selectedUser.phone },
                        { label: 'ইমেইল', value: selectedUser.email }
                     ]} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-4 p-8 bg-gray-50 rounded-[2rem] border border-bento-border">
                        <h4 className="text-xs font-black uppercase tracking-widest text-bento-light flex items-center gap-2"><MapPin size={14} /> বর্তমান ঠিকানা</h4>
                        <p className="text-sm italic leading-relaxed text-bento-dark font-medium">{selectedUser.present_address}</p>
                     </div>
                     <div className="space-y-4 p-8 bg-gray-50 rounded-[2rem] border border-bento-border">
                        <h4 className="text-xs font-black uppercase tracking-widest text-bento-light flex items-center gap-2"><MapPin size={14} /> স্থায়ী ঠিকানা</h4>
                        <p className="text-sm italic leading-relaxed text-bento-dark font-medium">{selectedUser.permanent_address}</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailGroup = ({ label, items }: { label: string, items: { label: string, value: string }[] }) => (
  <div className="space-y-6">
     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-bento-primary ml-1">{label}</h4>
     <div className="space-y-4 bg-gray-50 p-6 rounded-[2rem] border border-bento-border">
        {items.map((item, idx) => (
           <div key={idx} className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-bento-light opacity-60">{item.label}</p>
              <p className="text-sm font-bold italic text-bento-dark">{item.value || 'N/A'}</p>
           </div>
        ))}
     </div>
  </div>
);

const EventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/events').then(r => r.ok ? r.json() : []).then(data => setEvents(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="container mx-auto px-6 py-20 space-y-16">
      <div className="text-center space-y-4">
         <h1 className="text-7xl font-serif text-bento-dark italic">আসন্ন ইভেন্টসমূহ</h1>
         <div className="w-40 h-1 bg-bento-primary mx-auto rounded-full"></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {Array.isArray(events) && events.map((e, index) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bento-card !p-0 group cursor-pointer overflow-hidden flex flex-col ring-1 ring-bento-border hover:ring-bento-primary transition shadow-xl">
            <div className="h-64 overflow-hidden"><img src={e.image_url || `https://picsum.photos/seed/ev${e.id}/800/600`} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" referrerPolicy="no-referrer" /></div>
            <div className="p-8 space-y-4 flex-grow flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-bento-accent bg-[rgba(39,174,96,0.1)] px-3 py-1.5 rounded-full w-fit">{new Date(e.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <h3 className="text-3xl font-serif text-bento-dark leading-tight group-hover:text-bento-primary transition h-20 overflow-hidden line-clamp-2">{e.title}</h3>
              <p className="text-bento-light text-sm italic leading-relaxed line-clamp-3 mb-6">{e.description}</p>
              <div className="pt-6 border-t border-bento-border mt-auto flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-bento-primary">
                 <span>Explore Detail</span> <ChevronRight size={16} className="group-hover:translate-x-2 transition" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const DonationsPage = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [formData, setFormData] = useState({ donor_name: '', amount: '', message: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/donations').then(r => r.ok ? r.json() : []).then(data => setDonations(Array.isArray(data) ? data : []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/donations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    if (res.ok) {
      setSuccess(true);
      setFormData({ donor_name: '', amount: '', message: '' });
      fetch('/api/donations').then(r => r.ok ? r.json() : []).then(data => setDonations(Array.isArray(data) ? data : []));
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const currentTotal = Array.isArray(donations) ? donations.reduce((sum, d) => sum + d.amount, 0) : 0;
  return (
    <div className="container mx-auto px-6 py-20 max-w-6xl space-y-20">
      <div className="grid lg:grid-cols-12 gap-12 items-start">
         <div className="lg:col-span-7 space-y-12">
            <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="bento-card border-none bg-bento-primary text-white p-16 space-y-8 relative overflow-hidden group">
               <Heart size={300} fill="currentColor" className="absolute -bottom-20 -right-20 opacity-5 group-hover:scale-110 transition duration-1000" />
               <div className="space-y-2 relative z-10">
                  <h1 className="text-7xl font-serif text-white italic">সাহায্যের হাত বাড়ান</h1>
                  <p className="text-xl opacity-80 font-medium">আপনার ক্ষুদ্র অবদানেও ফুটবে এক অসহায় মানুষের হাসি।</p>
               </div>
               <div className="space-y-4 pt-4 relative z-10">
                  <p className="text-sm font-black uppercase tracking-widest opacity-60">তহবিল পরিস্থিতি</p>
                  <p className="text-6xl font-black">৳ {currentTotal.toLocaleString()}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 italic">এই সপ্তাহে সংগৃহীত ত্রাণ তহবিল</p>
               </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="bento-card border-none shadow-2xl p-12 space-y-8">
               <h3 className="text-2xl font-black uppercase tracking-tighter text-bento-dark italic font-serif flex items-center gap-3"><Heart className="text-bento-primary" fill="currentColor" /> নতুন কন্ট্রিবিউশন</h3>
               <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="আপনার নাম" value={formData.donor_name} onChange={(e:any)=>setFormData({...formData, donor_name: e.target.value})} placeholder="নাম প্রকাশ অনিচ্ছুকও হতে পারেন" required />
                  <InputField label="টাকার পরিমাণ (BDT)" type="number" value={formData.amount} onChange={(e:any)=>setFormData({...formData, amount: e.target.value})} placeholder="৫০০, ১০০০, ৫০০০..." required />
               </div>
               <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-bento-light uppercase tracking-widest pl-1">বার্তা (ঐচ্ছিক)</label>
                  <textarea value={formData.message} onChange={(e:any)=>setFormData({...formData, message: e.target.value})} className="w-full bg-gray-50 border-2 border-bento-border p-5 rounded-3xl outline-none focus:border-bento-primary transition text-sm italic" rows={4} placeholder="মানবিক কোনো কথা..." />
               </div>
               <button type="submit" className="w-full bg-bento-primary text-white py-6 rounded-2xl font-black text-lg shadow-2xl shadow-[rgba(192,57,43,0.3)] transition hover:bg-bento-dark flex items-center justify-center gap-4">দান সম্পন্ন করুন <ChevronRight size={24} /></button>
               {success && <p className="text-bento-accent font-black text-center text-sm animate-bounce">আপনার এই মহানুভবতার জন্য অসংখ্য কৃতজ্ঞতা!</p>}
            </form>
         </div>

         <div className="lg:col-span-5 space-y-8">
            <h2 className="text-4xl font-serif text-bento-dark px-4 italic">সাম্প্রতিক ফিড</h2>
            <div className="space-y-4 h-[900px] overflow-y-auto pr-4 custom-scrollbar">
               {Array.isArray(donations) && donations.map((d, i) => (
                  <motion.div initial={{opacity:0, x:20}} whileInView={{opacity:1, x:0}} viewport={{once:true}} transition={{delay: i*0.05}} key={d.id} className="bento-card !p-6 flex flex-col space-y-4 border-bento-border hover:border-bento-primary transition relative group cursor-default">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <p className="font-black text-bento-dark text-xl">{d.donor_name}</p>
                           <p className="text-[10px] font-bold text-bento-light uppercase tracking-widest opacity-60">{new Date(d.date).toLocaleDateString('bn-BD')}</p>
                        </div>
                        <p className="text-3xl font-black text-bento-accent group-hover:scale-110 transition">৳{d.amount}</p>
                     </div>
                     <p className="text-sm text-bento-light italic border-l-4 border-bento-border pl-4 bg-gray-50 py-3 rounded-r-xl">"{d.message || 'পাশে আছি মানবতার সেবায়।'}"</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      if (res.ok) {
        const data = await res.json();
        setSiteSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error('Auth check failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchSettings();

    // Safety timeout: stop loading after 6 seconds regardless of server response
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const login = (data: { token: string; user: any }) => {
    setUser(data.user);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const updateSettings = async (key: string, value: string) => {
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        await fetchSettings();
      }
    } catch (err) {
      console.error('Update failed');
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-serif bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-20 h-20 border-4 border-bento-primary border-t-transparent rounded-full mb-8" />
      <h1 className="text-3xl font-black text-bento-primary tracking-[0.5em] uppercase">Loading Odommo 24</h1>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, siteSettings, updateSettings }}>
      <Router>
        <div className="min-h-screen flex flex-col bg-bento-bg scroll-smooth">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomeOverview />} />
              <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/profile" /> : <Register />} />
              <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
              <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/donations" element={<DonationsPage />} />
            </Routes>
          </main>
          <footer className="bg-[#1a1f26] text-white pt-32 pb-16 relative overflow-hidden">
            {/* Decorative Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-bento-primary/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-bento-accent/10 rounded-full blur-[120px]"></div>

            <div className="container mx-auto px-6 relative z-10">
              <div className="grid lg:grid-cols-4 gap-20 pb-20 border-b border-white/5">
                <div className="lg:col-span-1 space-y-8">
                   <Link to="/" className="flex items-center gap-4 group">
                      <img src={siteSettings?.logo_url || "https://picsum.photos/seed/logo/100/100"} className="w-16 h-16 bg-white rounded-[1.5rem] p-3 shadow-2xl transition group-hover:rotate-12" alt="Logo" referrerPolicy="no-referrer" />
                      <div>
                         <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Odommo 24</h2>
                         <p className="text-[9px] font-black text-bento-primary uppercase tracking-[0.4em] mt-1">Fearless Humanity</p>
                      </div>
                   </Link>
                   <p className="text-white/40 font-serif italic text-lg leading-relaxed">অদম্য ২৪—একটি অরাজনৈতিক সামাজিক সংগঠন যা মানবতার সেবায় সদা জাগ্রত।</p>
                </div>

                <div className="space-y-8">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">কুইক ন্যাভিগেশন</h3>
                   <div className="flex flex-col gap-4">
                      {['ইভেন্ট তালিকা', 'দান করুন', 'কেন্দ্রীয় কমিটি', 'গ্যালারি'].map(item => (
                        <Link key={item} to="/" className="text-white/60 hover:text-bento-primary transition-all font-medium text-sm flex items-center gap-2 group">
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                           {item}
                        </Link>
                      ))}
                   </div>
                </div>

                <div className="space-y-8">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">যোগাযোগ</h3>
                   <div className="space-y-6">
                      <div className="flex items-center gap-4 text-white/60">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-bento-primary"><MapPin size={18} /></div>
                         <span className="text-sm font-medium">সাভার, ঢাকা, বাংলাদেশ</span>
                      </div>
                      <div className="flex items-center gap-4 text-white/60">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-500"><Phone size={18} /></div>
                         <span className="text-sm font-medium italic">০১৭০০-০০০০০০</span>
                      </div>
                      <div className="flex items-center gap-4 text-white/60">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-yellow-500"><Mail size={18} /></div>
                         <span className="text-sm font-medium italic">info@odommo24.org</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">আমাদের কার্যক্রম</h3>
                   <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                      <p className="text-3xl font-black italic text-bento-accent">১,২০০+</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-2">সদস্য সংখ্যা</p>
                      <div className="h-2 w-full bg-white/10 rounded-full mt-4 overflow-hidden">
                         <div className="h-full w-3/4 bg-bento-accent"></div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-16 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">© 2024 ODOMMO 24 ORGANIZATION. ALL RIGHTS RESERVED.</p>
                 <div className="flex items-center gap-8 text-white/30">
                    <span className="text-[8px] font-black uppercase tracking-widest hover:text-white transition cursor-pointer italic">Privacy Policy</span>
                    <span className="text-[8px] font-black uppercase tracking-widest hover:text-white transition cursor-pointer italic">Terms of Service</span>
                    <span className="text-[8px] font-black uppercase tracking-widest hover:text-white transition cursor-pointer italic">Admin Access</span>
                 </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
