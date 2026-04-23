import React, { useState, useEffect, createContext, useContext, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { translations } from './translations.ts';
import { 
  Heart, Users, MapPin, Phone, Mail, Calendar, Activity, 
  Menu, X, Shield, Lock, User as UserIcon, Camera, ChevronRight,
  Download, Search, Info, Trash2, LogIn, UserPlus, LogOut, Settings,
  Briefcase, GraduationCap, CreditCard, ArrowRight, Zap, LayoutGrid, Globe,
  Mars, Venus, Youtube, Play, Facebook, Tv,
  HeartHandshake, Gift, Sun,
  Bell, ExternalLink, ClipboardList,
  Instagram, Rss, Music
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

// --- Language Context ---
const LanguageContext = createContext<{ lang: 'en' | 'bn', setLang: (l: 'en' | 'bn') => void, t: (key: string) => string } | undefined>(undefined);
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
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

const CommitteePage = () => {
  const [committee, setCommittee] = useState<any[]>([]);
  const { t, lang } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  
  const translateRole = (role: string) => {
    if (!role) return '';
    const roleMap: {[key: string]: string} = {
      'আহ্বায়ক': 'role_convener',
      'আহ্বায়ক': 'role_convener',
      'সদস্য সচিব': 'role_member_secretary',
      'যুগ্ম সদস্য সচিব': 'role_joint_secretary',
      'সদস্য': 'role_member'
    };
    const key = roleMap[role];
    return key ? t(key as any) : role;
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    fetch('/api/committee').then(r => r.ok ? r.json() : []).then(data => setCommittee(Array.isArray(data) ? data : []));
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isFemale = (name: string) => {
    const femaleKeywords = ['আক্তার', 'বেগম', 'মোসা:', 'মোসাম্মাৎ', 'নেছা', 'শান্তা', 'তৃষা', 'মিমি', 'রুমা', 'তাসনিম', 'অহনা', 'মুক্তা', 'সোনিয়া', 'নেহা', 'লামিয়া'];
    return femaleKeywords.some(key => name.includes(key));
  };
  
  const leaders = committee.filter(m => m.role.includes('আহ্বায়ক') || m.role.includes('সদস্য সচিব'));
  const jointSecretaries = committee.filter(m => m.role.includes('যুগ্ম সদস্য সচিব'));
  const generalMembers = committee.filter(m => !m.role.includes('আহ্বায়ক') && !m.role.includes('সদস্য সচিব'));

  return (
    <div className="pt-32 pb-20">
       <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 space-y-20">
            <div className="text-center space-y-6 max-w-4xl mx-auto">
               <motion.span 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }}
                 className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]"
               >
                 {t('committee_guardians')}
               </motion.span>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-4xl md:text-8xl font-serif text-bento-dark italic leading-none"
               >
                 {t('committee_title').split(' ')[0]} <span className="text-bento-primary">{t('committee_title').split(' ').slice(1).join(' ')}</span>
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="text-lg md:text-xl text-bento-light font-serif italic max-w-2xl mx-auto"
               >
                 {t('committee_desc')}
               </motion.p>
            </div>

            {committee.length > 0 ? (
               <div className="space-y-32">
                  <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                     {leaders.map((c, i) => (
                        <motion.div 
                           key={c.id} 
                           initial={isMobile ? { opacity: 0 } : { opacity: 0, y: 40 }} 
                           whileInView={{ opacity: 1, y: 0 }} 
                           viewport={{ once: true }} 
                           transition={{ duration: 0.8, delay: i * 0.1 }}
                           className="group relative will-change-transform"
                        >
                           <div className="relative aspect-[3/4] rounded-[4rem] overflow-hidden shadow-2xl ring-1 ring-black/5 bg-gray-50 flex items-center justify-center">
                              {c.image_url ? (
                                <img src={c.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt={c.name} referrerPolicy="no-referrer" />
                              ) : (
                                <div className="flex flex-col items-center justify-center space-y-4">
                                   <div className={`p-8 rounded-full ${isFemale(c.name) ? 'bg-pink-50 text-pink-400' : 'bg-blue-50 text-blue-400'}`}>
                                      {isFemale(c.name) ? <Venus size={80} /> : <Mars size={80} />}
                                   </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-bento-dark via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                              <div className="absolute bottom-12 left-12 right-12 space-y-2">
                                 <h4 className="text-3xl md:text-4xl font-serif italic text-white leading-tight">{c.name}</h4>
                                 <div className="flex items-center gap-4">
                                    <div className="h-px w-8 bg-bento-primary"></div>
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-bento-primary">{translateRole(c.role)}</span>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>

                  <div className="space-y-16">
                     <div className="flex items-center gap-6 justify-center">
                        <div className="h-px flex-grow bg-gray-100 max-w-xs"></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-bento-light italic">{t('joint_secretaries')}</h3>
                        <div className="h-px flex-grow bg-gray-100 max-w-xs"></div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
                        {jointSecretaries.map((c, i) => (
                           <motion.div 
                              key={c.id} 
                              initial={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.9 }} 
                              whileInView={{ opacity: 1, scale: 1 }} 
                              viewport={{ once: true }} 
                              transition={{ delay: i * 0.05 }}
                              className="group space-y-6 text-center will-change-transform"
                           >
                              <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-xl ring-1 ring-black/5 bg-gray-50 flex items-center justify-center">
                                 {c.image_url ? (
                                   <img src={c.image_url} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt={c.name} referrerPolicy="no-referrer" />
                                 ) : (
                                   <div className={isFemale(c.name) ? 'text-pink-300' : 'text-blue-300'}>
                                      {isFemale(c.name) ? <Venus size={40} /> : <Mars size={40} />}
                                   </div>
                                 )}
                              </div>
                              <div className="space-y-1">
                                 <p className="font-serif italic text-lg text-bento-dark group-hover:text-bento-primary transition-colors">{c.name}</p>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-bento-light">{translateRole(c.role)}</p>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-16 py-20 bg-gray-50/50 rounded-[5rem] px-8 md:px-20 border border-gray-100">
                     <div className="text-center space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-bento-light italic">{t('general_members')}</h3>
                        <p className="text-4xl font-serif italic text-bento-dark">{t('member_list_title').split(' ')[0]} <span className="text-bento-primary">{t('member_list_title').split(' ')[1]}</span></p>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12">
                        {generalMembers.map((c, i) => (
                           <motion.div 
                              key={c.id} 
                              initial={{ opacity: 0 }} 
                              whileInView={{ opacity: 1 }} 
                              viewport={{ once: true }}
                              transition={{ delay: isMobile ? 0 : i * 0.02 }}
                              className="flex flex-col items-center text-center space-y-4 group"
                           >
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:border-bento-primary/30 group-hover:shadow-lg transition-all duration-500 overflow-hidden">
                                 {c.image_url ? (
                                    <img src={c.image_url} className="w-full h-full object-cover" alt={c.name} />
                                 ) : (
                                    <div className={isFemale(c.name) ? 'text-pink-300' : 'text-blue-300'}>
                                       {isFemale(c.name) ? <Venus size={18} /> : <Mars size={18} />}
                                    </div>
                                 )}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-bento-dark leading-tight">{c.name}</p>
                                 <p className="text-[8px] font-black uppercase tracking-widest text-bento-light mt-1">{translateRole(c.role)}</p>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="py-32 text-center space-y-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 animate-pulse">
                     <Users size={32} />
                  </div>
                  <p className="text-bento-light italic font-serif italic">Loading committee information...</p>
               </div>
            )}
          </div>
       </section>
    </div>
  );
};

const MemberListPage = () => {
  const [members, setMembers] = useState<any[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/api/members').then(r => r.ok ? r.json() : []).then(setMembers);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-32 space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-6"
      >
        <span className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]">{t('nav_member_list')}</span>
        <h1 className="text-4xl md:text-7xl font-serif italic text-bento-dark leading-tight tracking-tighter">{t('member_list_title')}</h1>
        <p className="text-sm md:text-xl text-bento-light font-serif italic max-w-2xl mx-auto leading-relaxed">{t('member_list_public_desc')}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.isArray(members) && members.map((m, idx) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border-2 border-bento-border rounded-[2.5rem] p-8 text-center space-y-6 hover:border-bento-primary hover:shadow-2xl transition-all duration-500 group"
          >
            <div className="w-32 h-32 bg-gray-50 rounded-[2rem] mx-auto overflow-hidden border border-bento-border grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500">
               {m.profile_image ? (
                 <img src={m.profile_image} className="w-full h-full object-cover" alt={m.name} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-bento-primary">
                    <UserIcon size={48} />
                 </div>
               )}
            </div>
            <div>
               <h3 className="text-xl font-black italic text-bento-dark">{m.name}</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-bento-light mt-1">{m.member_id_number}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {members.length === 0 && (
         <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-bento-border text-bento-light italic font-serif">
            {t('no_members')}
         </div>
      )}
    </div>
  );
};

const NoticeBoardPage = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const { t, lang } = useLanguage();

  useEffect(() => {
    fetch('/api/notices').then(r => r.ok ? r.json() : []).then(setNotices);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-32 space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-6"
      >
        <span className="text-bento-accent font-black uppercase tracking-[0.6em] text-[10px]">{t('nav_notices')}</span>
        <h1 className="text-4xl md:text-7xl font-serif italic text-bento-dark leading-tight tracking-tighter">{t('notice_board_title')}</h1>
        <div className="w-24 h-1 bg-bento-accent mx-auto rounded-full" />
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-8">
        {Array.isArray(notices) && notices.map((n, idx) => (
          <motion.div 
            key={n.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border-2 border-bento-border rounded-[2.5rem] p-10 space-y-6 hover:shadow-2xl transition duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5"><Bell size={120} /></div>
            <div className="flex justify-between items-start">
               <span className="bg-bento-accent/10 text-bento-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic text-bento-dark leading-tight tracking-tight drop-shadow-sm">{n.title}</h2>
            <p className="text-bento-dark/80 font-serif italic text-xl md:text-2xl leading-relaxed whitespace-pre-line border-l-4 border-bento-accent/20 pl-8 py-2">
               {n.content}
            </p>
            {n.link && (
               <a 
                 href={n.link} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 bg-bento-dark text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition shadow-lg shadow-black/20"
               >
                 <ExternalLink size={16} /> বিস্তারিত দেখুন
               </a>
            )}
          </motion.div>
        ))}

        {notices.length === 0 && (
           <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-bento-border text-bento-light italic font-serif">
              {t('no_notices')}
           </div>
        )}
      </div>
    </div>
  );
};

const HomeOverview = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const isFemale = (name: string) => {
    const femaleKeywords = ['আক্তার', 'বেগম', 'মোসা:', 'মোসাম্মাৎ', 'নেছা', 'শান্তা', 'তৃষা', 'মিমি', 'রুমা', 'তাসনিম', 'অহনা', 'মুক্তা', 'সোনিয়া', 'নেহা', 'লামিয়া'];
    return femaleKeywords.some(key => name.includes(key));
  };
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const { user, siteSettings } = useAuth();
  const { t, lang } = useLanguage();

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

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => console.log('API Status:', d)).catch(e => console.error('API Unreachable:', e));
    fetch('/api/events').then(r => r.ok ? r.json() : []).then(data => setEvents(Array.isArray(data) ? data : []));
    fetch('/api/donations').then(r => r.ok ? r.json() : []).then(data => setDonations(Array.isArray(data) ? data : []));
    fetch('/api/committee').then(r => r.ok ? r.json() : []).then(data => setCommittee(Array.isArray(data) ? data : []));
    fetch('/api/notices').then(r => r.ok ? r.json() : []).then(data => setNotices(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIdx(prev => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const leaders = useMemo(() => committee.filter(c => c.role === 'আহ্বায়ক' || c.role === 'সদস্য সচিব').sort((a,b) => a.sort_order - b.sort_order), [committee]);
  const jointSecretaries = useMemo(() => committee.filter(c => c.role === 'যুগ্ম সদস্য সচিব').sort((a,b) => a.sort_order - b.sort_order), [committee]);
  const generalMembers = useMemo(() => committee.filter(c => c.role === 'সদস্য').sort((a,b) => a.sort_order - b.sort_order), [committee]);

  const currentDonation = Array.isArray(donations) ? donations.reduce((sum, d) => sum + d.amount, 0) : 0;
  const goal = 100000;

  return (
    <div className="space-y-32 pb-32">
      {/* 1. Dynamic Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-bento-dark">
         {/* Atmospheric Mesh Gradients */}
         {!isMobile && !shouldReduceMotion && (
           <div className="absolute inset-0 z-0 overflow-hidden">
              <motion.div 
                 animate={{ 
                    x: [0, 50, -50, 0],
                    y: [0, -50, 50, 0],
                    scale: [1, 1.2, 0.8, 1]
                 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-bento-primary/30 rounded-full blur-[150px] will-change-transform"
              />
              <motion.div 
                 animate={{ 
                    x: [0, -50, 50, 0],
                    y: [0, 50, -50, 0],
                    scale: [1, 0.8, 1.2, 1]
                 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-bento-accent/20 rounded-full blur-[120px] will-change-transform"
              />
           </div>
         )}
         <AnimatePresence mode="wait">
            <motion.div 
               key={currentImgIdx}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1 }}
               className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
            >
               {isMobile ? (
                  <img 
                    src={heroImages[currentImgIdx]} 
                    className="w-full h-full object-cover transition-opacity duration-1000 opacity-60"
                    referrerPolicy="no-referrer" 
                  />
               ) : (
                  <>
                    <img 
                      src={heroImages[currentImgIdx]} 
                      className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                    <img 
                      src={heroImages[currentImgIdx]} 
                      className={`w-full h-full object-cover transition-opacity duration-1000 ${scrolled ? 'opacity-50' : 'opacity-70'}`}
                      referrerPolicy="no-referrer" 
                    />
                  </>
               )}
            </motion.div>
         </AnimatePresence>

         <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex items-center justify-center text-center">
               <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="space-y-6">
                     <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-6 py-2 bg-bento-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-xl"
                     >
                        Since 2024 • Ashulia, Savar
                     </motion.span>
                     <h1 className="text-4xl sm:text-8xl lg:text-[9rem] font-serif italic text-bento-primary font-black leading-none drop-shadow-2xl px-4">
                        {t('hero_title')}
                     </h1>
                     <p className="text-lg md:text-2xl text-white font-serif font-bold italic max-w-2xl mx-auto leading-relaxed pt-4">
                        {t('hero_subtitle')}
                     </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 pt-4">
                     <Link to="/register" className="vibrant-gradient text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(192,57,43,0.3)] hover:scale-105 hover:shadow-[0_20px_60px_rgba(192,57,43,0.5)] transition-all relative overflow-hidden group">
                        <span className="relative z-10">{t('member_apply')}</span>
                        <motion.div 
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.8 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                     </Link>
                     <Link to="/donations" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-bento-dark hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all">{t('donate_now')}</Link>
                  </div>
               </motion.div>

            </div>
         </div>
      </section>
      
      {/* Compact Notice Board Widget */}
      {notices && notices.length > 0 && (
        <section className="relative z-30 -mt-20 mb-16 container mx-auto px-4 sm:px-6">
           <div className="max-w-lg">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white/80 backdrop-blur-xl border-2 border-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden group"
              >
                 {/* Premium Background Detail */}
                 <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-bento-primary/10 to-transparent rounded-bl-[100px] opacity-50 group-hover:scale-110 transition-transform duration-700" />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-5">
                       <motion.div 
                         animate={{ rotate: [0, -10, 10, -10, 0] }}
                         transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                         className="w-14 h-14 bg-bento-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-bento-primary/30"
                       >
                          <Bell size={28} />
                       </motion.div>
                       <div>
                          <h3 className="text-2xl font-black italic text-bento-dark tracking-tighter leading-none">{lang === 'bn' ? 'নোটিশ বোর্ড' : 'Notice Board'}</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-bento-accent mt-1">{lang === 'bn' ? 'সর্বশেষ আপডেট' : 'Latest Updates'}</p>
                       </div>
                    </div>
                    <Link to="/notices" className="group/btn relative overflow-hidden bg-gray-50 p-3 rounded-full hover:bg-bento-primary hover:text-white transition-all duration-300">
                       <ArrowRight size={20} className="relative z-10" />
                    </Link>
                 </div>

                 <div className="space-y-4 relative z-10">
                    {notices.slice(0, 3).map((n, i) => (
                      <Link 
                        key={n.id} 
                        to="/notices" 
                        className="block p-5 bg-white/40 hover:bg-white rounded-3xl border border-bento-border/40 hover:border-bento-primary/20 hover:shadow-xl transition-all duration-300 group/item"
                      >
                         <div className="flex justify-between items-center gap-6">
                            <span className="text-base font-bold text-bento-dark leading-snug group-hover/item:text-bento-primary transition-colors line-clamp-1">
                               {n.title}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                               <span className="text-[9px] font-black uppercase tracking-widest text-bento-light opacity-60">
                                  {new Date(n.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                               </span>
                               <ChevronRight size={14} className="text-bento-primary opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                            </div>
                         </div>
                      </Link>
                    ))}
                 </div>

                 {/* Bottom Floating Bar accent */}
                 <div className="w-12 h-1.5 bg-bento-primary/20 mx-auto mt-8 rounded-full" />
              </motion.div>
           </div>
        </section>
      )}

      {/* Donor Type Selection (Inspired by As-Sunnah Foundation) */}
      <section className="relative z-20 -mt-24 container mx-auto px-4 sm:px-6 mb-16">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Regular Donor */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-4 border-2 border-dashed border-[#00964b]/30 rounded-[4rem]"
            >
               <Link to="/donations?type=regular" className="block bg-[#00964b] rounded-[3.5rem] p-12 text-center text-white space-y-6 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                     <HeartHandshake size={48} />
                  </div>
                  <h3 className="text-3xl font-black italic">{t('regular_donor')}</h3>
               </Link>
            </motion.div>

            {/* Life Donor */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-4 border-2 border-dashed border-[#4b96f2]/30 rounded-[4rem]"
            >
               <Link to="/register" className="block bg-[#4b96f2] rounded-[3.5rem] p-12 text-center text-white space-y-6 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                     <Gift size={48} />
                  </div>
                  <h3 className="text-3xl font-black italic">{t('life_donor')}</h3>
               </Link>
            </motion.div>

            {/* General Donation */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-4 border-2 border-dashed border-[#f2b24b]/30 rounded-[4rem]"
            >
               <Link to="/donations" className="block bg-[#f2b24b] rounded-[3.5rem] p-12 text-center text-white space-y-6 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                     <Sun size={48} />
                  </div>
                  <h3 className="text-3xl font-black italic">{t('general_donation')}</h3>
               </Link>
            </motion.div>
         </div>
      </section>

      {/* Quick Donation Bar (Inspired by leading humanitarian platforms) */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#d49d32] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] rounded-[3rem] p-10 md:p-14 shadow-2xl border-4 border-white ring-1 ring-black/5"
         >
            <div className="space-y-6 text-center mb-10">
               <h3 className="text-2xl md:text-5xl font-serif font-black text-bento-dark uppercase tracking-wide italic">{t('donate_section_title')}</h3>
            </div>
            <form action="/donations" className="grid grid-cols-1 md:grid-cols-5 gap-8 items-end">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#4a3b1d] pl-2 drop-shadow-sm">{t('select_fund')} *</label>
                  <select className="w-full bg-white border-none rounded-2xl p-5 outline-none focus:ring-4 focus:ring-bento-primary/20 transition font-bold text-sm shadow-inner cursor-pointer appearance-none">
                     <option>{t('fund_general')}</option>
                     <option>{t('fund_relief')}</option>
                     <option>{t('fund_education')}</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#4a3b1d] pl-2 drop-shadow-sm">Donor Type *</label>
                  <select className="w-full bg-white border-none rounded-2xl p-5 outline-none focus:ring-4 focus:ring-bento-primary/20 transition font-bold text-sm shadow-inner cursor-pointer appearance-none">
                     <option>{t('general_donation')}</option>
                     <option>{t('regular_donor')}</option>
                     <option>{t('life_donor')}</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#4a3b1d] pl-2 drop-shadow-sm">{t('mobile_email')} *</label>
                  <input type="text" placeholder={t('mobile_email_placeholder')} className="w-full bg-white border-none rounded-2xl p-5 outline-none focus:ring-4 focus:ring-bento-primary/20 transition font-bold text-sm shadow-inner" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#4a3b1d] pl-2 drop-shadow-sm">{t('amount_tk')} *</label>
                  <input type="number" placeholder={t('amount_placeholder')} className="w-full bg-white border-none rounded-2xl p-5 outline-none focus:ring-4 focus:ring-bento-primary/20 transition font-bold text-sm shadow-inner" />
               </div>
               <button type="submit" className="bg-[#008e4f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-lg shadow-xl shadow-green-900/20 hover:bg-green-800 transition-all flex items-center justify-center gap-4 active:scale-95 group">
                  {t('donate_now')} <ArrowRight size={20} className="group-hover:translate-x-2 transition" />
               </button>
            </form>
            <div className="mt-10 text-center text-xs md:text-base font-medium text-[#4a3b1d] italic drop-shadow-sm">
               {t('donation_blessing')} <Link to="/donations" className="text-green-900 font-extrabold hover:underline">{t('click_details')}</Link>
            </div>
         </motion.div>
      </div>

      {/* 2. Mission & Impact Section */}
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bento-card glass-morphism !p-6 sm:!p-10 md:!p-20 relative overflow-hidden group border-none shadow-[0_0_80px_rgba(192,57,43,0.15)] ring-1 ring-white/10"
        >
          {/* Internal Glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-bento-primary/5 rounded-full blur-[100px] group-hover:bg-bento-primary/10 transition-colors duration-700"></div>
          
          <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
             <div className="space-y-8">
                <span className="text-[10px] font-black uppercase text-bento-primary tracking-[0.4em] drop-shadow-sm">{t('core_mission')}</span>
                <h2 className="text-3xl md:text-7xl font-serif text-bento-dark italic leading-tight">মানবতার টানে, <span className="bg-gradient-to-r from-bento-primary to-bento-accent bg-clip-text text-transparent">অদম্য ২৪</span> জানে।</h2>
                <p className="text-base md:text-2xl text-bento-light font-serif italic leading-relaxed">
                   {t('mission_desc')}
                </p>
                <div className="flex gap-8 pt-6">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-bento-primary"><Heart size={28} /></div>
                      <div className="text-left">
                         <p className="text-2xl font-black text-bento-dark">{t('blood_donation_count')}</p>
                         <p className="text-[10px] font-black text-bento-light uppercase tracking-widest">{t('blood_donations')}</p>
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
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-12 gap-4 md:gap-8 auto-rows-[250px]">
          {/* Quick Profile/Login */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bento-card col-span-12 lg:col-span-4 row-span-2 bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center text-center space-y-6 shadow-xl border-none ring-1 ring-black/5"
          >
            <div className="w-24 h-24 bg-[rgba(192,57,43,0.1)] rounded-[2rem] flex items-center justify-center text-bento-primary"><Users size={48} /></div>
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-bento-dark italic">{t('nav_profile')}</h3>
               <p className="text-xs text-bento-light uppercase tracking-widest">আপনার ড্যাশবোর্ড</p>
            </div>
            {user ? (
               <Link to="/profile" className="bg-bento-primary text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">{t('nav_profile')}</Link>
            ) : (
               <Link to="/login" className="bg-bento-dark text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition">{t('nav_login')}</Link>
            )}
          </motion.div>

          {/* Emergency Fund */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bento-card col-span-12 lg:col-span-8 row-span-1 bg-gradient-to-r from-bento-primary to-bento-accent text-white border-none flex flex-col justify-between shadow-2xl shadow-bento-primary/20 p-6 md:p-10"
          >
            <div className="flex justify-between items-start">
               <h3 className="text-2xl font-black flex items-center gap-3"><Heart fill="currentColor" /> {t('urgent_relief')}</h3>
               <span className="bg-white/20 text-[8px] font-black tracking-widest px-3 py-1 rounded-full uppercase">{t('urgent_tag')}</span>
            </div>
            <div className="space-y-4">
               <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${Math.min((currentDonation/goal)*100, 100)}%` }}></div>
               </div>
               <div className="flex justify-between items-end">
                  <p className="text-4xl font-black">৳{currentDonation.toLocaleString()}</p>
                  <Link to="/donations" className="bg-white text-bento-primary px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">{t('donate_now')}</Link>
               </div>
            </div>
          </motion.div>

          {/* Events Mini */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bento-card col-span-12 lg:col-span-8 row-span-1 space-y-6 bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-10"
          >
            <div className="flex justify-between items-center border-b border-bento-border pb-4">
               <h3 className="text-xl font-black flex items-center gap-2"><Calendar className="text-bento-primary" /> {t('upcoming_events')}</h3>
               <Link to="/events" className="text-[10px] font-black text-bento-primary uppercase tracking-widest">{t('view_all_events')} &rarr;</Link>
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
               {events.length === 0 && <p className="text-center py-4 text-bento-light italic text-xs col-span-2">{t('no_events')}</p>}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. Activities Grid */}
      <section className="container mx-auto px-4 sm:px-6">
         <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-6xl font-serif text-bento-dark italic">{t('activities_scope')}</h2>
            <p className="text-bento-light uppercase text-xs font-black tracking-[0.4em]">{t('daily_impact')}</p>
         </div>
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
               { icon: Heart, title: t('activity_blood'), desc: t('activity_blood_desc'), color: 'hover:bg-red-500', iconBg: 'bg-red-50', iconColor: 'text-red-500' },
               { icon: Briefcase, title: t('activity_medical'), desc: t('activity_medical_desc'), color: 'hover:bg-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
               { icon: GraduationCap, title: t('activity_edu'), desc: t('activity_edu_desc'), color: 'hover:bg-green-500', iconBg: 'bg-green-50', iconColor: 'text-green-500' },
               { icon: MapPin, title: t('activity_disaster'), desc: t('activity_disaster_desc'), color: 'hover:bg-orange-500', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' }
            ].map((act, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 whileHover={{ y: -10 }}
                 className={`bento-card bg-white space-y-6 group ${act.color} transition-all duration-500 shadow-xl border-none ring-1 ring-black/5`}
               >
                  <div className={`w-16 h-16 ${act.iconBg} rounded-2xl flex items-center justify-center ${act.iconColor} group-hover:bg-white transition-all shadow-inner`}><act.icon size={32} /></div>
                  <div className="space-y-3">
                     <h3 className="text-2xl font-black italic text-bento-dark group-hover:text-white transition">{act.title}</h3>
                     <p className="text-sm text-bento-light italic group-hover:text-white/70 transition leading-relaxed">{act.desc}</p>
                  </div>
               </motion.div>
            ))}
         </div>
      </section>
      
      {/* YouTube Channel Section */}
      <section className="container mx-auto px-4 sm:px-6 mb-32">
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bento-card glass-morphism !p-10 md:!p-20 relative overflow-hidden group border-none shadow-[0_40px_100px_rgba(192,57,43,0.1)] ring-1 ring-white/10"
         >
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] group-hover:bg-red-600/20 transition-all duration-700"></div>
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
               <div className="space-y-8">
                  <h2 className="text-3xl md:text-6xl font-serif text-bento-dark italic leading-tight">
                    {t('activities_video_title')}
                  </h2>
                  <p className="text-lg text-bento-light font-serif italic leading-relaxed">
                    {lang === 'bn' 
                      ? "সংগঠনের সকল মানবিক ও সামাজিক কার্যক্রমের ভিডিও প্রতিবেদন দেখতে আমাদের অফিসিয়াল ইউটিউব চ্যানেলটি সাবস্ক্রাইব করুন।" 
                      : "Subscribe to our official YouTube channel to watch video reports of all our humanitarian and social activities."}
                  </p>
                  <a 
                    href="https://www.youtube.com/channel/UCkBJa7zuSf9PlwQIU1w3RqQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 bg-[#FF0000] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition active:scale-95"
                  >
                    <Youtube size={24} /> {t('watch_on_youtube')}
                  </a>
               </div>
               <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl relative group/vid">
                  <img src="https://yt3.googleusercontent.com/V7-kYJcwhxTqKKC0C4vRhaukNWVl2Vqrr6IR7RAv-MiE6Slk3Gx-thDbuTIvit-zRMK_2zbwgmU=s160-c-k-c0x00ffffff-no-rj" className="w-full h-full object-cover opacity-80 group-hover/vid:scale-110 transition duration-1000" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <a 
                      href="https://www.youtube.com/channel/UCkBJa7zuSf9PlwQIU1w3RqQ" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-20 h-20 bg-white text-[#FF0000] rounded-full flex items-center justify-center shadow-2xl scale-110 group-hover/vid:scale-125 transition duration-500"
                    >
                      <Play fill="currentColor" size={32} />
                    </a>
                  </div>
               </div>
            </div>
         </motion.div>
      </section>

      {/* Facebook Community Section */}
      <section className="container mx-auto px-4 sm:px-6 mb-32">
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bento-card bg-gradient-to-br from-[#1877F2]/10 to-[#1877F2]/5 !p-10 md:!p-20 relative overflow-hidden group border-none shadow-[0_40px_100px_rgba(24,119,242,0.1)] ring-1 ring-[#1877F2]/20"
         >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1877F2]/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-[#1877F2]/10 transition-all duration-700"></div>
            
            <div className="flex flex-col items-center text-center space-y-8 relative z-10">
               <div className="w-24 h-24 bg-[#1877F2] text-white rounded-3xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500">
                  <Facebook size={48} />
               </div>
               <div className="max-w-2xl space-y-4">
                  <h2 className="text-3xl md:text-6xl font-serif text-bento-dark italic leading-tight">
                    {t('fb_page_title')}
                  </h2>
                  <p className="text-lg text-bento-light font-serif italic leading-relaxed">
                    {t('fb_page_desc')}
                  </p>
               </div>
               <a 
                 href="https://www.facebook.com/adomyo24" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-4 bg-[#1877F2] text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition active:scale-95 group/btn"
               >
                 {lang === 'bn' ? 'আমাদের সঙ্গে যুক্ত হন' : 'Join Our Community'} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
               </a>
            </div>
         </motion.div>
      </section>

      {/* 5. Committee Section Teaser */}
      <section id="committee" className="py-32 bg-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#c0392b_1px,transparent_1px)] [background-size:40px_40px]"></div>
         </div>

         <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center space-y-12">
            <div className="max-w-4xl mx-auto space-y-6">
               <span className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]">{t('committee_guardians')}</span>
               <h2 className="text-4xl md:text-8xl font-serif text-bento-dark italic leading-none">{t('committee_title').split(' ')[0]} <span className="bg-gradient-to-r from-bento-primary to-bento-accent bg-clip-text text-transparent">{t('committee_title').split(' ').slice(1).join(' ')}</span></h2>
               <p className="text-lg md:text-xl text-bento-light font-serif italic max-w-2xl mx-auto">
                  {t('committee_desc_home')}
               </p>
            </div>
            
            <Link to="/committee" className="inline-flex items-center gap-4 bg-bento-dark text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-bento-primary transition-all shadow-2xl hover:scale-105 active:scale-95">
               {t('view_full_committee')} <ArrowRight size={20} />
            </Link>
         </div>
      </section>

      {/* 6. Join CTA */}
      <section className="container mx-auto px-4 sm:px-6 mb-32">
         <div className="bg-bento-primary rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="relative z-10 space-y-12">
               <h2 className="text-4xl md:text-7xl font-serif italic leading-tight">{t('cta_title')}</h2>
               <div className="flex flex-wrap justify-center gap-8">
                  <Link to="/register" className="bg-white text-bento-primary px-16 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition">{t('member_apply')}</Link>
                  <Link to="/donations" className="bg-bento-dark text-white px-16 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-bento-dark transition">{t('donate_now')}</Link>
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
      if (file.size > 500 * 1024) {
        setError('ছবির সাইজ অবশ্যই ৫০০কেবি এর কম হতে হবে!');
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
    <div className="max-w-6xl mx-auto py-32 px-4 sm:px-6 space-y-20">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
         <span className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]">Become an Adomyo member</span>
         <h2 className="text-4xl md:text-7xl font-serif text-bento-dark italic leading-tight">সদস্য আবেদন ফর্ম</h2>
         <p className="text-lg text-bento-light font-serif italic leading-relaxed">অদম্য ২৪-এর অংশ হয়ে আর্তমানবতার সেবায় নিজেকে নিয়োজিত করুন। সকল তথ্য সঠিকভাবে পূরণ করুন।</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bento-card border-none shadow-2xl p-6 md:p-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-bento-primary via-bento-accent to-bento-primary"></div>
        
        <form onSubmit={handleSubmit} className="space-y-16">
          <div className="flex flex-col items-center space-y-4 mb-8">
             <div className="w-32 h-32 bg-gray-50 rounded-3xl border-2 border-dashed border-bento-border flex items-center justify-center overflow-hidden relative group">
                {formData.profile_image ? (
                  <img src={formData.profile_image} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={40} className="text-gray-300" />
                )}
                <div className="absolute inset-0 bg-[rgba(47,54,64,0.4)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none z-0">
                   <span className="text-[10px] font-black uppercase tracking-widest">ছবি যুক্ত করুন</span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" title="Upload Profile Picture" />
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-bento-light">প্রোফাইল ছবি (সর্বোচ্চ ৫০০কেবি)</p>
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

          <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-10 bg-gray-50 p-6 md:p-10 rounded-[2.5rem] border border-bento-border">
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
        link.download = `Adomyo24_Member_${profile?.userId || 'Card'}.png`;
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
                 <h3 style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, lineHeight: 1.1, letterSpacing: '0.02em' }}>ADOMYO 24</h3>
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
            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.15em' }}>WWW.ADOMYO24.ORG</p>
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
           ADOMYO 24
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
        
        <div className="container mx-auto px-4 sm:px-6 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-4">
             <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-[2rem] md:rounded-[3rem] p-2 shadow-2xl relative group ring-8 ring-white/30">
                <div className="w-full h-full rounded-[1.75rem] md:rounded-[2.5rem] overflow-hidden bg-gray-100 flex items-center justify-center">
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
                   <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white italic drop-shadow-lg">{profileData.name || 'Anonymous User'}</h1>
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

      <div className="container mx-auto px-4 sm:px-6 -mt-10 relative z-20 max-w-7xl">
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
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const logoUrl = siteSettings?.logo_url || "https://picsum.photos/seed/logo/100/100";
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ to, children, icon: Icon }: any) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative group overflow-hidden ${isActive ? 'bg-white/10 text-bento-primary' : 'text-white/70 hover:text-white'}`}
      >
        {Icon && <Icon size={14} className={`${isActive ? 'scale-125' : 'group-hover:scale-125'} transition-transform`} />}
        {children}
        {isActive && (
          <motion.div layoutId="nav-active" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-bento-primary rounded-full" />
        )}
      </Link>
    );
  };

  const isHome = location.pathname === "/";

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="container mx-auto px-2 sm:px-6">
        <div className={`flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 rounded-[2rem] sm:rounded-[2.5rem] transition-all duration-500 border border-white/10 ${scrolled || !isHome ? 'bg-bento-dark/80 backdrop-blur-3xl shadow-2xl shadow-black/40 ring-1 ring-white/5' : 'bg-transparent'}`}>
           <Link to="/" className="flex items-center gap-4 group">
              <motion.div 
                whileHover={{ rotate: 12, scale: 1.1 }}
                className="w-12 h-12 bg-white rounded-2xl p-2 shadow-2xl relative overflow-hidden"
              >
                 <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                 <div className="absolute inset-0 bg-gradient-to-tr from-bento-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              <div className="hidden sm:block">
                 <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Adomyo 24</h2>
                 <p className="text-[7px] font-black text-bento-primary uppercase tracking-[0.3em] mt-1 italic leading-none">The Fearless Youth</p>
              </div>
           </Link>

           {/* Desktop Links */}
           <div className="hidden lg:flex items-center gap-2 bg-white/5 p-1 rounded-3xl border border-white/5">
            <NavLink to="/" icon={LayoutGrid}>{t('nav_home')}</NavLink>
            <NavLink to="/live" icon={Tv}>{t('nav_live')}</NavLink>
            <NavLink to="/committee" icon={Users}>{t('nav_committee')}</NavLink>
            <NavLink to="/members" icon={ClipboardList}>{t('nav_member_list')}</NavLink>
            <NavLink to="/notices" icon={Bell}>{t('nav_notices')}</NavLink>
            <NavLink to="/events" icon={Calendar}>{t('nav_events')}</NavLink>
            <NavLink to="/donations" icon={Heart}>{t('nav_donations')}</NavLink>
            <NavLink to="/rules" icon={Info}>{t('nav_rules')}</NavLink>
            <NavLink to="/contact" icon={Phone}>{t('nav_contact')}</NavLink>
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-2xl transition border border-white/10 group active:scale-95"
              >
                 <Globe size={16} className="text-bento-primary group-hover:rotate-180 transition-transform duration-700" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{t('lang_switch')}</span>
              </button>
              
              {user ? (
                 <div className="flex items-center gap-4">
                    <Link to="/profile" className="hidden sm:flex items-center gap-3 bg-white/5 hover:bg-white hover:text-bento-dark px-6 py-2.5 rounded-2xl transition-all border border-white/10 group">
                       <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bento-primary to-bento-accent flex items-center justify-center text-white overflow-hidden shadow-lg font-serif italic text-sm ring-2 ring-white/10">
                          {user.profile_image ? <img src={user.profile_image} className="w-full h-full object-cover" /> : user.name?.[0]}
                       </div>
                       <span className="text-[10px] font-black italic uppercase tracking-widest text-white/90 group-hover:text-bento-dark shrink-0">{user.name}</span>
                    </Link>
                    {user.role === 'admin' && (
                       <Link to="/admin" className="p-3 bg-bento-primary text-white rounded-2xl shadow-lg shadow-bento-primary/30 hover:scale-105 transition hover:brightness-110"><Settings size={20} /></Link>
                    )}
                    <button onClick={logout} className="p-3 bg-white/5 hover:bg-red-500/10 text-white hover:text-red-500 rounded-2xl transition border border-white/10"><LogOut size={20} /></button>
                 </div>
              ) : (
                 <div className="hidden sm:flex items-center gap-3">
                    <Link to="/login" className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition">{t('nav_login')}</Link>
                    <Link to="/register" className="vibrant-gradient text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-bento-primary/20 hover:scale-105 transition active:scale-95">{t('nav_register')}</Link>
                 </div>
              )}
              <button className="lg:hidden p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all shadow-lg ring-1 ring-white/10 ml-1" onClick={() => setIsOpen(!isOpen)}>
                 {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
           </div>
        </div>
      </div>

      {/* Mobile Menu - Sidebar Style */}
      <AnimatePresence>
         {isOpen && (
            <>
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1]"
                 onClick={() => setIsOpen(false)}
               />
               <motion.div 
                  initial={{ x: '100%' }} 
                  animate={{ x: 0 }} 
                  exit={{ x: '100%' }} 
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 h-screen w-[85%] max-w-sm bg-bento-dark border-l border-white/10 shadow-3xl z-[100] flex flex-col"
               >
                  <div className="p-8 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl p-2"><img src={logoUrl} className="w-full h-full object-contain" /></div>
                      <span className="font-serif italic text-white text-xl">Adomyo 24</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-white/50 hover:text-white"><X size={24} /></button>
                  </div>
                  
                  <div className="p-8 pt-12 space-y-4 overflow-y-auto flex-grow flex flex-col justify-start">
                    {[
                      { to: "/", label: t('nav_home'), icon: LayoutGrid },
                      { to: "/live", label: t('nav_live'), icon: Tv },
                      { to: "/committee", label: t('nav_committee'), icon: Users },
                      { to: "/members", label: t('nav_member_list'), icon: ClipboardList },
                      { to: "/notices", label: t('nav_notices'), icon: Bell },
                      { to: "/events", label: t('nav_events'), icon: Calendar },
                      { to: "/donations", label: t('nav_donations'), icon: Heart },
                      { to: "/rules", label: t('nav_rules'), icon: Info },
                      { to: "/contact", label: t('nav_contact'), icon: Phone }
                    ].map((item) => (
                      <Link 
                        key={item.label}
                        to={item.to} 
                        className={`flex items-center gap-4 p-6 rounded-3xl transition-all border border-transparent ${location.pathname === item.to ? 'bg-bento-primary text-white shadow-xl shadow-bento-primary/30' : 'text-white/60 hover:bg-white/5 hover:border-white/5'}`} 
                        onClick={()=>setIsOpen(false)}
                      >
                        <item.icon size={24} />
                        <span className="font-black uppercase text-xs tracking-widest">{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="p-8 border-t border-white/10 bg-black/20">
                    {user ? (
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-bento-primary flex items-center justify-center text-white overflow-hidden font-black">
                               {user.profile_image ? <img src={user.profile_image} className="w-full h-full object-cover" /> : user.name?.[0]}
                            </div>
                            <div>
                               <p className="text-white font-black text-sm uppercase tracking-widest">{user.name}</p>
                               <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">{user.role}</p>
                            </div>
                         </div>
                         <button onClick={logout} className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20"><LogOut size={20} /></button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <Link to="/login" className="bg-white/5 text-white text-center py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={()=>setIsOpen(false)}>লগইন</Link>
                        <Link to="/register" className="vibrant-gradient text-white text-center py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={()=>setIsOpen(false)}>আবেদন</Link>
                      </div>
                    )}
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
    </nav>
  );
};

const AdminDashboard = () => {
  const { t, lang } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', link: '' });
  const [newEvenTitle, setNewEventTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'pending' | 'notices' | 'events' | 'committee' | 'settings' | 'donations' | 'live'>('members');
  const { siteSettings, updateSettings } = useAuth();
  const [logoInput, setLogoInput] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [committee, setCommittee] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [newMember, setNewMember] = useState({ name: '', role: '', image_url: '', sort_order: 0 });
  const [editingMember, setEditingMember] = useState<any>(null);
  const [adminStats, setAdminStats] = useState({ success: '', error: '' });
  
  /* 
    DORKARI SQL CODE:
    
    CREATE TABLE committee_members (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      image_url TEXT,
      sort_order INT DEFAULT 0,
      is_active INT DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const committeeFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'logo' | 'hero' | null>(null);

  const fetchData = async () => {
    fetch('/api/admin/users').then(r => r.ok ? r.json() : []).then(data => setUsers(Array.isArray(data) ? data : []));
    fetch('/api/events').then(r => r.ok ? r.json() : []).then(data => setEvents(Array.isArray(data) ? data : []));
    fetch('/api/committee').then(r => r.ok ? r.json() : []).then(data => setCommittee(Array.isArray(data) ? data : []));
    fetch('/api/donations').then(r => r.ok ? r.json() : []).then(data => setDonations(Array.isArray(data) ? data : []));
    fetch('/api/admin/notices').then(r => r.ok ? r.json() : []).then(data => setNotices(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.phone?.includes(searchTerm)
    );
  }, [users, searchTerm]);

  const approveUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: 'PATCH' });
      if (res.ok) {
        showFeedback('success', 'User approved successfully');
        fetchData();
      }
    } catch (err) {
      showFeedback('error', 'Approval failed');
    }
  };

  const createNotice = async () => {
    if (!newNotice.title || !newNotice.content) return;
    try {
      const res = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice)
      });
      if (res.ok) {
        showFeedback('success', 'Notice published successfully');
        setNewNotice({ title: '', content: '', link: '' });
        fetchData();
      } else {
        const errorData = await res.json();
        showFeedback('error', `Failed: ${errorData.error || 'Server error'}`);
      }
    } catch (err: any) {
      showFeedback('error', `Creation failed: ${err.message}`);
    }
  };

  const deleteNotice = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Notice deleted');
        fetchData();
      }
    } catch (err) {
      showFeedback('error', 'Delete failed');
    }
  };

  const deleteCommitteeMember = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/committee/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Member deleted');
        fetchData();
      }
    } catch (err) {
      showFeedback('error', 'Delete failed');
    }
  };

  const handleCommitteeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (editingMember) {
        setEditingMember({ ...editingMember, image_url: reader.result as string });
      } else {
        setNewMember({ ...newMember, image_url: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const updateCommitteeMember = async () => {
    if (!editingMember || !editingMember.name || !editingMember.role) return;
    try {
      const res = await fetch(`/api/admin/committee/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember)
      });
      if (res.ok) {
        showFeedback('success', 'তথ্য সফলভাবে আপডেট হয়েছে');
        setEditingMember(null);
        fetchData();
      }
    } catch (err) {
      showFeedback('error', 'আপডেট করা সম্ভব হয়নি');
    }
  };

  const downloadDonationsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Donations Report - Adomyo 24', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = donations.map(d => [
      new Date(d.date).toLocaleDateString(),
      d.donor_name,
      d.phone_email,
      `BDT ${d.amount}`,
      d.payment_method || 'N/A',
      d.fund_type || 'General'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Donor', 'Contact', 'Amount', 'Method', 'Fund']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [192, 57, 43] }
    });

    doc.save(`Adomyo24_Donations_${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
        showFeedback('success', 'সদস্য সফলভাবে যোগ করা হয়েছে');
        setNewMember({ name: '', role: '', image_url: '', sort_order: 0 });
        fetchData();
      }
    } catch (err) {
      showFeedback('error', 'যোগ করা সম্ভব হয়নি');
    }
  };
  const formatLiveLink = (url: string) => {
    if (!url) return '';
    let targetUrl = url.trim();

    // If user pastes full iframe code, extract src
    if (targetUrl.includes('<iframe') && targetUrl.includes('src="')) {
      const match = targetUrl.match(/src="([^"]+)"/);
      if (match && match[1]) targetUrl = match[1];
    }

    try {
      // YouTube
      if (targetUrl.includes('youtube.com/watch?v=')) {
        const id = new URL(targetUrl).searchParams.get('v');
        return `https://www.youtube.com/embed/${id}`;
      }
      if (targetUrl.includes('youtu.be/')) {
        const id = targetUrl.split('/').pop()?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      // Facebook
      if (targetUrl.includes('facebook.com') && !targetUrl.includes('plugins/video.php')) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(targetUrl)}&show_text=0&width=560`;
      }
      return targetUrl;
    } catch (e) {
      return targetUrl;
    }
  };

  const [liveLinkInput, setLiveLinkInput] = useState(siteSettings?.live_stream_link || '');

  useEffect(() => {
    if (siteSettings?.live_stream_link) {
      setLiveLinkInput(siteSettings.live_stream_link);
    }
  }, [siteSettings?.live_stream_link]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-20 min-h-screen">
      <div className="bento-card bg-white p-6 md:p-12 shadow-2xl space-y-12 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-bento-border pb-12">
           <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-serif italic text-bento-dark">{t('admin_dashboard_title')}</h1>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-bento-light">Control Center / Adomyo 24</p>
           </div>
           
           <div className="flex flex-wrap gap-4 border-b border-bento-border pb-4 w-full">
             {['members', 'pending', 'notices', 'donations', 'events', 'committee', 'settings', 'live'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 md:px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition whitespace-nowrap ${activeTab === tab ? 'bg-bento-primary text-white shadow-lg shadow-[rgba(192,57,43,0.2)]' : 'text-bento-light hover:bg-gray-100'}`}
                >
                  {tab === 'members' ? t('nav_member_list') : tab === 'pending' ? t('admin_pending_members') : tab === 'notices' ? t('admin_manage_notices') : tab === 'donations' ? t('admin_manage_donations') : tab === 'events' ? t('admin_manage_events') : tab === 'committee' ? t('admin_manage_committee') : tab === 'settings' ? t('admin_site_settings') : t('admin_manage_live')}
                </button>
             ))}
           </div>
        </div>

        {activeTab === 'members' && (
        <div className="grid lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 rounded-[24px] bg-white p-6 md:p-12 shadow-2xl relative overflow-hidden group border border-gray-100">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition duration-1000"><Users size={200} /></div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-bento-border pb-6">
                 <h2 className="text-2xl font-black italic flex items-center gap-3"><Users className="text-bento-primary" /> অনুমোদিত সদস্য তালিকা</h2>
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
                  {filteredUsers.filter(u => u.status === 'approved').map(u => (
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
                  {filteredUsers.filter(u => u.status === 'approved').length === 0 && <p className="text-center py-20 text-bento-light italic font-serif">কোন সদস্য পাওয়া যায়নি...</p>}
               </div>
           </div>
           <div className="lg:col-span-4 space-y-8">
              <div className="rounded-[24px] bg-[#2f3640] text-white p-12 shadow-2xl space-y-8 relative overflow-hidden text-center justify-center flex flex-col items-center">
                 <div className="w-20 h-20 bg-[rgba(192,57,43,0.1)] rounded-full flex items-center justify-center text-bento-primary"><Shield size={40} /></div>
                 <h3 className="text-2xl font-black italic">সদস্য তথ্য যাচাই</h3>
                 <p className="text-xs text-[rgba(255,255,255,0.4)] leading-relaxed italic uppercase tracking-widest">ভেরিফিকেশন এর জন্য নিচের তালিকা দেখুন</p>
              </div>
           </div>
        </div>
        )}

        {activeTab === 'pending' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 rounded-[24px] bg-white p-6 md:p-12 shadow-2xl border border-gray-100">
              <h2 className="text-2xl font-black italic flex items-center gap-3 mb-10 border-b pb-6"><Shield className="text-bento-accent" /> {t('admin_pending_members')}</h2>
              <div className="max-h-[600px] overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                 {users.filter(u => u.status === 'pending').map(u => (
                    <div key={u.id} className="bg-gray-50 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 border border-bento-border hover:bg-white hover:shadow-xl transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-bento-border">
                             {u.profile_image ? <img src={u.profile_image} className="w-full h-full object-cover" /> : <UserIcon className="text-bento-light" />}
                          </div>
                          <div>
                             <p className="font-black text-xl italic text-bento-dark">{u.name}</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-bento-light">Phone: {u.phone} | NID: {u.nid_number}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <button onClick={() => setSelectedUser(u)} className="p-3 bg-white border-2 border-bento-border rounded-xl text-bento-light hover:text-bento-primary transition"><Info size={20} /></button>
                          <button onClick={() => approveUser(u.id)} className="px-8 py-3 bg-bento-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition">{t('admin_approve')}</button>
                       </div>
                    </div>
                 ))}
                 {users.filter(u => u.status === 'pending').length === 0 && <p className="text-center py-20 text-bento-light italic">কোনো অপেক্ষমান সদস্য নেই...</p>}
              </div>
          </div>
        </div>
        )}

        {activeTab === 'notices' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bento-card bg-white p-10 shadow-2xl space-y-8">
              <h3 className="text-xl font-black italic border-b pb-4">{t('admin_add_notice')}</h3>
              <div className="space-y-6">
                 <InputField label="টাইটেল" value={newNotice.title} onChange={(e:any)=>setNewNotice({...newNotice, title: e.target.value})} placeholder="নোটিশের শিরোনাম..." />
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-bento-light">বিস্তারিত বার্তা</label>
                    <textarea 
                      value={newNotice.content} 
                      onChange={(e:any)=>setNewNotice({...newNotice, content: e.target.value})} 
                      className="w-full px-5 py-4 rounded-2xl border-2 border-bento-border bg-gray-50 focus:border-bento-primary h-32 outline-none transition text-sm"
                      placeholder="নোটিশের বিস্তারিত তথ্য এখানে লিখুন..."
                    />
                 </div>
                 <InputField label="লিঙ্ক (ঐচ্ছিক)" value={newNotice.link} onChange={(e:any)=>setNewNotice({...newNotice, link: e.target.value})} placeholder="https://..." />
                 <button onClick={createNotice} className="w-full bg-bento-accent text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-95 transition">পাবলিশ নোটিশ</button>
              </div>
          </div>
          <div className="lg:col-span-7 bento-card bg-white p-10 shadow-2xl space-y-6">
              <h3 className="text-xl font-black italic border-b pb-4">বর্তমান নোটিশসমূহ</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                 {notices.map(n => (
                    <div key={n.id} className="p-6 bg-gray-50 rounded-[2rem] border border-bento-border flex justify-between items-start group">
                       <div className="space-y-2">
                          <p className="font-bold text-base italic leading-tight">{n.title}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{new Date(n.created_at).toLocaleDateString()}</p>
                       </div>
                       <button onClick={() => deleteNotice(n.id)} className="p-3 bg-white text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition shadow-sm"><Trash2 size={16} /></button>
                    </div>
                 ))}
                 {notices.length === 0 && <p className="text-center py-20 text-bento-light italic">কোনো নোটিশ পাওয়া যায়নি...</p>}
              </div>
          </div>
        </div>
        )}

        {activeTab === 'donations' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center bg-gray-50 p-8 rounded-[2.5rem] border border-bento-border">
               <div className="space-y-1">
                  <h3 className="text-2xl font-black italic">অনুদান রিপোর্ট</h3>
                  <p className="text-xs text-bento-light uppercase tracking-widest">মোট অনুদান সংখ্যা: {donations.length}</p>
               </div>
               <button onClick={downloadDonationsPDF} className="flex items-center gap-3 bg-bento-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-bento-primary/20 hover:scale-105 transition active:scale-95">
                  <Download size={16} /> এক্সেল/পিডিএফ ডাউনলোড
               </button>
            </div>
            
            <div className="bento-card border border-bento-border bg-white overflow-hidden !p-0">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-bento-border text-[10px] font-black uppercase tracking-widest text-bento-light">
                    <tr>
                      <th className="px-8 py-5">তারিখ</th>
                      <th className="px-8 py-5">দাতার নাম</th>
                      <th className="px-8 py-5">ধরন</th>
                      <th className="px-8 py-5">মবলগ</th>
                      <th className="px-8 py-5">যোগাযোগ</th>
                      <th className="px-8 py-5">পদ্ধতি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bento-border">
                    {donations.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50 transition">
                        <td className="px-8 py-5 text-xs text-bento-light italic">{new Date(d.date).toLocaleDateString()}</td>
                        <td className="px-8 py-5 font-bold italic text-bento-dark">{d.donor_name}</td>
                        <td className="px-8 py-5"><span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">{d.donor_type || 'N/A'}</span></td>
                        <td className="px-8 py-5 font-black text-bento-primary">৳{d.amount}</td>
                        <td className="px-8 py-5 text-xs italic">{d.phone_email}</td>
                        <td className="px-8 py-5 overflow-hidden"><span className="bg-white px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase text-bento-light">{d.payment_method || 'N/A'}</span></td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               {donations.length === 0 && <p className="text-center py-20 text-bento-light italic font-serif">কোনো অনুদান পাওয়া যায়নি...</p>}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-8">
               <div className="bento-card bg-white p-10 shadow-2xl space-y-8">
                  <h3 className="text-xl font-black italic border-b pb-4">নতুন ইভেন্ট যোগ করুন</h3>
                  <div className="space-y-6">
                     <InputField label="ইভেন্ট টাইটেল" value={newEvenTitle} onChange={(e:any) => setNewEventTitle(e.target.value)} placeholder="উদা: শীতবস্ত্র বিতরণ - ২০২৪" />
                     <button onClick={createEvent} className="w-full bg-bento-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition">ইভেন্ট তৈরি করুন</button>
                  </div>
               </div>
            </div>
            <div className="lg:col-span-8 bento-card bg-white p-10 shadow-2xl space-y-6 min-h-[500px]">
               <h3 className="text-xl font-black italic border-b pb-4">বর্তমান ইভেন্টসমূহ</h3>
               <div className="grid sm:grid-cols-2 gap-6">
                  {events.map(e => (
                    <div key={e.id} className="p-6 bg-gray-50 rounded-3xl border border-bento-border group relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10"><Calendar size={40} /></div>
                       <p className="text-[10px] font-black text-bento-primary uppercase tracking-widest mb-2 italic">{new Date(e.date).toLocaleDateString()}</p>
                       <h4 className="font-bold text-lg italic text-bento-dark leading-tight">{e.title}</h4>
                    </div>
                  ))}
                  {events.length === 0 && <p className="col-span-2 text-center py-20 text-bento-light italic font-serif">কোনো ইভেন্ট পরিকল্পনা করা নেই...</p>}
               </div>
            </div>
          </div>
        )}

      {activeTab === 'committee' && (
         <div className="bento-card border-none bg-white p-8 md:p-12 shadow-2xl space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-bento-border pb-8">
               <h3 className="text-3xl font-serif italic text-bento-dark">কেন্দ্রীয় আহ্বায়ক কমিটি ম্যানেজমেন্ট</h3>
               {editingMember && (
                  <button 
                    onClick={() => { setEditingMember(null); setNewMember({ name: '', role: '', image_url: '', sort_order: 0 }); }}
                    className="px-6 py-2 bg-gray-100 text-bento-light rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition"
                  >
                    নতুন মেম্বার যোগ করুন
                  </button>
               )}
            </div>

            <div className="grid md:grid-cols-12 gap-12">
               {/* Form Column */}
               <div className="md:col-span-5 space-y-8 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-bento-primary">
                    {editingMember ? 'সদস্যের তথ্য সংশোধন করুন' : 'নতুন মেম্বার যোগ করুন'}
                  </h4>
                  
                  <div className="space-y-6">
                     <div className="flex flex-col items-center gap-4">
                        <div 
                           onClick={() => committeeFileInputRef.current?.click()}
                           className="w-32 h-32 bg-white rounded-3xl border-2 border-dashed border-bento-border flex flex-col items-center justify-center cursor-pointer hover:border-bento-primary transition overflow-hidden group shadow-inner"
                        >
                           {(editingMember ? editingMember.image_url : newMember.image_url) ? (
                              <img src={editingMember ? editingMember.image_url : newMember.image_url} className="w-full h-full object-cover" />
                           ) : (
                              <>
                                 <Camera size={24} className="text-bento-light group-hover:text-bento-primary transition" />
                                 <p className="text-[8px] font-black uppercase tracking-widest text-bento-light mt-2">ছবি আপলোড</p>
                              </>
                           )}
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-bento-light/60">ক্লিক করে ছবি আপলোড করুন</p>
                        <input type="file" ref={committeeFileInputRef} className="hidden" accept="image/*" onChange={handleCommitteeImageUpload} />
                     </div>

                     <InputField 
                        label="সদস্যের ছবি (URL)" 
                        value={editingMember ? editingMember.image_url : newMember.image_url} 
                        onChange={(e:any) => editingMember ? setEditingMember({...editingMember, image_url: e.target.value}) : setNewMember({...newMember, image_url: e.target.value})} 
                        placeholder="বা ছবির লিঙ্ক সরাসরি এখানে দিন..." 
                     />
                     
                     <InputField 
                        label="সদস্যের নাম" 
                        value={editingMember ? editingMember.name : newMember.name} 
                        onChange={(e:any)=> editingMember ? setEditingMember({...editingMember, name: e.target.value}) : setNewMember({...newMember, name: e.target.value})} 
                        placeholder="উদা: মোহাম্মদ সজীব আহমেদ" 
                     />
                     
                     <InputField 
                        label="পদবী" 
                        value={editingMember ? editingMember.role : newMember.role} 
                        onChange={(e:any)=> editingMember ? setEditingMember({...editingMember, role: e.target.value}) : setNewMember({...newMember, role: e.target.value})} 
                        placeholder="উদা: কোষাধ্যক্ষ" 
                     />
                     
                     <InputField 
                        label="ক্রম (Sort Order)" 
                        type="number" 
                        value={editingMember ? editingMember.sort_order : newMember.sort_order} 
                        onChange={(e:any)=> editingMember ? setEditingMember({...editingMember, sort_order: parseInt(e.target.value) || 0}) : setNewMember({...newMember, sort_order: parseInt(e.target.value) || 0})} 
                        placeholder="0, 1, 2..." 
                     />
                     
                     <button 
                        onClick={editingMember ? updateCommitteeMember : addCommitteeMember} 
                        className={`w-full text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition hover:scale-[1.02] active:scale-95 ${editingMember ? 'bg-bento-accent shadow-green-500/20' : 'bg-bento-primary shadow-[rgba(192,57,43,0.2)]'}`}
                     >
                        {editingMember ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                     </button>
                     
                     {adminStats.success && <p className="text-green-500 text-[10px] font-black uppercase text-center animate-pulse">{adminStats.success}</p>}
                     {adminStats.error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{adminStats.error}</p>}
                  </div>
               </div>

               {/* List Column */}
               <div className="md:col-span-7 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                     <h4 className="text-xs font-black uppercase tracking-widest text-bento-light italic">কমিটি সদস্যবৃন্দ ({committee.length})</h4>
                     <button onClick={() => fetchData()} className="text-[10px] font-black uppercase text-bento-primary hover:underline transition flex items-center gap-2">রিফ্রেশ</button>
                  </div>
                  
                  <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                     {committee.map(m => (
                        <div key={m.id} className={`p-5 bg-white rounded-3xl border transition-all duration-300 flex justify-between items-center group shadow-sm hover:shadow-xl ${editingMember?.id === m.id ? 'border-bento-primary ring-2 ring-bento-primary/10' : 'border-gray-100'}`}>
                           <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform">
                                 <img src={m.image_url || `https://picsum.photos/seed/mem${m.id}/100/100`} className="w-full h-full object-cover" alt={m.name} referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                 <p className="font-black text-base italic text-bento-dark">{m.name}</p>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-bento-primary bg-bento-primary/5 px-2 py-0.5 rounded-md">{m.role}</span>
                                    <span className="text-[8px] font-black text-bento-light uppercase">Order: {m.sort_order}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <button 
                                 onClick={() => { setEditingMember(m); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                 className="p-3 bg-gray-50 text-bento-light rounded-xl hover:bg-bento-primary hover:text-white transition shadow-sm"
                                 title="Edit Member"
                              >
                                 <Settings size={18} />
                              </button>
                              <button 
                                 onClick={() => deleteCommitteeMember(m.id)} 
                                 className="p-3 bg-gray-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"
                                 title="Delete Member"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                     ))}
                     {committee.length === 0 && (
                        <div className="py-32 text-center space-y-4 opacity-30">
                           <Users size={64} className="mx-auto" />
                           <p className="italic font-serif">কোনো সদস্য তথ্য পাওয়া যায়নি...</p>
                        </div>
                     )}
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
        {activeTab === 'live' && (
          <div className="grid lg:grid-cols-2 gap-12 pb-20">
             <div className="bg-gray-50 p-10 rounded-[3rem] border border-bento-border space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-bento-primary text-white rounded-2xl flex items-center justify-center"><Tv size={24} /></div>
                   <h3 className="text-2xl font-black italic">{t('admin_manage_live')}</h3>
                </div>
                <p className="text-sm text-bento-light italic">এখানে YouTube বা ফেসবুক থেকে সরাসরি কপি করা লিঙ্কটি দিন। সিস্টেম স্বয়ংক্রিয়ভাবে এটিকে Embed লিঙ্কে রূপান্তর করবে।</p>
                <div className="space-y-6">
                   <InputField 
                     label="লাইভ স্ট্রিম লিঙ্ক (URL)" 
                     value={liveLinkInput} 
                     onChange={(e:any) => setLiveLinkInput(e.target.value)} 
                     placeholder="উদা: https://www.youtube.com/watch?v=... অথবা https://fb.watch/..." 
                   />
                   <button 
                     onClick={async () => {
                       const formatted = formatLiveLink(liveLinkInput);
                       setLiveLinkInput(formatted);
                       await updateSettings('live_stream_link', formatted);
                       showFeedback('success', 'লাইভ লিঙ্ক আপডেট হয়েছে');
                     }}
                     className="w-full bg-bento-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:scale-[1.02] transition-all"
                   >
                     লিঙ্ক সেভ করুন
                   </button>
                   <div className="p-6 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-blue-100 italic leading-relaxed">
                      বিজ্ঞপ্তি: "Monitor" দেখানোর সমস্যা এড়াতে ওয়েবসাইটের নিজের লিঙ্ক এখানে দিবেন না। শুধুমাত্র ইউটিউব বা ফেসবুক ভিডিওর লিঙ্ক ব্যবহার করুন।
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-center text-bento-light">লাইভ প্রিভিউ (Live Preview)</h4>
                <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-black/5 relative group">
                   {siteSettings?.live_stream_link ? (
                     <iframe 
                       src={siteSettings.live_stream_link} 
                       className="w-full h-full border-0"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                       allowFullScreen
                     ></iframe>
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 italic p-8 text-center">
                        <Tv size={40} className="mb-4 opacity-50" />
                        <p>লিঙ্ক সেভ করলে এখানে প্রিভিউ দেখা যাবে</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
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

const PublicMembersPage = () => {
  const { t, lang } = useLanguage();
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/members').then(r => r.ok ? r.json() : []).then(data => setMembers(Array.isArray(data) ? data : []));
  }, []);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    return members.filter(m => m.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [members, searchTerm]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-24 min-h-screen">
      <div className="text-center space-y-4 mb-20">
         <h1 className="text-5xl md:text-8xl font-serif text-bento-dark italic">{t('members_page_title')}</h1>
         <div className="w-48 h-2 bg-bento-primary mx-auto rounded-full"></div>
         <p className="text-sm font-black uppercase tracking-[0.5em] text-bento-light">Our Growing Community</p>
      </div>

      <div className="max-w-xl mx-auto mb-16 relative">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-bento-light" size={20} />
         <input 
           type="text" 
           placeholder={lang === 'bn' ? 'সদস্যের নাম দিয়ে খুঁজুন...' : 'Search members by name...'}
           className="w-full pl-16 pr-8 py-5 bg-white border-2 border-bento-border rounded-[2rem] shadow-xl focus:border-bento-primary outline-none transition text-base italic"
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
         {filteredMembers.map((member, index) => (
           <motion.div 
             key={member.id}
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: index * 0.05 }}
             className="bento-card border border-bento-border hover:border-bento-primary hover:shadow-2xl transition duration-500 group text-center"
           >
              <div className="w-24 h-24 bg-gray-50 rounded-[2rem] mx-auto mb-6 flex items-center justify-center overflow-hidden border-2 border-bento-border group-hover:border-bento-primary transition shadow-inner">
                 {member.profile_image ? (
                   <img src={member.profile_image} className="w-full h-full object-cover" />
                 ) : (
                   <UserIcon className="text-bento-light group-hover:text-bento-primary transition" size={32} />
                 )}
              </div>
              <h3 className="text-xl font-serif italic text-bento-dark mb-2">{member.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-bento-light">Member ID: @{member.userId || 'N/A'}</p>
           </motion.div>
         ))}
      </div>
      {filteredMembers.length === 0 && (
         <div className="text-center py-40 text-bento-light font-serif italic text-xl">
            {lang === 'bn' ? 'কোন সদস্য পাওয়া যায়নি...' : 'No members found...'}
         </div>
      )}
    </div>
  );
};

const EventsPage = () => {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/events').then(r => r.ok ? r.json() : []).then(data => setEvents(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-20 space-y-16">
      <div className="text-center space-y-4">
         <h1 className="text-4xl md:text-7xl font-serif text-bento-dark italic">{t('events_page_title')}</h1>
         <div className="w-40 h-1 bg-bento-primary mx-auto rounded-full"></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {Array.isArray(events) && events.map((e, index) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bento-card !p-0 group cursor-pointer overflow-hidden flex flex-col ring-1 ring-bento-border hover:ring-bento-primary transition shadow-xl">
            <div className="h-64 overflow-hidden"><img src={e.image_url || `https://picsum.photos/seed/ev${e.id}/800/600`} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" referrerPolicy="no-referrer" /></div>
            <div className="p-6 md:p-8 space-y-4 flex-grow flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-bento-accent bg-[rgba(39,174,96,0.1)] px-3 py-1.5 rounded-full w-fit">{new Date(e.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <h3 className="text-xl md:text-3xl font-serif text-bento-dark leading-tight group-hover:text-bento-primary transition h-20 overflow-hidden line-clamp-2">{e.title}</h3>
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

const LiveStreamPage = () => {
  const { t, lang } = useLanguage();
  const { siteSettings } = useAuth();
  const liveLink = siteSettings?.live_stream_link;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-32 space-y-16 min-h-screen">
      <div className="text-center space-y-6">
         <motion.span 
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }}
           className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]"
         >
           {lang === 'bn' ? 'সরাসরি সম্প্রচার' : 'LIVE BROADCAST'}
         </motion.span>
         <h1 className="text-4xl md:text-8xl font-serif text-bento-dark italic">{t('nav_live')}</h1>
         <div className="w-48 h-2 bg-bento-primary mx-auto rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto">
        {liveLink ? (
          <div className="aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl ring-4 ring-bento-primary/10 relative group">
             <iframe 
               src={liveLink} 
               className="w-full h-full border-0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
               allowFullScreen
             ></iframe>
             <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)]"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-red-600/80 backdrop-blur-md px-3 py-1 rounded-lg">LIVE</span>
             </div>
          </div>
        ) : (
          <div className="aspect-video bg-gray-50 rounded-[3rem] border-2 border-dashed border-bento-border flex flex-col items-center justify-center space-y-6 text-center p-12">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-bento-light">
                <Tv size={40} />
             </div>
             <div>
                <h3 className="text-2xl font-black italic text-bento-dark">{lang === 'bn' ? 'কোনো লাইভ স্ট্রীম পাওয়া যায়নি' : 'No Live Stream Available'}</h3>
                <p className="text-bento-light font-serif italic mt-2">{lang === 'bn' ? 'অনুগ্রহ করে আমাদের ফেসবুক পেজ অথবা ইউটিউবে যুক্ত থাকুন।' : 'Please stay tuned to our Facebook page or YouTube channel.'}</p>
             </div>
             <div className="flex gap-4">
                <Link to="/contact" className="bg-bento-dark text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition">{t('nav_contact')}</Link>
             </div>
          </div>
        )}
      </div>
      
      <div className="max-w-3xl mx-auto p-12 bg-white rounded-[2.5rem] border border-bento-border shadow-xl space-y-6">
         <h3 className="text-2xl font-black italic text-bento-dark flex items-center gap-4">
            <Info className="text-bento-primary" /> {lang === 'bn' ? 'গুরুত্বপূর্ণ তথ্য' : 'Important Information'}
         </h3>
         <p className="text-bento-light font-serif italic leading-relaxed">
            {lang === 'bn' 
              ? 'অদম্য ২৪-এর সকল গুরুত্বপূর্ণ ইভেন্ট এবং কর্মসূচি সরাসরি দেখতে আমাদের সাথে থাকুন। লাইভ স্ট্রীম চলাকালীন কোনো সমস্যা হলে ফেসবুক পেজে মেসেজ করুন।' 
              : 'Stay with us to watch all major events and activities of Adomyo 24 live. If you face any issues during the live stream, please message us on our Facebook page.'}
         </p>
      </div>
    </div>
  );
};

const ContactUsPage = () => {
  const { t, lang } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
       setSubmitted(false);
       setFormData({ name: '', email: '', subject: '', message: '' });
    }, 5000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-20 max-w-6xl space-y-24">
      <div className="text-center space-y-6">
         <span className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]">Get in Touch</span>
         <h1 className="text-4xl md:text-8xl font-serif text-bento-dark italic leading-none">{t('contact_title').split(' ')[0]} <span className="text-bento-primary">{t('contact_title').split(' ')[1]}</span></h1>
         <div className="w-40 h-1 bg-bento-primary mx-auto rounded-full"></div>
      </div>

      <div className="grid lg:grid-cols-12 gap-16 items-start">
         <div className="lg:col-span-5 space-y-12">
            <div className="space-y-8">
               <h3 className="text-2xl font-serif italic text-bento-dark">{t('office_title')}</h3>
               <div className="space-y-8">
                  <div className="flex gap-6 group">
                     <div className="w-16 h-16 rounded-[2rem] bg-bento-primary/5 flex items-center justify-center text-bento-primary shrink-0 group-hover:bg-bento-primary group-hover:text-white transition-all duration-500">
                        <MapPin size={28} />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-bento-light opacity-60">{t('office_address_label')}</p>
                        <p className="text-xl font-medium text-bento-dark leading-relaxed">{t('footer_address')}</p>
                     </div>
                  </div>

                  <div className="flex gap-6 group">
                     <div className="w-16 h-16 rounded-[2rem] bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                        <Phone size={28} />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-bento-light opacity-60">{t('office_phone_label')}</p>
                        <p className="text-2xl font-black italic text-bento-dark">01722000231</p>
                     </div>
                  </div>

                  <div className="flex gap-6 group">
                     <div className="w-16 h-16 rounded-[2rem] bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-500">
                        <Mail size={28} />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-bento-light opacity-60">Email</p>
                        <p className="text-xl font-medium text-bento-dark italic">adomyo24@gmail.com</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-bento-dark rounded-[3rem] p-10 text-white space-y-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-bento-primary/10 rounded-full -mr-20 -mt-20 blur-2xl group-hover:scale-150 transition duration-1000"></div>
               <h4 className="text-xl font-serif italic text-white/90">{t('fb_page_title')}</h4>
               <p className="text-sm text-white/50 leading-relaxed">{t('fb_page_desc')}</p>
               <a href="https://www.facebook.com/adomyo24" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 text-bento-primary font-black uppercase tracking-widest text-[10px] hover:gap-6 transition-all">FB.COM/ADOMYO24 <ArrowRight size={14} /></a>
            </div>

            <div className="flex items-center gap-4 mt-6">
               {[
                 { href: "https://www.instagram.com/adomyo24/", icon: Instagram, color: "hover:bg-[#E4405F]" },
                 { href: "https://www.youtube.com/channel/UCkBJa7zuSf9PlwQIU1w3RqQ", icon: Youtube, color: "hover:bg-[#FF0000]" },
                 { href: "https://www.tiktok.com/@adomyo24", icon: Music, color: "hover:bg-black" },
                 { href: "https://adomyo24.blogspot.com/", icon: Rss, color: "hover:bg-[#FF5722]" },
               ].map((social, i) => (
                 <a 
                   key={i} 
                   href={social.href} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 ${social.color} hover:text-white hover:scale-110 transition-all duration-300 shadow-lg`}
                 >
                    <social.icon size={16} />
                 </a>
               ))}
            </div>
         </div>

         <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-white rounded-[4rem] p-10 md:p-16 shadow-2xl border border-gray-100 space-y-10">
               <div className="space-y-2">
                  <h3 className="text-3xl font-serif italic text-bento-dark">{t('contact_form_title')}</h3>
                  <p className="text-bento-light text-sm italic">{t('contact_form_desc')}</p>
               </div>
               
               <div className="grid md:grid-cols-2 gap-8">
                  <InputField label={t('form_name')} value={formData.name} onChange={(e:any)=>setFormData({...formData, name: e.target.value})} required />
                  <InputField label={t('form_email')} type="email" value={formData.email} onChange={(e:any)=>setFormData({...formData, email: e.target.value})} required />
               </div>
               <InputField label={t('form_subject')} value={formData.subject} onChange={(e:any)=>setFormData({...formData, subject: e.target.value})} required />
               <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-bento-light uppercase tracking-widest pl-1">{t('form_message')}</label>
                  <textarea 
                    value={formData.message} 
                    onChange={(e:any)=>setFormData({...formData, message: e.target.value})} 
                    className="w-full bg-gray-50 border-2 border-bento-border p-6 rounded-3xl outline-none focus:border-bento-primary transition text-sm font-medium" 
                    rows={6} 
                    required
                  />
               </div>
               <button type="submit" className="w-full bg-bento-primary text-white py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-bento-primary/30 hover:brightness-110 active:scale-95 transition-all">{t('form_send')}</button>
               
               {submitted && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-green-50 p-6 rounded-2xl text-green-700 text-center text-sm font-medium border border-green-100 italic">
                     {t('form_success')}
                  </motion.div>
               )}
            </form>
         </div>
      </div>
      
      {/* Map Placeholder */}
      <div className="relative aspect-video md:aspect-[3/1] bg-gray-100 rounded-[5rem] overflow-hidden shadow-inner border border-gray-100 group">
         <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 opacity-30 group-hover:opacity-50 transition-opacity">
            <MapPin size={64} className="text-bento-dark" />
            <p className="text-xl font-serif italic text-bento-dark">Google Map integration coming soon...</p>
         </div>
         <div className="absolute inset-x-8 bottom-8 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl max-w-sm">
            <h4 className="font-bold text-bento-dark text-lg mb-2">Adomyo 24 HQ</h4>
            <p className="text-xs text-bento-light leading-relaxed">Unique Bus Stand (Mizan Plaza), Baipail, Ashulia, Savar, Dhaka.</p>
         </div>
      </div>
    </div>
  );
};

const DonationsPage = () => {
  const { t, lang } = useLanguage();
  const [donations, setDonations] = useState<any[]>([]);
  const [step, setStep] = useState(1); // 1: Info, 2: Checkout, 3: Success
  const [formData, setFormData] = useState({ 
    donor_name: '', 
    amount: '', 
    message: '', 
    phone_email: '',
    fund_type: 'তহবিল - ১ (সাধারণ)',
    donor_type: 'সাধারণ অনুদান'
  });
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/donations').then(r => r.ok ? r.json() : []).then(data => setDonations(Array.isArray(data) ? data : []));
  }, []);

  const handleNextToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount && formData.phone_email && formData.donor_name) {
      setStep(2);
    }
  };

  const handleConfirmDonation = async () => {
    if (!selectedMethod) return;
    
    // Simulate API call
    const res = await fetch('/api/donations', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        donor_name: formData.donor_name,
        amount: Number(formData.amount),
        phone_email: formData.phone_email,
        fund_type: formData.fund_type,
        donor_type: formData.donor_type,
        payment_method: selectedMethod,
        message: formData.message
      }) 
    });
    
    if (res.ok) {
      setStep(3);
      fetch('/api/donations').then(r => r.ok ? r.json() : []).then(data => setDonations(Array.isArray(data) ? data : []));
      setTimeout(() => {
        setStep(1);
        setFormData({ donor_name: '', amount: '', message: '', phone_email: '', fund_type: 'তহবিল - ১ (সাধারণ)' });
        setSelectedMethod(null);
      }, 5000);
    }
  };

  const currentTotal = Array.isArray(donations) ? donations.reduce((sum, d) => sum + d.amount, 0) : 0;

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/BKash_Logo.svg/512px-BKash_Logo.svg.png' },
    { id: 'nagad', name: 'Nagad', logo: 'https://seeklogo.com/images/N/nagad-logo-7A70BB6664-seeklogo.com.png' },
    { id: 'rocket', name: 'Rocket', logo: 'https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1CC458D-seeklogo.com.png' },
    { id: 'upay', name: 'Upay', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Upay_logo.svg/1200px-Upay_logo.svg.png' },
    { id: 'nexus', name: 'Nexus Pay', logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/4e/7d/50/4e7d5071-7b00-3b02-5e4e-862ad9b068da/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg' },
    { id: 'tap', name: 'Tap', logo: 'https://play-lh.googleusercontent.com/97-E165-H3N1-3Bv7-9X9-4-1-B-X-Q-Q-Y-H-R-J-K-L-M-N-O' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-20 max-w-7xl space-y-24">
      {step === 1 && (
        <div className="space-y-20">
          <div className="text-center space-y-6">
             <span className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]">Support Humanity</span>
             <h1 className="text-4xl md:text-8xl font-serif text-bento-dark italic leading-none">{t('donate_section_title').split(' ')[0]} <span className="text-bento-primary">{t('donate_section_title').split(' ').slice(1).join(' ')}</span></h1>
             <div className="w-40 h-1 bg-bento-primary mx-auto rounded-full"></div>
          </div>

          <div className="bg-yellow-500/5 backdrop-blur-xl border-2 border-yellow-500/20 rounded-[3rem] p-10 md:p-14 space-y-12">
            <h2 className="text-2xl font-serif text-center text-bento-dark italic">{t('donation_info_title')}</h2>
            
            <form onSubmit={handleNextToCheckout} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bento-light pl-2">{t('donation_fund_label')}</label>
                <select 
                   className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-yellow-500 transition font-bold text-sm"
                   value={formData.fund_type}
                   onChange={(e) => setFormData({...formData, fund_type: e.target.value})}
                >
                   <option>{t('fund_general')}</option>
                   <option>{t('fund_relief')}</option>
                   <option>{t('fund_education')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bento-light pl-2">{t('donor_type')} *</label>
                <select 
                   className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-yellow-500 transition font-bold text-sm"
                   value={formData.donor_type}
                   onChange={(e) => setFormData({...formData, donor_type: e.target.value})}
                >
                   <option>{t('general_donation')}</option>
                   <option>{t('regular_donor')}</option>
                   <option>{t('life_donor')}</option>
                </select>
              </div>

              <InputField 
                label={t('form_name') + " *"} 
                value={formData.donor_name} 
                onChange={(e:any)=>setFormData({...formData, donor_name: e.target.value})} 
                placeholder="পরিচয় দিন" 
                required 
              />
              
              <InputField 
                label={t('mobile_email') + " *"} 
                value={formData.phone_email} 
                onChange={(e:any)=>setFormData({...formData, phone_email: e.target.value})} 
                placeholder="017... / email@..." 
                required 
              />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bento-light pl-2">{t('donation_amount_label')}</label>
                <div className="flex gap-4">
                  <input 
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="flex-grow bg-white border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-yellow-500 transition font-bold text-sm"
                    placeholder={t('donation_amount_placeholder')}
                    required
                  />
                  <button type="submit" className="bg-bento-accent hover:bg-green-700 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-green-500/20">{t('donate_now')}</button>
                </div>
              </div>
            </form>
            
            <p className="text-center text-xs text-bento-light italic">
              {t('donation_blessing')} <span className="text-bento-primary font-bold cursor-pointer hover:underline">{t('click_details')}</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
             <div className="space-y-8">
                <h3 className="text-3xl font-serif italic text-bento-dark">{t('fund_status')}</h3>
                <div className="bento-card bg-bento-dark text-white p-12 space-y-6 relative overflow-hidden group">
                   <Heart size={200} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition duration-1000" fill="currentColor" />
                   <p className="text-sm font-black uppercase tracking-[0.3em] opacity-60">{t('total_collected')}</p>
                   <p className="text-6xl font-black italic">৳ {currentTotal.toLocaleString()}</p>
                   <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                      <motion.div initial={{width: 0}} whileInView={{width: '65%'}} className="h-full bg-bento-primary" />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('fund_target')}</p>
                </div>
             </div>

             <div className="space-y-8">
                <h3 className="text-3xl font-serif italic text-bento-dark">{t('recent_feed')}</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                   {Array.isArray(donations) && donations.map((d, i) => (
                      <div key={d.id} className="bento-card !p-6 flex justify-between items-center bg-gray-50/50 border-gray-100 italic transition hover:shadow-lg">
                         <div className="space-y-1">
                            <p className="font-bold text-bento-dark">{d.donor_name}</p>
                            <p className="text-[10px] text-bento-light uppercase tracking-widest">{new Date(d.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
                         </div>
                         <p className="text-2xl font-black text-bento-primary">৳{d.amount}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="flex items-center gap-4 text-bento-light hover:text-bento-dark transition cursor-pointer" onClick={() => setStep(1)}>
            <ArrowRight className="rotate-180" size={20} />
            <span className="font-bold text-sm">তহবিল পাতায় ফিরে যান</span>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Left: Summary */}
            <div className="lg:col-span-2 space-y-8 sticky top-24">
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 space-y-8">
                <div className="flex items-center gap-4 pb-8 border-b border-gray-100">
                  <div className="w-12 h-12 bg-bento-primary rounded-2xl flex items-center justify-center text-white font-black italic">A24</div>
                  <div>
                    <h3 className="font-bold text-bento-dark">Adomyo 24 Foundation</h3>
                    <p className="text-[10px] text-bento-light font-black uppercase tracking-widest italic">{formData.fund_type}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center text-sm font-medium text-bento-light">
                    <span>Subtotal</span>
                    <span className="font-bold text-bento-dark">৳{Number(formData.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-bento-light">
                    <span>Convenience Charge</span>
                    <span className="font-bold text-bento-accent">৳০.০০</span>
                  </div>
                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-serif italic text-xl text-bento-dark">Total amount</span>
                    <span className="text-3xl font-black text-bento-primary">৳{Number(formData.amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-bento-light">Donor Identity</h4>
                  <div className="bg-gray-50 p-6 rounded-3xl space-y-2 border border-gray-100">
                    <p className="text-sm font-bold text-bento-dark italic">{formData.donor_name}</p>
                    <p className="text-xs text-bento-light leading-relaxed">{formData.phone_email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50 flex items-center gap-4 italic text-xs text-blue-800">
                <Shield size={24} className="shrink-0" />
                <p>আপনার পেমেন্ট তথ্য এনক্রিপ্টেড এবং সম্পূর্ণ নিরাপদ। অদম্য ২৪ কোনো কার্ড তথ্য সংরক্ষণ করে না।</p>
              </div>
            </div>

            {/* Right: Payment Methods */}
            <div className="lg:col-span-3 bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-gray-100 space-y-12">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif italic text-bento-dark">Payment Methods</h2>
                <div className="flex items-center gap-2 text-xs font-bold text-bento-light">
                   <Lock size={12} />
                   Secure Checkout
                </div>
              </div>

              <div className="space-y-10">
                {/* Categories */}
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {['Mobile Banking', 'Card', 'Net Banking'].map((cat) => (
                    <button key={cat} className={`px-6 py-4 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${cat === 'Mobile Banking' ? 'bg-bento-primary text-white shadow-xl shadow-bento-primary/30' : 'bg-gray-100 text-bento-light hover:bg-gray-200'}`}>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {paymentMethods.map((m) => (
                    <motion.div 
                      key={m.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`relative aspect-video rounded-3xl border-2 cursor-pointer flex flex-col items-center justify-center p-4 transition-all group overflow-hidden ${selectedMethod === m.id ? 'border-bento-primary bg-bento-primary/5 shadow-xl' : 'border-gray-100 hover:border-bento-primary/20'}`}
                    >
                      <div className="w-12 h-12 mb-3 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
                        <img src={m.logo} alt={m.name} className="w-10 h-10 object-contain p-1" referrerPolicy="no-referrer" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMethod === m.id ? 'text-bento-primary' : 'text-bento-light'}`}>{m.name}</span>
                      {selectedMethod === m.id && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-bento-primary text-white rounded-full flex items-center justify-center scale-110">
                          <Zap size={8} fill="currentColor" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="pt-8 border-t border-gray-100 space-y-6">
                   <button 
                     onClick={handleConfirmDonation}
                     disabled={!selectedMethod}
                     className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.5em] text-sm transition-all ${selectedMethod ? 'bg-bento-accent text-white shadow-2xl shadow-green-500/30 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                   >
                     Pay ৳{Number(formData.amount).toLocaleString()}
                   </button>
                   <p className="text-[10px] text-center text-bento-light leading-relaxed italic max-w-sm mx-auto">
                     By clicking pay, you agree to our <span className="text-bento-primary underline">terms of service</span> and privacy policy. 
                      facilitators for Adomyo 24 Foundation.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <motion.div 
          initial={{opacity:0, scale:0.95}} 
          animate={{opacity:1, scale:1}} 
          className="max-w-2xl mx-auto bento-card text-center p-20 space-y-8 bg-white border-2 border-green-500/20"
        >
          <div className="w-32 h-32 bg-green-100 text-bento-accent rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
            <Heart size={64} fill="currentColor" className="animate-pulse" />
          </div>
          <h2 className="text-4xl font-serif italic text-bento-dark">দান সম্পন্ন হয়েছে!</h2>
          <p className="text-bento-light leading-relaxed italic italic">
            ধন্যবাদ, <span className="font-bold text-bento-primary">{formData.donor_name}</span>! আপনার এই মহান অনুদান অদম্য ২৪ ফাউন্ডেশনের তহবিলে জমা হয়েছে। আপনার এই ক্ষুদ্র অবদানে বেঁচে যাবে অনেক প্রাণ।
          </p>
          <div className="pt-10 flex justify-center gap-6">
            <button onClick={() => setStep(1)} className="px-10 py-4 bg-bento-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-bento-primary/30 transition-all active:scale-95">আবার দান করুন</button>
            <Link to="/" className="px-10 py-4 border-2 border-bento-border text-bento-light hover:text-bento-dark rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">হোম পেজে ফিরে যান</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const RulesAndRegulationPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('a');
  const sections = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-20 max-w-6xl space-y-20">
      <div className="text-center space-y-6">
         <motion.span 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-bento-primary font-black uppercase tracking-[0.6em] text-[10px]"
         >
           Mission & Principles
         </motion.span>
         <h1 className="text-4xl md:text-8xl font-serif text-bento-dark italic leading-none">
           {t('nav_rules').split(' ')[0]} <span className="text-bento-primary">{t('nav_rules').split(' ').slice(1).join(' ')}</span>
         </h1>
         <div className="w-40 h-1 bg-gradient-to-r from-transparent via-bento-primary to-transparent mx-auto rounded-full"></div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-20 bg-white/30 backdrop-blur-md p-4 rounded-[3rem] sticky top-24 z-30 shadow-xl border border-white/20">
        {sections.map(s => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 shadow-xl ${
              activeTab === s 
              ? 'vibrant-gradient text-white scale-110 shadow-bento-primary/30' 
              : 'bg-white text-bento-light hover:bg-gray-50 border border-gray-100 opacity-60'
            }`}
          >
            {t(`rules_section_${s}_title`).split('.')[0]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -30 }}
           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
           className="bento-card glass-morphism !p-10 md:!p-24 relative overflow-hidden group shadow-[0_40px_100px_rgba(192,57,43,0.1)] border-none"
        >
          {/* Internal Glow Effects for colorful appearance */}
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-bento-primary/5 rounded-full blur-[120px] group-hover:bg-bento-primary/10 transition-colors duration-1000"></div>
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-bento-accent/5 rounded-full blur-[120px] group-hover:bg-bento-accent/10 transition-colors duration-1000"></div>

          <div className="relative z-10 space-y-16">
            <div className="space-y-6">
               <h2 className="text-3xl md:text-6xl font-serif text-bento-dark italic leading-tight">
                 {t(`rules_section_${activeTab}_title`)}
               </h2>
               <div className="w-32 h-2 bg-gradient-to-r from-bento-primary to-transparent rounded-full"></div>
            </div>

            <div className="grid gap-12">
              {activeTab === 'a' && (
                <>
                  <RuleItem index="১" text={t('rules_a_1')} />
                  <RuleItem index="২" text={t('rules_a_2')} />
                  <RuleItem index="৩" text={t('rules_a_3')} />
                </>
              )}
              {activeTab === 'b' && (
                <>
                  <RuleItem index="৪" text={t('rules_b_4')} />
                  <RuleItem index="৫" text={t('rules_b_5')} />
                  <RuleItem index="৬" text={t('rules_b_6')} />
                  <RuleItem index="৭" text={t('rules_b_7')} />
                  <RuleItem index="৮" text={t('rules_b_8')} />
                  <RuleItem index="৯" text={t('rules_b_9')} />
                </>
              )}
              {activeTab === 'c' && (
                <>
                  <RuleItem index="১০" text={t('rules_c_10')} />
                  <RuleItem index="১১" text={t('rules_c_11')} />
                  <RuleItem index="১২" text={t('rules_c_12')} />
                  <RuleItem index="১৩" text={t('rules_c_13')} />
                </>
              )}
              {activeTab === 'd' && (
                <>
                  <RuleItem index="১৪" text={t('rules_d_14')} />
                  <RuleItem index="১৫" text={t('rules_d_15')} />
                  <RuleItem index="১৬" text={t('rules_d_16')} />
                </>
              )}
              {activeTab === 'e' && (
                <>
                  <RuleItem index="১৭" text={t('rules_e_17')} />
                  <RuleItem index="১৮" text={t('rules_e_18')} />
                  <RuleItem index="১৯" text={t('rules_e_19')} />
                  <RuleItem index="২০" text={t('rules_e_20')} />
                </>
              )}
              {activeTab === 'f' && (
                <>
                  <RuleItem index="২১" text={t('rules_f_21')} />
                  <RuleItem index="২২" text={t('rules_f_22')} />
                  <RuleItem index="২৩" text={t('rules_f_23')} />
                </>
              )}
              {activeTab === 'g' && (
                <>
                  <RuleItem index="২৪" text={t('rules_g_24')} />
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="bg-bento-dark rounded-[4rem] p-16 md:p-24 text-center text-white space-y-10 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 group-hover:scale-110 transition-transform duration-1000"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-bento-primary/20 via-transparent to-bento-accent/20"></div>
         <div className="relative z-10 space-y-8">
            <h3 className="text-4xl md:text-6xl font-serif italic">{t('mission_title')}</h3>
            <p className="text-white/60 text-lg max-w-3xl mx-auto font-serif italic leading-relaxed">{t('mission_desc')}</p>
            <div className="pt-8">
               <Link to="/register" className="inline-block vibrant-gradient text-white px-20 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(192,57,43,0.4)] hover:scale-110 hover:shadow-[0_20px_70px_rgba(192,57,43,0.6)] transition-all">
                 {t('member_apply')}
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
};

const RuleItem = ({ text, index }: { text: string, index: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="flex gap-8 items-start group"
  >
    <div className="w-16 h-16 rounded-3xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:vibrant-gradient group-hover:text-white transition-all duration-500 ring-4 ring-transparent group-hover:ring-bento-primary/10">
      <span className="text-2xl font-serif italic font-black text-bento-primary group-hover:text-white transition-colors">{index}</span>
    </div>
    <div className="space-y-2 pt-2">
       <p className="text-xl md:text-2xl text-bento-dark font-serif italic leading-relaxed group-hover:text-bento-primary transition-colors duration-500">
         {text.includes('.') ? text.split('.').slice(1).join('.').trim() : text}
       </p>
       <div className="w-0 group-hover:w-full h-px bg-gradient-to-r from-bento-primary/30 to-transparent transition-all duration-700"></div>
    </div>
  </motion.div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [lang, setLang] = useState<'en' | 'bn'>('bn');

  const t = (key: string) => {
    return (translations[lang] as any)[key] || key;
  };

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

  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    <div className="h-screen flex flex-col items-center justify-center font-serif bg-bento-dark relative overflow-hidden">
      {/* Decorative Orbs - Substantially simplified for mobile */}
      {!isMobile && (
        <>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-bento-primary/20 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-bento-accent/20 rounded-full blur-[100px] animate-pulse [animation-delay:1s]"></div>
        </>
      )}
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative group">
          <motion.div
            animate={shouldReduceMotion ? {} : { 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-40 h-40 md:w-48 md:h-48 bg-white p-4 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_0_50px_rgba(192,57,43,0.3)] border-4 border-bento-primary/20"
          >
            <img 
              src="https://scontent.fdac207-1.fna.fbcdn.net/v/t39.30808-6/600325065_122105978607153564_2431888853554226083_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeHJ7ZaEPusVkByoCIbB_Hz_JzgHKhNoMoknOAcqE2gyidseH5fmTVXb5oAV_9QNKELdYtPeFST0ATocVHw0WmgX&_nc_ohc=APUOphrvjyAQ7kNvwGiWCXm&_nc_oc=AdozKFFO5KC-D8xj6FAby8f1XkhGHR1-uUxzgoPnhzJTyhrtEC7g14w5N3kfJapq8nE&_nc_zt=23&_nc_ht=scontent.fdac207-1.fna&_nc_gid=ZqaJ0_gCwgN_0LBT0_sNlg&_nc_ss=7a3a8&oh=00_Af04M6sGidVzOcANnjbpaS2oyuMlJNeNLNN-MYHexR-c0A&oe=69E9580F" 
              alt="Adomyo 24 Logo" 
              className="w-full h-full object-contain rounded-[2rem]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {/* Scanning Effect - simplified for mobile */}
          {!shouldReduceMotion && (
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-bento-primary to-transparent z-20 blur-sm brightness-150"
            />
          )}
        </div>

        <div className="mt-12 space-y-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-black text-white tracking-[0.5em] uppercase italic"
          >
            অদম্য <span className="text-bento-primary">২৪</span>
          </motion.h1>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-bento-primary rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-bento-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-bento-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, siteSettings, updateSettings }}>
      <LanguageContext.Provider value={{ lang, setLang, t }}>
        <Router>
          <div className="min-h-screen flex flex-col bg-bento-bg scroll-smooth relative overflow-hidden">
            {/* Global Background Design */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-[0.02] md:opacity-[0.03]"></div>
              <div className="absolute inset-0 bg-grain opacity-[0.1] md:opacity-[0.2]"></div>
              
              {!isMobile && !shouldReduceMotion && (
                <>
                  <motion.div 
                    animate={{ x: [0, 100, 0], y: [0, 150, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -left-20 w-[800px] h-[800px] bg-bento-primary/20 rounded-full blur-[140px] will-change-transform" 
                  />
                  <motion.div 
                    animate={{ x: [0, -150, 0], y: [0, 100, 0], scale: [1, 0.8, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-bento-accent/15 rounded-full blur-[120px] will-change-transform" 
                  />
                  <motion.div 
                    animate={{ x: [0, 150, 0], y: [0, -250, 0], rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 left-1/4 w-[900px] h-[900px] bg-vibrant-orange/10 rounded-full blur-[180px] will-change-transform" 
                  />
                  <motion.div 
                    animate={{ x: [-100, 100, -100], y: [0, 200, 0] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/2 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px] will-change-transform" 
                  />
                </>
              )}
              
              {/* Minimal Background for Mobile */}
              {isMobile && (
                <div className="absolute inset-0 bg-gradient-to-b from-bento-primary/5 via-transparent to-bento-accent/5 opacity-50"></div>
              )}
            </div>

            <Navbar />
            <main className="flex-grow relative z-10">
              <Routes>
                <Route path="/" element={<HomeOverview />} />
                <Route path="/live" element={<LiveStreamPage />} />
                <Route path="/committee" element={<CommitteePage />} />
                <Route path="/members" element={<PublicMembersPage />} />
                <Route path="/notices" element={<NoticeBoardPage />} />
                <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/profile" /> : <Register />} />
                <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
                <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/donations" element={<DonationsPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/rules" element={<RulesAndRegulationPage />} />
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
                           <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Adomyo 24</h2>
                           <p className="text-[9px] font-black text-bento-primary uppercase tracking-[0.4em] mt-1">Fearless Humanity</p>
                        </div>
                     </Link>
                     <p className="text-white/40 font-serif italic text-lg leading-relaxed">{t('footer_desc')}</p>
                     
                     <div className="pt-4 flex items-center gap-4 flex-wrap">
                        <a 
                          href="https://www.facebook.com/adomyo24" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all shadow-lg"
                        >
                           <Facebook size={20} />
                        </a>
                        <a 
                          href="https://www.youtube.com/channel/UCkBJa7zuSf9PlwQIU1w3RqQ" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-2xl bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all shadow-lg"
                        >
                           <Youtube size={20} />
                        </a>
                        <a 
                          href="https://www.instagram.com/adomyo24/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-2xl bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all shadow-lg"
                        >
                           <Instagram size={20} />
                        </a>
                        <a 
                          href="https://www.tiktok.com/@adomyo24" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-2xl bg-[#000000]/10 text-white flex items-center justify-center hover:bg-[#000000] transition-all shadow-lg"
                        >
                           <Music size={20} />
                        </a>
                        <a 
                          href="https://adomyo24.blogspot.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-2xl bg-[#FF5722]/10 text-[#FF5722] flex items-center justify-center hover:bg-[#FF5722] hover:text-white transition-all shadow-lg"
                        >
                           <Rss size={20} />
                        </a>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">{t('footer_quick_nav')}</h3>
                     <div className="flex flex-col gap-4">
                        <Link to="/" className="text-white/60 hover:text-bento-primary transition-all font-medium text-sm flex items-center gap-2 group">
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                           {t('nav_home')}
                        </Link>
                        <Link to="/live" className="text-white/60 hover:text-bento-primary transition-all font-medium text-sm flex items-center gap-2 group">
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                           {t('nav_live')}
                        </Link>
                        <Link to="/committee" className="text-white/60 hover:text-bento-primary transition-all font-medium text-sm flex items-center gap-2 group">
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                           {t('nav_committee')}
                        </Link>
                        <Link to="/donations" className="text-white/60 hover:text-bento-primary transition-all font-medium text-sm flex items-center gap-2 group">
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                           {t('nav_donations')}
                        </Link>
                        <Link to="/rules" className="text-white/60 hover:text-bento-primary transition-all font-medium text-sm flex items-center gap-2 group">
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                           {t('nav_rules')}
                        </Link>
                        <Link to="/contact" className="text-white/60 hover:text-bento-primary transition-all font-medium text-sm flex items-center gap-2 group">
                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                           {t('nav_contact')}
                        </Link>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">{t('footer_contact')}</h3>
                     <div className="space-y-6">
                        <div className="flex items-start gap-4 text-white/60 group">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-bento-primary group-hover:bg-bento-primary group-hover:text-white transition-all shrink-0"><MapPin size={18} /></div>
                           <span className="text-sm font-medium">{t('footer_address')}</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/60 group">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0"><Phone size={18} /></div>
                           <span className="text-sm font-medium italic">01722000231</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/60 group">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-all shrink-0"><Mail size={18} /></div>
                           <span className="text-sm font-medium italic underline decoration-white/10 group-hover:decoration-yellow-500/50">adomyo24@gmail.com</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">{t('footer_activities')}</h3>
                     <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                        <p className="text-3xl font-black italic text-bento-accent">১,২০০+</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-2">{t('footer_member_count')}</p>
                        <div className="h-2 w-full bg-white/10 rounded-full mt-4 overflow-hidden">
                           <div className="h-full w-3/4 bg-bento-accent"></div>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="pt-16 flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">{t('footer_rights').toUpperCase()}</p>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.25em] bg-white/5 py-3 px-6 rounded-full inline-block border border-white/5 shadow-inner italic">
                        Developed, design and maintenance by <span className="text-bento-primary italic">Shoriful Islam</span>
                      </p>
                   </div>
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
      </LanguageContext.Provider>
    </AuthContext.Provider>
  );
}
