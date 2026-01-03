'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Users, Wrench } from 'lucide-react';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
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

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center bg-primary overflow-hidden text-white">
        {/* Background Gradient & Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-blue-900 z-0"></div>
        <div className="absolute inset-0 bg-[url('/hero_bg.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay z-0"></div>

        {/* Water Drop Effect (Subtle background) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-blue-300 rounded-full blur-xl opacity-30"
              initial={{ y: -100, x: Math.random() * 100 + "%", scale: Math.random() * 0.5 + 0.5 }}
              animate={{ y: "120vh" }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
              style={{ width: '50px', height: '50px' }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-lg">
              HORIZON CHIMIQUE : <br className="hidden md:block" />
              <span className="text-white">L’Excellence en Étanchéité</span> <br />et Protection du Bâtiment.
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Depuis plus de 15 ans, nous concevons des solutions innovantes et durables pour protéger vos structures contre l'eau et le temps. Qualité certifiée, expertise technique et accompagnement sur mesure.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/products" className="group px-8 py-4 bg-white text-primary font-bold rounded-full hover:bg-blue-50 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 hover:scale-105">
                Découvrir nos Produits <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-transparent border-2 border-white/80 text-white font-bold rounded-full hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-sm hover:scale-105">
                Demander un Conseil Technique
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Us Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-24 bg-surface relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold uppercase tracking-wider text-sm">Nos Valeurs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Pourquoi choisir HORIZON CHIMIQUE ?</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Nous nous engageons à offrir le meilleur de la technologie chimique pour le bâtiment.</p>
          </div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <Card
              icon={<Wrench className="w-10 h-10 text-primary" />}
              title="Expertise Technique"
              description="Une équipe d’ingénieurs à votre écoute pour des solutions adaptées à chaque support."
            />
            <Card
              icon={<Shield className="w-10 h-10 text-primary" />}
              title="Qualité Garantie"
              description="Des produits rigoureusement testés pour assurer une longévité maximale."
            />
            <Card
              icon={<Users className="w-10 h-10 text-primary" />}
              title="Proximité"
              description="Un réseau de distribution efficace et un support technique réactif sur tout le territoire."
            />
          </motion.div>
        </div>
      </motion.section>

      {/* About Us */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-24 bg-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full z-0 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-slate-100 rounded-lg z-0 group-hover:rotate-6 transition-transform duration-500"></div>
                <img src="/workers.jpg" alt="Application produit étanchéité" className="relative z-10 rounded-2xl shadow-2xl w-full object-cover h-[400px] hover:scale-[1.02] transition-transform duration-500" />
              </div>
            </div>
            <div className="lg:w-1/2">
              <span className="text-primary font-semibold uppercase tracking-wider text-sm">À Propos de Nous</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-6">L'innovation au service de la durabilité.</h2>
              <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                Chez <strong>HORIZON CHIMIQUE</strong>, nous ne vendons pas seulement des produits ; nous offrons une barrière impénétrable pour vos projets. Spécialisés dans la fabrication de produits d’étanchéité de haute performance, nous mettons notre savoir-faire au profit des professionnels du bâtiment et des particuliers.
              </p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Nos formulations avancées garantissent une protection optimale contre les infiltrations, l'humidité et les agressions climatiques, tout en respectant les normes environnementales les plus strictes.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Solutions certifiées et durables",
                  "Support technique sur chantier",
                  "Innovation continue en chimie du bâtiment"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="text-primary w-6 h-6 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/about" className="text-primary font-bold hover:text-primary-dark inline-flex items-center gap-2 group">
                En savoir plus <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Product Highlight */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-24 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Nos Meilleures Ventes</h2>
              <p className="text-slate-600">Découvrez nos solutions les plus demandées par les professionnels.</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition border-b-2 border-transparent hover:border-primary pb-1">
              Voir tout le catalogue <ArrowRight size={20} />
            </Link>
          </div>

          {/* Dynamic Product Grid */}
          <ProductGrid />

          <div className="mt-12 text-center md:hidden">
            <Link href="/products" className="inline-flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-full text-slate-800 font-bold hover:bg-slate-50 shadow-sm transition">
              Voir tout le catalogue <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </motion.section>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden h-96 animate-pulse">
            <div className="h-56 bg-slate-200"></div>
            <div className="p-6 space-y-3">
              <div className="h-4 bg-slate-200 w-1/3 rounded"></div>
              <div className="h-6 bg-slate-200 w-2/3 rounded"></div>
              <div className="h-4 bg-slate-200 w-full rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-500">Bientôt disponible.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <motion.div
          key={product._id}
          whileHover={{ y: -10, scale: 1.02 }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col h-full hover:shadow-2xl transition-all"
        >
          <div className="h-56 bg-white w-full relative overflow-hidden flex items-center justify-center border-b border-slate-50">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.designation} className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-300 font-bold text-4xl select-none">HC</div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-primary text-xs font-bold px-2 py-1 rounded shadow-sm">
              Nouveau
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <div className="text-xs font-bold text-primary uppercase tracking-wide mb-2">{product.gamme}</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 hover:text-primary transition-colors line-clamp-1" title={product.designation}>{product.designation}</h3>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">{product.description_courte}</p>
            <Link href={`/products/${product._id}`} className="mt-auto px-4 py-2 bg-slate-50 text-primary rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors">
              Voir détails <ArrowRight size={14} />
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
      whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 transition-colors group cursor-pointer"
    >
      <div className="mb-6 bg-blue-50 group-hover:bg-primary transition-colors duration-300 w-16 h-16 rounded-2xl flex items-center justify-center text-primary group-hover:text-white">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </motion.div>
  )
}
