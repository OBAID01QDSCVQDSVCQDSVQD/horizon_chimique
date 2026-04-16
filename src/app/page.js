'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Users, Wrench, ClipboardList, AlertCircle, CalendarCheck, Headphones, X, Send, Loader2, ChevronRight, Lightbulb, Heart, MessageCircle, Star, UploadCloud, Plus, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trackFbEvent } from '@/utils/trackFbEvent';
import LocationPicker from '@/components/LocationPicker';
import NearbyArtisans from '@/components/NearbyArtisans';
import SupportModal from '@/components/SupportModal';
import { useSearchParams } from 'next/navigation';

const heroImages = [
  '/hero_bg.jpg',
  '/workers.jpg',
  '/chantier.jpg'
];

export default function Home() {
  const searchParams = useSearchParams();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [supportType, setSupportType] = useState(null);

  useEffect(() => {
    const type = searchParams.get('support');
    if (type && ['diagnostic', 'reclamation', 'rdv'].includes(type)) {
      setSupportType(type);
    }
  }, [searchParams]);

  const handleSupportTypeSelect = (type) => {
    setSupportType(type);
    trackFbEvent('InitiateCheckout', {
        content_name: `${type} Form Started`,
        currency: 'TND',
        value: 0.00
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Support Modal (Centralized Logic) */}
      <SupportModal 
        isOpen={!!supportType} 
        type={supportType} 
        onClose={() => setSupportType(null)} 
      />

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center bg-slate-900 overflow-hidden text-white">
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary/70 to-blue-900/80 mix-blend-multiply z-10"></div>
        </div>

        <div className="relative z-20 max-w-6xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
              SDK BATIMENT <br />
              <span className="text-white text-3xl md:text-4xl">L’Excellence en Étanchéité et Protection</span>
            </h1>
            <div className="inline-block bg-blue-600/80 backdrop-blur-md border border-blue-400/50 rounded-full px-5 py-2 mb-6">
              <span className="text-white font-bold flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" /> Entreprise agréée par HORIZON CHIMIQUE
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/products" className="px-6 py-3 bg-white text-primary font-bold rounded-full hover:bg-blue-50 shadow-xl flex items-center justify-center gap-2">
                Découvrir nos Produits <ArrowRight size={18} />
              </Link>
              <Link href="/catalogue" className="px-6 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center">
                Consulter le Catalogue
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Help Center Section */}
      <section className="relative z-30 mt-0 md:-mt-16 px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-black mb-2">Besoin d'un expert ?</h2>
              <p className="text-blue-100">Nos équipes sont prêtes à intervenir. Sélectionnez votre besoin :</p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:flex md:gap-4">
              <button onClick={() => handleSupportTypeSelect('diagnostic')} className="bg-white text-slate-800 p-4 rounded-xl flex flex-col items-center gap-2 w-full md:w-32 group shadow-lg transition-transform hover:scale-105">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ClipboardList size={22} />
                </div>
                <span className="font-bold text-[10px] md:text-sm text-center">Diagnostic<br />Technique</span>
              </button>
              <button onClick={() => handleSupportTypeSelect('reclamation')} className="bg-white text-slate-800 p-4 rounded-xl flex flex-col items-center gap-2 w-full md:w-32 group shadow-lg transition-transform hover:scale-105">
                <div className="p-2 bg-red-100 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <AlertCircle size={22} />
                </div>
                <span className="font-bold text-[10px] md:text-sm text-center">Réclamation<br />Service</span>
              </button>
              <button onClick={() => handleSupportTypeSelect('rdv')} className="bg-white text-slate-800 p-4 rounded-xl flex flex-col items-center gap-2 w-full md:w-32 group shadow-lg transition-transform hover:scale-105">
                <div className="p-2 bg-green-100 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <CalendarCheck size={22} />
                </div>
                <span className="font-bold text-[10px] md:text-sm text-center">Prendre<br />Rendez-vous</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <NearbyArtisans />

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-slate-900">Nos Meilleures Ventes</h2>
          </div>
          <ProductGrid />
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Dernières Réalisations</h2>
          </div>
          <RealizationGrid />
          <div className="text-center mt-8">
            <Link href="/realisations" className="text-primary font-bold inline-flex items-center gap-2">
              Voir plus de chantiers <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
        if (data.success) setProducts(data.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl" />)}</div>;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <motion.div key={product._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="h-48 bg-slate-50 flex items-center justify-center">
            {product.images?.[0] ? <img src={product.images[0]} className="h-full w-full object-cover" /> : <span className="font-bold text-slate-200">SDK</span>}
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{product.designation}</h3>
            <p className="text-slate-500 text-xs mb-3 line-clamp-2">{product.description_courte}</p>
            <Link href={`/products/${product._id}`} className="mt-auto py-2 bg-slate-50 text-primary rounded-lg text-xs font-bold text-center hover:bg-primary hover:text-white transition-colors">
              Voir détails
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RealizationGrid() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/realizations').then(res => res.json()).then(data => {
        if (data.success) setProjects(data.realizations.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-xl" />)}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link href={`/realisations/${project._id}`} key={project._id} className="group bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 h-full flex flex-col transition-transform hover:scale-[1.02]">
          <div className="h-40 relative">
            {project.images?.[0] ? <img src={project.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100" />}
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{project.title}</h3>
            <p className="text-slate-600 text-xs line-clamp-2 mb-4 flex-grow">{project.description}</p>
            <div className="flex items-center justify-between pt-4 border-t text-xs text-slate-400">
               <span>{project.artisan?.companyName || 'Artisan'}</span>
               <div className="flex items-center gap-2"><Heart size={12} /> {project.likesCount || 0}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
