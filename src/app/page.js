'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Users, Wrench, ClipboardList, AlertCircle, CalendarCheck, Headphones, X, Send, Loader2, ChevronRight, Lightbulb, Heart, MessageCircle, Star, UploadCloud, Plus, Trash } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trackFbEvent } from '@/utils/trackFbEvent';
import LocationPicker from '@/components/LocationPicker';
import NearbyArtisans from '@/components/NearbyArtisans';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const heroImages = [
  '/hero_bg.jpg',
  '/workers.jpg',
  '/chantier.jpg'
];

import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Support Modal State
  const [supportType, setSupportType] = useState(null);

  useEffect(() => {
    const type = searchParams.get('support');
    if (type && ['diagnostic', 'reclamation', 'rdv'].includes(type)) {
      setSupportType(type);
    }
  }, [searchParams]);
  const [supportForm, setSupportForm] = useState({
    fullName: '',
    message: '',
    date: '',
    surface: '',
    location: null,
    times: [''],
    phone: '',
    images: []
  });
  const [sendingSupport, setSendingSupport] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Time Slots Handlers
  const addTimeSlot = () => setSupportForm(prev => ({ ...prev, times: [...prev.times, ''] }));
  const removeTimeSlot = (index) => setSupportForm(prev => ({ ...prev, times: prev.times.filter((_, i) => i !== index) }));
  const updateTimeSlot = (index, value) => {
    const newTimes = [...supportForm.times];
    newTimes[index] = value;
    setSupportForm(prev => ({ ...prev, times: newTimes }));
  };

  // Image Handlers
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (supportForm.images.length + files.length > 5) return toast.error("Maximum 5 images");

    setUploading(true);
    try {
      const newUrls = [];
      for (const file of files) {
        const data = new FormData();
        data.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: data });
        const json = await res.json();
        if (json.success) newUrls.push(json.url);
      }
      setSupportForm(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
    } catch (error) {
      toast.error("Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => setSupportForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  // New InitiateCheckout Pixel handler (High Priority)
  const handleSupportTypeSelect = (type) => {
    setSupportType(type);
    
    // Track initiation (Browser + CAPI)
    trackFbEvent('InitiateCheckout', {
        content_name: type === 'diagnostic' ? 'Diagnostic Form Started' : type === 'reclamation' ? 'Réclamation Form Started' : 'Rendez-vous Form Started',
        currency: 'TND',
        value: 0.00
    });
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSendingSupport(true);

    try {
      const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;

      const payload = {
        ...supportForm,
        type: supportType,
        turnstileToken
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        // Log Lead & Completion (Browser + CAPI)
        trackFbEvent('Lead', {
          content_name: supportType === 'diagnostic' ? 'Diagnostic Technique' : supportType === 'reclamation' ? 'Réclamation' : 'Rendez-vous',
          surface: supportForm.surface
        }, {
          phone: supportForm.phone,
          fullName: supportForm.fullName
        });

        // Specific sub-event
        if (supportType === 'rdv' || supportType === 'diagnostic') {
          trackFbEvent('ScheduleAppointment', { content_name: supportType });
        } else if (supportType === 'reclamation') {
          trackFbEvent('Contact', { content_name: 'Réclamation' });
        }
        toast.success("Votre demande a bien été envoyée !");
        setSupportType(null);
        setSupportForm({
          fullName: '',
          message: '',
          date: '',
          surface: '',
          location: null,
          times: [''],
          phone: '',
          images: []
        });
      } else {
        toast.error(data.error || "Erreur lors de l'envoi");
        console.error(data.error);
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setSendingSupport(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero Section - Compact */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center bg-slate-900 overflow-hidden text-white">

        {/* Dynamic Background Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentBgIndex}
              src={heroImages[currentBgIndex]}
              alt="Background"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary/70 to-blue-900/80 mix-blend-multiply z-10"></div>
          {/* subtle pattern */}
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 z-10 mix-blend-overlay"></div>
        </div>

        {/* Floating Particles - Reduced Scale */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-30">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-blue-300 rounded-full blur-xl opacity-30"
              initial={{ y: -100, x: Math.random() * 100 + "%", scale: Math.random() * 0.5 + 0.5 }}
              animate={{ y: "100vh" }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
              style={{ width: '40px', height: '40px' }}
            />
          ))}
        </div>

        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-shadow-sm">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight drop-shadow-lg">
              SDK BATIMENT <br className="hidden md:block" />
              <span className="text-white text-3xl md:text-4xl lg:text-5xl">L’Excellence en Étanchéité et Protection</span>
            </h1>

            <div className="inline-block bg-blue-600/80 backdrop-blur-md border border-blue-400/50 rounded-full px-5 py-2 mb-6 shadow-lg">
              <span className="text-white font-bold tracking-wide text-sm md:text-base flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" /> Entreprise agréée par HORIZON CHIMIQUE
              </span>
            </div>

            <p className="text-base md:text-lg text-blue-50 mb-8 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
              Depuis plus de 15 ans, nous concevons des solutions innovantes et durables pour protéger vos structures contre l'eau et le temps. Qualité certifiée, expertise technique et accompagnement sur mesure.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/products" className="group px-6 py-3 bg-white text-primary font-bold rounded-full hover:bg-blue-50 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 hover:scale-105 text-sm md:text-base">
                Découvrir nos Produits <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/catalogue" className="px-6 py-3 bg-transparent border-2 border-white/80 text-white font-bold rounded-full hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-sm hover:scale-105 text-sm md:text-base">
                Consulter le Catalogue
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SUPPORT & SERVICES SECTION - Overlapping Hero */}
      <section className="relative z-30 mt-0 md:-mt-16 px-4 pb-0">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl md:rounded-3xl shadow-xl md:shadow-2xl p-6 md:p-8 text-white overflow-hidden relative"
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 relative z-10">
            <div className="text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/20 rounded-full px-3 py-1 mb-3 backdrop-blur-sm">
                <Headphones size={14} className="text-blue-100" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Centre d'Aide</span>
              </div>
              <h2 className="text-xl md:text-3xl font-black mb-2 leading-tight">Besoin d'un expert ?</h2>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed">Nos équipes sont prêtes à intervenir. Sélectionnez votre besoin :</p>
            </div>

            <div className="w-full lg:w-auto grid grid-cols-3 gap-2 md:flex md:flex-row md:gap-3">
              <button onClick={() => handleSupportTypeSelect('diagnostic')} className="bg-white hover:bg-blue-50 text-slate-800 p-2 md:p-4 rounded-xl shadow-lg border-2 border-transparent hover:border-blue-200 transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 w-full md:w-32 group h-full">
                <div className="p-2 md:p-2.5 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
                  <ClipboardList size={20} className="md:w-[22px] md:h-[22px]" />
                </div>
                <span className="font-bold text-[10px] md:text-sm text-center leading-tight">Diagnostic<br />Technique</span>
              </button>

              <button onClick={() => handleSupportTypeSelect('reclamation')} className="bg-white hover:bg-blue-50 text-slate-800 p-2 md:p-4 rounded-xl shadow-lg border-2 border-transparent hover:border-blue-200 transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 w-full md:w-32 group h-full">
                <div className="p-2 md:p-2.5 bg-red-100 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 shrink-0">
                  <AlertCircle size={20} className="md:w-[22px] md:h-[22px]" />
                </div>
                <span className="font-bold text-[10px] md:text-sm text-center leading-tight">Réclamation<br />Service</span>
              </button>

              <button onClick={() => handleSupportTypeSelect('rdv')} className="bg-white hover:bg-blue-50 text-slate-800 p-2 md:p-4 rounded-xl shadow-lg border-2 border-transparent hover:border-blue-200 transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-3 w-full md:w-32 group h-full">
                <div className="p-2 md:p-2.5 bg-green-100 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300 shrink-0">
                  <CalendarCheck size={20} className="md:w-[22px] md:h-[22px]" />
                </div>
                <span className="font-bold text-[10px] md:text-sm text-center leading-tight">Prendre<br />Rendez-vous</span>
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Nearby Artisans Section */}
      <NearbyArtisans />

      {/* Solutions Section - Dynamic */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-8 md:py-16 bg-surface relative z-10"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-12">
            <span className="text-primary font-semibold uppercase tracking-wider text-xs">Nos Solutions</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 mb-3">Experts en Solutions Techniques</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4"></div>
            <p className="text-slate-600 max-w-xl mx-auto text-base">Découvrez nos systèmes complets pour l'étanchéité et la protection durable de vos ouvrages.</p>
          </div>

          <SolutionsGrid />

        </div>
      </motion.section>

      {/* About Us - Compact */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-8 md:py-16 bg-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-12">
            <div className="lg:w-1/2">
              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-100 rounded-full z-0 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-100 rounded-lg z-0 group-hover:rotate-6 transition-transform duration-500"></div>
                <img src="/workers.jpg" alt="Application produit étanchéité" className="relative z-10 rounded-2xl shadow-xl w-full object-cover h-[350px] hover:scale-[1.02] transition-transform duration-500" />
              </div>
            </div>
            <div className="lg:w-1/2">
              <span className="text-primary font-semibold uppercase tracking-wider text-xs">À Propos de Nous</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 mb-4">L'innovation au service de la durabilité.</h2>
              <p className="text-slate-600 mb-4 leading-relaxed text-base">
                Chez <strong>SDK BATIMENT</strong>, entreprise agrée par <strong>HORIZON CHIMIQUE</strong>, nous ne vendons pas seulement des produits ; nous offrons une barrière impénétrable pour vos projets. Spécialisés dans la fabrication de produits d’étanchéité de haute performance, nous mettons notre savoir-faire au profit des professionnels du bâtiment et des particuliers.
              </p>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                Nos formulations avancées garantissent une protection optimale contre les infiltrations, l'humidité et les agressions climatiques, tout en respectant les normes environnementales les plus strictes.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Solutions certifiées et durables",
                  "Support technique sur chantier",
                  "Innovation continue en chimie du bâtiment"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <CheckCircle className="text-primary w-5 h-5 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/about" className="text-primary font-bold hover:text-primary-dark inline-flex items-center gap-1 group text-sm">
                En savoir plus <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Product Highlight - Compact */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-8 md:py-16 bg-slate-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-4 md:mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Nos Meilleures Ventes</h2>
              <p className="text-slate-600 text-sm">Découvrez nos solutions les plus demandées par les professionnels.</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-1 text-primary font-bold hover:text-primary-dark transition border-b-2 border-transparent hover:border-primary pb-0.5 text-sm">
              Voir tout le catalogue <ArrowRight size={18} />
            </Link>
          </div>

          {/* Dynamic Product Grid */}
          <ProductGrid />

          <div className="mt-8 text-center md:hidden">
            <Link href="/products" className="inline-flex items-center gap-2 bg-white border border-slate-200 px-6 py-2 rounded-full text-slate-800 font-bold hover:bg-slate-50 shadow-sm transition text-sm">
              Voir tout le catalogue <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Realizations Highlight */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-16 bg-white border-t border-slate-100"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary font-semibold uppercase tracking-wider text-xs">Nos Références</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 mb-3">Dernières Réalisations</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4"></div>
            <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base">Découvrez les projets récents réalisés par nos partenaires artisans avec le support technique de <strong>HORIZON CHIMIQUE</strong>.</p>
          </div>
          <RealizationGrid />

          <div className="text-center mt-8">
            <Link href="/realisations" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
              Voir plus de chantiers <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* SUPPORT MODAL */}
      <AnimatePresence>
        {supportType && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-slate-900"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white rounded-2xl shadow-2xl w-full ${supportType === 'diagnostic' ? 'max-w-2xl' : 'max-w-md'} overflow-hidden relative flex flex-col max-h-[90vh]`}
            >
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  {supportType === 'diagnostic' && <ClipboardList className="text-blue-600" size={20} />}
                  {supportType === 'reclamation' && <AlertCircle className="text-red-500" size={20} />}
                  {supportType === 'rdv' && <CalendarCheck className="text-green-600" size={20} />}
                  {supportType === 'diagnostic' ? 'Diagnostic Technique' : supportType === 'reclamation' ? 'Réclamation' : 'Prendre Rendez-vous'}
                </h3>
                <button onClick={() => setSupportType(null)} className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSupportSubmit} className="p-6 space-y-4 overflow-y-auto">
                <p className="text-sm text-slate-500 mb-2">
                  {supportType === 'diagnostic' ? 'Demandez une visite technique. Remplissez les détails du chantier.' :
                    supportType === 'reclamation' ? 'Dites-nous ce qui n’a pas fonctionné. Nous ferons notre possible pour résoudre le souci.' :
                      'Choisissez le moment qui vous convient, nous vous confirmerons par téléphone.'}
                </p>

                {(supportType === 'diagnostic' || supportType === 'reclamation' || supportType === 'rdv') && (
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Nom et Prénom</label>
                      <input type="text" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm bg-blue-50/10"
                        value={supportForm.fullName} onChange={e => setSupportForm({ ...supportForm, fullName: e.target.value })} placeholder="Ex: Ahmed Ben Salah" />
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">
                        {supportType === 'diagnostic' ? 'Lieu du chantier' : supportType === 'reclamation' ? 'Lieu du problème' : 'Lieu du rendez-vous'}
                      </label>
                      <LocationPicker onLocationSelect={(loc) => setSupportForm(prev => ({ ...prev, location: loc }))} />
                    </div>

                    {/* Surface & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {supportType === 'diagnostic' && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Surface (m²)</label>
                          <input type="number" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                            value={supportForm.surface} onChange={e => setSupportForm({ ...supportForm, surface: e.target.value })} placeholder="Ex: 120" />
                        </div>
                      )}
                      <div className={supportType !== 'diagnostic' ? 'col-span-2' : ''}>
                        <label className="block text-sm font-bold text-slate-700 mb-1">WhatsApp</label>
                        <input type="tel" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                          value={supportForm.phone} onChange={e => setSupportForm({ ...supportForm, phone: e.target.value })} placeholder="+216..." />
                      </div>
                    </div>

                    {/* Times (Diagnostic & RDV) */}
                    {(supportType === 'diagnostic' || supportType === 'rdv') && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Disponibilités {supportType === 'rdv' ? '(Date et Heure)' : '(Choix multiple)'}</label>
                        {supportForm.times.map((t, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input type="datetime-local" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                              value={t} onChange={e => updateTimeSlot(idx, e.target.value)} />
                            {supportForm.times.length > 1 && (
                              <button type="button" onClick={() => removeTimeSlot(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded bg-slate-100"><Trash size={16} /></button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={addTimeSlot} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"><Plus size={14} /> Ajouter un créneau</button>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    {supportType === 'diagnostic' ? 'Description du problème' : supportType === 'reclamation' ? 'Détails de la réclamation' : 'Message'} (Facultatif)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-slate-50 text-sm"
                    placeholder={supportType === 'rdv' ? "Précisez l'objet du rendez-vous..." : "Décrivez votre demande..."}
                    value={supportForm.message}
                    onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                  ></textarea>
                </div>

                {/* Images (Diagnostic & Reclamation) */}
                {(supportType === 'diagnostic' || supportType === 'reclamation' || supportType === 'rdv') && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Photos (Max 5)</label>
                    <div className="grid grid-cols-5 gap-2">
                      {supportForm.images.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-white/90 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                        </div>
                      ))}
                      {supportForm.images.length < 5 && (
                        <div className="relative aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors">
                          {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <UploadCloud className="w-5 h-5" />}
                          <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={uploading} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cloudflare Turnstile Protection */}
                <div className="flex justify-center py-2 overflow-hidden">
                  <div 
                    className="cf-turnstile" 
                    data-sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}
                    data-theme="light"
                  ></div>
                </div>

                <div className="pt-2 shrink-0">
                  <button
                    type="submit"
                    disabled={sendingSupport || uploading}
                    className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 
                                  ${sendingSupport ? 'bg-slate-400 cursor-not-allowed' :
                        supportType === 'reclamation' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' :
                          supportType === 'rdv' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' :
                            'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                  >
                    {sendingSupport ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                    {sendingSupport ? 'Envoi...' : 'Envoyer la demande'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.data.slice(0, 4));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden h-64 md:h-80 animate-pulse">
            <div className="h-32 md:h-48 bg-slate-200"></div>
            <div className="p-3 md:p-4 space-y-2">
              <div className="h-3 md:h-4 bg-slate-200 w-1/3 rounded"></div>
              <div className="h-3 md:h-4 bg-slate-200 w-2/3 rounded"></div>
              <div className="h-2 md:h-3 bg-slate-200 w-full rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-500 text-sm">Bientôt disponible.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {products.map((product) => (
        <motion.div
          key={product._id}
          whileHover={{ y: -5, scale: 1.01 }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col h-full hover:shadow-xl transition-all"
        >
          <div className="h-32 md:h-48 bg-white w-full relative overflow-hidden flex items-center justify-center border-b border-slate-50 group">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.designation} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="text-slate-300 font-bold text-2xl md:text-4xl select-none">SDK</div>
            )}
            <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur text-primary text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded shadow-sm">
              Nouveau
            </div>
          </div>
          <div className="p-3 md:p-4 flex flex-col flex-grow">
            <div className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-wide mb-1 line-clamp-1">
              {Array.isArray(product.gamme) ? product.gamme.join(' / ') : product.gamme}
            </div>
            <h3 className="text-sm md:text-base font-bold text-slate-800 mb-1 hover:text-primary transition-colors line-clamp-1" title={product.designation}>{product.designation}</h3>
            <p className="text-slate-500 text-[10px] md:text-xs mb-2 md:mb-3 line-clamp-2 md:line-clamp-2 flex-grow leading-tight md:leading-normal">{product.description_courte}</p>
            <Link href={`/products/${product._id}`} className="mt-auto px-2 py-1.5 md:px-3 bg-slate-50 text-primary rounded-lg text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary hover:text-white transition-colors group">
              <span className="truncate">Voir détails</span> <ArrowRight size={12} className="md:w-[14px] md:h-[14px] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Card({ icon, title, description }) {
  const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={itemVariant}
      whileHover={{ scale: 1.03, boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)" }}
      className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 border-t-4 border-t-primary h-full flex flex-col items-start text-left transition-all hover:shadow-md"
    >
      <div className="mb-3 bg-blue-50 group-hover:bg-primary transition-colors duration-300 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-primary group-hover:text-white shrink-0">
        {icon}
      </div>
      <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-xs md:text-sm">
        {description}
      </p>
    </motion.div>
  )
}

function RealizationGrid() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/realizations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProjects(data.realizations.slice(0, 3));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {projects.map((project) => (
        <motion.div
          key={project._id}
          whileHover={{ y: -5 }}
          className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 flex flex-col h-full"
        >
          <div className="relative h-48 overflow-hidden">
            {project.images?.[0] ? (
              <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">Pas d'image</div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Link href={`/realisations/${project._id}`} className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold transform scale-90 group-hover:scale-100 transition-transform">
                Voir le projet
              </Link>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase tracking-wide">{project.tags?.[0] || 'Chantier'}</span>
              <span className="text-xs text-slate-400">{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
            <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">{project.description}</p>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-50 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0">
                  {project.artisan?.image ? <img src={project.artisan.image} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[100px] leading-tight flex items-center gap-1.5">
                    {(() => {
                      const name = project.artisan?.companyName || project.artisan?.name || '';
                      const words = name.split(' ');
                      return words.length > 2 ? words.slice(0, 2).join(' ') + '...' : name;
                    })()}
                    {(() => {
                      const isGold = project.artisan?.fidelityRank === 'gold' || (!project.artisan?.fidelityRank && (project.artisan?.points || 0) >= 5000);
                      const isSilver = project.artisan?.fidelityRank === 'silver' || (!project.artisan?.fidelityRank && (project.artisan?.points || 0) >= 1000);

                      if (isGold) return <span className="w-3.5 h-3.5 bg-yellow-400 border border-yellow-600 rounded-full flex items-center justify-center text-[8px] text-white shadow-sm" title="Or">🥇</span>;
                      if (isSilver) return <span className="w-3.5 h-3.5 bg-slate-300 border border-slate-500 rounded-full flex items-center justify-center text-[8px] text-slate-800 shadow-sm" title="Argent">🥈</span>;
                      return <span className="w-3.5 h-3.5 bg-orange-400 border border-orange-600 rounded-full flex items-center justify-center text-[8px] text-white shadow-sm" title="Bronze">🥉</span>;
                    })()}
                  </span>
                  {project.artisanRating > 0 && (
                    <div className="flex items-center mt-0.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={10}
                            className={`${star <= Math.round(project.artisanRating) ? "text-yellow-500 fill-yellow-500" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 ml-1">({project.artisanRating})</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Heart size={14} /> {project.likesCount || 0}</span>
                <span className="flex items-center gap-1"><MessageCircle size={14} /> {project.commentsCount || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SolutionsGrid() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/solutions')
      .then(res => res.json())
      .then(data => {
        // Standard API response in this app seems to be { success: true, data: [...] } or direct array
        const list = data.data || data || [];
        if (Array.isArray(list)) {
          setSolutions(list.slice(0, 4));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...';
  };

  if (loading) {
    return (
      <div className="flex overflow-x-auto pb-8 -mx-4 px-4 gap-3 md:grid md:grid-cols-4 md:gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="min-w-[230px] bg-white rounded-xl h-48 shadow-sm border border-slate-100 animate-pulse p-6">
            <div className="w-12 h-12 bg-slate-100 rounded-lg mb-4"></div>
            <div className="h-4 bg-slate-100 w-3/4 mb-2 rounded"></div>
            <div className="h-3 bg-slate-100 w-full rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (solutions.length === 0) return (
    <div className="text-center py-8 text-slate-500 border border-dashed rounded-xl">Aucune solution trouvée.</div>
  );

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      className="flex overflow-x-auto pb-8 -mx-4 px-4 gap-3 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:mx-0 md:px-0 snap-x [&::-webkit-scrollbar]:hidden"
    >
      {solutions.map((sol) => {
        const IconComp = LucideIcons[sol.icon] || LucideIcons.Layers;

        return (
          <motion.div
            key={sol._id}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="min-w-[230px] snap-center h-full"
          >
            <Link href={`/solutions/${sol._id}`} className="block h-full group">
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 border-t-4 border-t-primary h-full flex flex-col items-start text-left transition-all hover:shadow-md hover:scale-[1.02]">
                <div className={`mb-3 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white`}>
                  <IconComp className="w-5 h-5 md:w-6 md:h-6" />
                </div>

                <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{sol.title}</h3>
                <p className="text-slate-600 leading-relaxed text-xs md:text-sm line-clamp-3">
                  {stripHtml(sol.description)}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

