import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Modern Styles
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#334155', // slate-700
        lineHeight: 1.5, // Slightly tighter line height to fit more
        backgroundColor: '#ffffff',
        paddingBottom: 40,
        paddingTop: 35,
    },
    // Header Design
    headerWrapper: {
        marginBottom: 15,
    },
    topAccent: {
        height: 22,
        backgroundColor: '#0ea5e9', // Primary Blue
        width: '100%',
    },
    headerContainer: {
        backgroundColor: '#f1f5f9', // Light Slate Bg
        paddingHorizontal: 40,
        paddingVertical: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
    },
    logoContainer: {
        width: 150,
        height: 50,
        justifyContent: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    logoPlaceholder: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: '#0ea5e9',
        textTransform: 'uppercase',
    },
    companyDetails: {
        alignItems: 'flex-end',
    },
    companyName: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    companySub: {
        fontSize: 8,
        color: '#64748b',
    },

    // Body Content
    body: {
        paddingHorizontal: 40,
    },

    // Title Section
    titleSection: {
        marginBottom: 20,
        marginTop: 5,
        paddingBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e2e8f0',
    },
    category: {
        fontSize: 9,
        color: '#0ea5e9',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 5,
        fontFamily: 'Helvetica-Bold',
    },
    title: {
        fontSize: 28, // Bigger
        fontFamily: 'Helvetica-Bold', // Bold
        color: '#0f172a', // Very Dark Slate
        marginBottom: 8,
        lineHeight: 1.1,
        textTransform: 'uppercase', // Modern touch
        letterSpacing: -0.5, // Tighter tracking
    },
    description: {
        fontSize: 10,
        color: '#475569',
        fontStyle: 'italic',
    },

    // Content Sections
    section: {
        marginBottom: 15,
        paddingBottom: 10,
        break: false, // Avoid breaking sections if possible
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: '#0ea5e9', // Colored titles
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderLeftWidth: 3,
        borderLeftColor: '#0ea5e9',
        paddingLeft: 8,
    },

    // Text Elements
    contentBlock: {
        marginBottom: 8,
    },
    label: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: '#334155',
    },
    text: {
        fontSize: 9,
        color: '#475569',
        textAlign: 'justify',
    },

    // List
    row: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    bullet: {
        width: 12,
        color: '#0ea5e9',
        fontSize: 10,
    },

    // Technical Table
    specsTable: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    specRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        minHeight: 20,
        alignItems: 'center',
    },
    specLabel: {
        width: '40%',
        padding: 6,
        fontFamily: 'Helvetica-Bold',
        color: '#475569',
        fontSize: 8,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    specValue: {
        width: '60%',
        padding: 6,
        color: '#334155',
        fontSize: 8,
        fontWeight: 'normal',
        backgroundColor: '#ffffff',
    },

    // Two Column Layout
    twoCols: {
        flexDirection: 'row',
        gap: 20,
    },
    col: {
        flex: 1,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 7,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 8,
    },
});

