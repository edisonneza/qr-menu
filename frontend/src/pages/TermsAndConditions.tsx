import React from "react";
import { SitemarkIcon } from "../components/CustomIcons";

export default function TermsAndConditions() {

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-6 md:p-12 font-sans text-slate-800">
            <header className="max-w-4xl mx-auto flex items-center justify-between py-6">
                <div className="flex items-center gap-3">
                    <SitemarkIcon {...{ height: 21, width: 100, mr: 2 }} />
                    <div>
                        <h1 className="text-2xl font-semibold">QR Scan Menu — Terms &amp; Conditions</h1>
                        <p className="text-sm text-slate-500">Effective date: <strong>{new Date().toISOString().slice(0, 10)}</strong></p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        These Terms &amp; Conditions ("Terms") govern your access to and use of the QR Scan Menu web application and related services ("Service") provided by the owner of this application ("we", "us", or "the Company"). By accessing or using the Service you agree to be bound by these Terms. If you do not agree, do not use the Service.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">2. Definitions</h2>
                    <ul className="list-disc list-inside text-sm text-slate-600 leading-relaxed space-y-1">
                        <li><strong>User</strong> — any person or entity that uses the Service.</li>
                        <li><strong>Client</strong> — restaurants, cafes or other business owners who create and manage digital menus using the Service.</li>
                        <li><strong>Content</strong> — menus, images, text, prices and any other materials uploaded by a Client or User.</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">3. License &amp; Access</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the Service. You are responsible for maintaining the security of any credentials used to access the Service.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">4. User and Client Obligations</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        You agree not to use the Service for illegal activities and to comply with all applicable laws. Clients are responsible for the accuracy of their Content, including pricing, allergens, and product descriptions. You must not upload Content that infringes intellectual property or violates privacy or safety laws.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">5. Content Ownership</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Clients retain ownership of their Content. By uploading Content, you grant us a worldwide, royalty-free right to host, display and distribute that Content as required to provide the Service. We will not claim ownership of your Content.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">6. Payments &amp; Subscriptions</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        If the Service offers paid plans or features, payments are processed according to the pricing and billing terms displayed at the time of purchase. You are responsible for all taxes and fees associated with purchases. Refunds (if any) will be provided according to our refund policy communicated at the point of sale or in a separate document.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">7. Privacy</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Our Privacy Policy explains how we collect, use and share personal information. By using the Service you consent to our collection and processing of personal data as described in the Privacy Policy.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">8. Intellectual Property</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        All rights, title and interest in and to the Service (excluding Content provided by Clients) are and will remain the exclusive property of the Company and its licensors. You may not copy, modify, create derivative works of, or reverse engineer the Service.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">9. Disclaimers</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        The Service is provided "as is" and "as available" without warranties of any kind. To the fullest extent permitted by law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">10. Limitation of Liability</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        To the maximum extent permitted by applicable law, in no event will we be liable for any indirect, incidental, special, consequential or punitive damages arising from or related to your use of the Service. Our aggregate liability for any claims arising out of these Terms will not exceed the amounts you have paid us in the six (6) months prior to the claim (or, if none, a nominal amount such as $100).
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">11. Indemnification</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        You agree to indemnify, defend, and hold harmless the Company and its affiliates from any claims, damages, obligations, losses, liabilities, costs or debt arising from your use of the Service or breach of these Terms.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">12. Termination</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        We may suspend or terminate access to the Service at any time, with or without cause, and with or without notice. Upon termination, your right to use the Service will immediately cease. Sections that by their nature should survive termination (e.g., Intellectual Property, Limitation of Liability, Indemnification) will remain in effect.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">13. Changes to These Terms</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        We may modify these Terms from time to time. If changes are material, we will make reasonable efforts to notify Clients (for example via email or an in-app notice). Continued use of the Service after changes indicates acceptance of the new Terms.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">14. Governing Law</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        These Terms are governed by and construed in accordance with the laws of the jurisdiction where the Company is established, without regard to conflict of law principles. You and the Company submit to the exclusive jurisdiction of the courts located in that jurisdiction for any dispute arising out of these Terms.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">15. Contact</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        If you have questions about these Terms, please contact us at <a href="mailto:support@example.com" className="text-sky-600 underline">support@menu.techalb.al</a>.
                    </p>
                </section>

                <div className="mt-8 flex justify-end">
                    <a onClick={() => goBack()} className="inline-block rounded-full px-6 py-2 bg-slate-900 text-white text-sm font-medium shadow hover:opacity-95">Go back to the previous page</a>
                </div>
                <br />
            </main>

            <footer className="max-w-4xl mx-auto text-center text-xs text-slate-400 mt-6">© {new Date().getFullYear()} QR Scan Menu. All rights reserved.</footer>
        </div>
    );
}
