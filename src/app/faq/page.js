import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'FAQ - Questions Fréquentes | SDK Batiment',
    description: 'Trouvez les réponses à vos questions sur l\'étanchéité de toiture, la peinture décorative, et les systèmes Horizon Chimique en Tunisie.',
    keywords: 'FAQ, étanchéité Tunisie, prix étanchéité toiture, système SELF 60, SDK Batiment',
    alternates: {
        canonical: 'https://sdkbatiment.com/faq',
    }
};

const faqs = [
    {
        question: "Quel est le prix de l'étanchéité toiture en Tunisie ?",
        answer: "Le prix moyen d'une étanchéité de toiture en Tunisie varie généralement entre 25 et 60 DT/m² selon le système utilisé, l'état du support et de la surface totale."
    },
    {
        question: "Quelle est la différence entre le SELF 60 et la membrane bitumineuse ?",
        answer: "Le SELF 60 est un système d'étanchéité liquide à base de résines acryliques appliqué en 3 couches sur une armature géotextile. Contrairement à la membrane bitumineuse, il ne nécessite pas de chalumeau, offre une meilleure élasticité (sans joints) et réfléchit les UV."
    },
    {
        question: "Comment choisir son système d'étanchéité toiture ?",
        answer: "Il faut considérer 3 éléments clés : la nature de la surface (béton, tuiles, zinc...), l'état actuel (fissures, pente) et si la toiture est circulable ou non. Nos experts SDK Batiment vous conseillent gratuitement sur place."
    },
    {
        question: "SDK Batiment intervient-il dans toute la Tunisie ?",
        answer: "Oui, SDK Batiment, basé dans le Sahel (Sousse), intervient sur tout le territoire tunisien pour vos travaux d'étanchéité, d'isolation et de peinture décorative."
    },
    {
        question: "Quelle est la garantie de vos travaux d'étanchéité ?",
        answer: "Nos travaux réalisés avec les systèmes certifiés Horizon Chimique (comme le SELF 60) bénéficient d'une garantie décennale (10 ans), avec un suivi et un service après-vente rigoureux."
    }
];

export default function FAQPage() {
    // Generate JSON-LD for Answer Engine Optimization (AEO)
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            {/* Inject JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Questions Fréquentes (FAQ)</h1>
                    <p className="text-lg text-slate-600">
                        Trouvez rapidement les réponses à vos questions concernant nos systèmes d'étanchéité et nos services.
                    </p>
                </div>

                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold text-slate-900 mb-3">{faq.question}</h2>
                            <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-primary rounded-2xl p-8 text-center text-white shadow-lg">
                    <h3 className="text-2xl font-bold mb-4">Vous avez une autre question ?</h3>
                    <p className="mb-6 text-blue-100">Notre équipe d'experts est disponible pour vous conseiller et vous accompagner dans votre projet.</p>
                    <Link href="/contact" className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-xl hover:bg-slate-50 transition-colors">
                        Contactez-nous
                    </Link>
                </div>
            </div>
        </div>
    );
}
