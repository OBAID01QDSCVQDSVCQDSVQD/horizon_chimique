import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white border-t border-slate-800">
            {/* Call to Action Section */}
            <div className="bg-primary py-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">« Un projet, une question technique ? »</h2>
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">Nos experts sont là pour vous répondre et vous accompagner dans toutes les étapes de votre projet.</p>
                    <Link href="/contact" className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-slate-100 hover:scale-105 transition-all duration-300 shadow-lg">
                        Contactez-nous aujourd’hui
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="mb-6 relative w-56 h-16 bg-white rounded-lg p-2 shadow-sm">
                            <Image
                                src="/logo.png"
                                alt="HORIZON CHIMIQUE"
                                fill
                                className="object-contain" // Removing mix-blend-multiply since we are back to opaque bg
                            />
                        </div>
                        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                            Votre partenaire pour des bâtis durables. Solutions innovantes d'étanchéité et de protection pour le bâtiment et les travaux publics.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-primary transition-all"><Facebook size={18} /></a>
                            <a href="#" className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-primary transition-all"><Instagram size={18} /></a>
                            <a href="#" className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-primary transition-all"><Linkedin size={18} /></a>
                        </div>
                    </div>

                    {/* Menu */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-slate-200 uppercase tracking-wider text-sm">Navigation</h4>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li><Link href="/" className="hover:text-primary transition-colors">Accueil</Link></li>
                            <li><Link href="/products" className="hover:text-primary transition-colors">Nos Produits</Link></li>
                            <li><Link href="/#solutions" className="hover:text-primary transition-colors">Solutions par métier</Link></li>
                            <li><Link href="/#technical" className="hover:text-primary transition-colors">Centre Technique</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Actualités & Blog</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-slate-200 uppercase tracking-wider text-sm">Produits</h4>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li><Link href="/products?category=etancheite" className="hover:text-primary transition-colors">Étanchéité Liquide</Link></li>
                            <li><Link href="/products?category=adjuvants" className="hover:text-primary transition-colors">Adjuvants Béton</Link></li>
                            <li><Link href="/products?category=revetements" className="hover:text-primary transition-colors">Revêtements Sol</Link></li>
                            <li><Link href="/products?category=mortiers" className="hover:text-primary transition-colors">Mortiers Spéciaux</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-slate-200 uppercase tracking-wider text-sm">Contact</h4>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="flex-shrink-0 mt-1 text-primary" size={18} />
                                <span>Tunis, Tunisie</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="flex-shrink-0 text-primary" size={18} />
                                <a href="mailto:contact@horizon-chimique.com" className="hover:text-white transition-colors">contact@horizon-chimique.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="flex-shrink-0 text-primary" size={18} />
                                <span>+216 31 520 033</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} HORIZON CHIMIQUE. Tous droits réservés.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition-colors">Politique de Confidentialité</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