export const ProductPdf = ({ product, logoUrl, companyInfo }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Designed Header */}
            <View style={styles.headerWrapper}>
                <View style={styles.topAccent} />
                <View style={styles.headerContainer}>
                    {/* Logo Left */}
                    <View style={styles.logoContainer}>
                        {logoUrl ? (
                            <Image src={logoUrl} style={styles.logo} />
                        ) : (
                            <Text style={styles.logoPlaceholder}>HORIZON CHIMIQUE</Text>
                        )}
                    </View>

                    {/* Info Right */}
                    <View style={styles.companyDetails}>
                        <Text style={styles.companyName}>{companyInfo.companyName}</Text>
                        <Text style={styles.companySub}>{companyInfo.subtitle}</Text>
                        <Text style={styles.companySub}>{companyInfo.address}</Text>
                        <Text style={styles.companySub}>Tél: {companyInfo.phone}</Text>
                        <Text style={styles.companySub}>{companyInfo.email}</Text>
                    </View>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.body}>

                {/* Product Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.category}>
                        {Array.isArray(product.gamme) ? product.gamme.join(' • ') : product.gamme}
                    </Text>
                    <Text style={styles.title}>{product.designation}</Text>
                    <Text style={styles.description}>{product.description_courte}</Text>
                </View>

                {/* 1. Présentation & Domaines (Two Cols for Compactness) */}
                <View style={styles.section}>
                    <View style={styles.twoCols}>
                        <View style={styles.col}>
                            <Text style={styles.sectionTitle}>Présentation</Text>
                            <Text style={styles.text}>{product.informations}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.sectionTitle}>Domaines d'emploi</Text>
                            <Text style={styles.text}>{product.domaine_application}</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Données Techniques Grid */}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionTitle}>Caractéristiques Techniques</Text>
                    <View style={styles.specsTable}>
                        {product.caracteristiques?.aspect && (
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Aspect / Finition</Text>
                                <Text style={styles.specValue}>{product.caracteristiques.aspect}</Text>
                            </View>
                        )}
                        {product.donnees_techniques?.couleur && (
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Couleur</Text>
                                <Text style={styles.specValue}>{product.donnees_techniques.couleur}</Text>
                            </View>
                        )}
                        {product.donnees_techniques?.densite && (
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Densité</Text>
                                <Text style={styles.specValue}>{product.donnees_techniques.densite}</Text>
                            </View>
                        )}
                        {product.donnees_techniques?.extrait_sec && (
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Extrait Sec</Text>
                                <Text style={styles.specValue}>{product.donnees_techniques.extrait_sec}</Text>
                            </View>
                        )}
                        {/* Temps de séchage added */}
                        {product.caracteristiques?.temps_sechage && (
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Temps de séchage</Text>
                                <Text style={styles.specValue}>{product.caracteristiques.temps_sechage}</Text>
                            </View>
                        )}
                        {product.caracteristiques?.rendement && (
                            <View style={styles.specRow}>
                                <Text style={styles.specLabel}>Rendement / Consommation</Text>
                                <Text style={styles.specValue}>{product.caracteristiques.rendement}</Text>
                            </View>
                        )}
                        {/* Conditionnement added */}
                        {product.caracteristiques?.conditionnement && (
                            <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.specLabel}>Conditionnement</Text>
                                <Text style={styles.specValue}>{product.caracteristiques.conditionnement}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* 3. Avantages */}
                {product.avantages && product.avantages.length > 0 && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Avantages</Text>
                        {product.avantages.map((av, i) => (
                            <View key={i} style={styles.row}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={[styles.text, { flex: 1 }]}>{av}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* 4. Mise en oeuvre */}
                {(product.preparation_support || product.mise_en_oeuvre) && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Mise en Œuvre</Text>

                        {product.preparation_support && (
                            <View style={styles.contentBlock}>
                                <Text style={styles.label}>Préparation des supports :</Text>
                                <Text style={styles.text}>{product.preparation_support}</Text>
                            </View>
                        )}

                        {product.mise_en_oeuvre && (
                            <View style={styles.contentBlock}>
                                <Text style={styles.label}>Application :</Text>
                                <Text style={styles.text}>{product.mise_en_oeuvre}</Text>
                            </View>
                        )}

                        {product.consommation && (
                            <View style={styles.contentBlock}>
                                <Text style={styles.label}>Consommation :</Text>
                                <Text style={styles.text}>{product.consommation}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* 5. Additional Info (Nettoyage, Stockage, Sécurité) */}
                {(product.nettoyage || product.stockage || (product.securite && product.securite.length > 0)) && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Informations Complémentaires</Text>

                        <View style={styles.twoCols}>
                            <View style={styles.col}>
                                {product.nettoyage && (
                                    <View style={styles.contentBlock}>
                                        <Text style={styles.label}>Nettoyage des outils :</Text>
                                        <Text style={styles.text}>{product.nettoyage}</Text>
                                    </View>
                                )}
                                {product.stockage && (
                                    <View style={styles.contentBlock}>
                                        <Text style={styles.label}>Stockage & Conservation :</Text>
                                        <Text style={styles.text}>{product.stockage}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.col}>
                                {product.securite && product.securite.length > 0 && (
                                    <View style={styles.contentBlock}>
                                        <Text style={[styles.label, { color: '#ef4444' }]}>Sécurité & Précautions :</Text>
                                        {product.securite.map((sec, i) => (
                                            <View key={i} style={styles.row}>
                                                <Text style={[styles.bullet, { color: '#ef4444' }]}>!</Text>
                                                <Text style={[styles.text, { flex: 1 }]}>{sec}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}

            </View>

            {/* Footer */}
            <Text style={styles.footer} fixed>
                Fiche Technique • {companyInfo.companyName} • {companyInfo.website} • Page 1/1
            </Text>
        </Page>
    </Document>
);
