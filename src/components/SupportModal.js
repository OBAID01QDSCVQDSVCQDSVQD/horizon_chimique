'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, ClipboardList, AlertCircle, CalendarCheck, UploadCloud, Trash, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trackFbEvent } from '@/utils/trackFbEvent';
import LocationPicker from './LocationPicker';
import { Turnstile } from '@marsidev/react-turnstile';

export default function SupportModal({ isOpen, type, onClose }) {
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
  const [turnstileToken, setTurnstileToken] = useState(null);

  if (!isOpen) return null;

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

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    
    if (!turnstileToken) {
       return toast.error("Veuillez valider le Captcha anti-bot");
    }

    setSendingSupport(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...supportForm, type, turnstileToken })
      });

      const data = await res.json();

      if (data.success) {
        // 🚀 META TRACKING: LEAD EVENT
        trackFbEvent('Lead', {
          content_name: type === 'diagnostic' ? 'Diagnostic Technique' : type === 'reclamation' ? 'Réclamation' : 'Rendez-vous',
          content_category: 'Formulaire',
          surface: supportForm.surface
        }, {
          phone: supportForm.phone,
          fullName: supportForm.fullName
        });

        if (type === 'rdv' || type === 'diagnostic') {
           trackFbEvent('ScheduleAppointment', { content_name: type });
        }

        toast.success("Votre demande a bien été envoyée !");
        onClose();
      } else {
        toast.error(data.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setSendingSupport(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-slate-900"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-2xl shadow-2xl w-full ${type === 'diagnostic' ? 'max-w-2xl' : 'max-w-md'} overflow-hidden relative flex flex-col max-h-[95vh]`}
        >
          <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center shrink-0 text-slate-800">
            <h3 className="font-bold text-lg flex items-center gap-2">
              {type === 'diagnostic' && <ClipboardList className="text-blue-600" size={20} />}
              {type === 'reclamation' && <AlertCircle className="text-red-500" size={20} />}
              {type === 'rdv' && <CalendarCheck className="text-green-600" size={20} />}
              {type === 'diagnostic' ? 'Diagnostic Technique' : type === 'reclamation' ? 'Réclamation' : 'Prendre Rendez-vous'}
            </h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSupportSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom et Prénom</label>
                <input type="text" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={supportForm.fullName} onChange={e => setSupportForm({ ...supportForm, fullName: e.target.value })} placeholder="Ex: Ahmed Ben Salah" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Lieu</label>
                <LocationPicker onLocationSelect={(loc) => setSupportForm(prev => ({ ...prev, location: loc }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {type === 'diagnostic' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Surface (m²)</label>
                    <input type="number" required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                      value={supportForm.surface} onChange={e => setSupportForm({ ...supportForm, surface: e.target.value })} placeholder="Ex: 120" />
                  </div>
                )}
                <div className={type !== 'diagnostic' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Téléphone (WhatsApp)</label>
                  <input type="tel" required className="w-full px-4 py-3 border-2 border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                    value={supportForm.phone} onChange={e => setSupportForm({ ...supportForm, phone: e.target.value })} placeholder="22 123 456" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Message ou précisions</label>
              <textarea rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-slate-50 text-sm"
                value={supportForm.message} onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}></textarea>
            </div>

             {/* Images */}
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Photos (Optionnel)</label>
                <div className="grid grid-cols-5 gap-2">
                  {supportForm.images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setSupportForm(p => ({...p, images: p.images.filter((_, i) => i !== index)}))} className="absolute top-1 right-1 p-1 bg-white rounded text-red-500 shadow-sm"><Trash size={12} /></button>
                    </div>
                  ))}
                  {supportForm.images.length < 5 && (
                    <div className="relative aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50">
                      {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={20} />}
                      <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                    </div>
                  )}
                </div>
              </div>

            <div className="flex justify-center py-2">
              <Turnstile 
                siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "0x4AAAAAAAC8kETAdfvcxeGcA"} 
                onSuccess={setTurnstileToken} 
              />
            </div>

            <button type="submit" disabled={sendingSupport || uploading}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 
                ${sendingSupport ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
              {sendingSupport ? <Loader2 className="animate-spin" /> : <Send size={18} />}
              {sendingSupport ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
