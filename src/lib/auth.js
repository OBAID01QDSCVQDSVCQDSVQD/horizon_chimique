import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// Normalise le numéro pour comparaison
function normalizePhone(p) {
    if (!p || typeof p !== 'string') return '';
    const digits = p.replace(/\D/g, '');
    if (digits.length === 8 && /^[2459]/.test(digits)) return '216' + digits;
    if (digits.startsWith('216')) return digits;
    if (digits.startsWith('0')) return '216' + digits.slice(1);
    return digits;
}

export const verifyTurnstile = async (token) => {
    const secretKey = process.env.TURNSTILE_SECRET_KEY || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (!secretKey) return true; // Skip if no secret key configured

    try {
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);

        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        return data.success;
    } catch (err) {
        console.error("Turnstile verification error:", err);
        return false;
    }
};

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                identifier: { label: "Email ou Téléphone", type: "text" },
                password: { label: "Mot de passe", type: "password" },
                otp: { label: "OTP Code", type: "text" },
                phone: { label: "Téléphone", type: "text" },
                turnstileToken: { label: "Turnstile Token", type: "text" }
            },
            async authorize(credentials) {
                try {
                    const { identifier, password, otp, phone: phoneCred, turnstileToken } = credentials;

                    // 1. Verify Turnstile (Strict Blocking) - SKIP if OTP is provided as it was verified during send-SMS
                    if (!otp) {
                        const isHuman = await verifyTurnstile(turnstileToken);
                        if (!isHuman) {
                            console.error("❌ Bot Detected - Login Blocked");
                            throw new Error("Échec de la vérification Anti-Bot. Accès refusé.");
                        }
                    }

                    // Case 4: Local SMS OTP (WinSMS.tn)
                    if (otp && phoneCred) {
                        await dbConnect();
                        const OTP = (await import("@/models/OTP")).default;
                        
                        const normalized = normalizePhone(phoneCred);
                        const otpEntry = await OTP.findOne({ 
                            phone: normalized, 
                            code: otp,
                            expiresAt: { $gt: new Date() }
                        });

                        if (!otpEntry) {
                            throw new Error("Code OTP invalide ou expiré");
                        }

                        const simpleDigits = phoneCred.replace(/\D/g, '');
                        const tunisDigits = simpleDigits.length === 8 ? simpleDigits : (simpleDigits.startsWith('216') ? simpleDigits.slice(3) : simpleDigits);

                        let user = await User.findOne({ 
                            $or: [
                                { phone: normalized },
                                { phone: phoneCred },
                                { phone: simpleDigits },
                                { phone: tunisDigits },
                                { phone: '00' + normalized },
                                { phone: '+' + normalized }
                            ]
                        });

                        if (!user) {
                            // Auto-register new user with random hashed password
                            const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
                            const hashedPassword = await bcrypt.hash(randomPassword, 10);
                            
                            user = await User.create({
                                name: `Utilisateur ${normalized.slice(-8)}`,
                                phone: normalized,
                                password: hashedPassword,
                                role: 'client',
                                isVerified: true,
                                status: 'approved'
                            });
                            console.log("🆕 New user registered automatically via OTP (Secured):", normalized);
                        }

                        // Consommer l'OTP
                        await OTP.deleteOne({ _id: otpEntry._id });

                        return {
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            phone: user.phone,
                            isVerified: user.isVerified
                        };
                    }

                    // Case 3: Classic Email/Password
                    if (!identifier || !password) {
                        throw new Error("Veuillez remplir tous les champs");
                    }

                    await dbConnect();

                    const user = await User.findOne({
                        $or: [
                            { email: identifier.toLowerCase() },
                            { phone: identifier },
                            { phone: normalizePhone(identifier) }
                        ]
                    });

                    if (!user) {
                        throw new Error("Identifiants invalides");
                    }

                    if (!user.password) {
                        throw new Error("Ce compte utilise une autre méthode de connexion");
                    }

                    const isPasswordMatch = await bcrypt.compare(password, user.password);

                    if (!isPasswordMatch) {
                        throw new Error("Identifiants invalides");
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        phone: user.phone,
                        isVerified: user.isVerified
                    };
                } catch (error) {
                    throw new Error(error.message);
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.phone = user.phone;
                token.isVerified = user.isVerified;
            }
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.phone = token.phone;
                session.user.isVerified = token.isVerified;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
