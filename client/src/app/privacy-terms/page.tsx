// client/src/app/privacy-terms/page.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyTermsPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F6F4EF] text-[#16171A]">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 pt-28 pb-20 px-6 md:px-12 space-y-8">
        <h1 className="text-4xl font-black md:text-5xl">Privacy Notice &amp; Terms of Sale</h1>

        <section className="rounded-3xl bg-white p-6 md:p-8 space-y-3 text-sm leading-relaxed text-neutral-700">
          <h2 className="text-lg font-extrabold text-black">Privacy Notice (DPDP Act, 2023 Alignment)</h2>
          <p><strong>Data Collected:</strong> We collect only the personal data strictly required to fulfil your order and manage your account (name, email, mobile number, shipping address, and order records). We never store raw card numbers or CVVs.</p>
          <p><strong>Consent &amp; Marketing:</strong> Marketing newsletters are strictly opt-in and never bundled with checkout consent. You may request data access, correction, or account deletion anytime via our Grievance Officer at grievance@verdanthide.com.</p>
        </section>

        <section className="rounded-3xl bg-white p-6 md:p-8 space-y-3 text-sm leading-relaxed text-neutral-700">
          <h2 className="text-lg font-extrabold text-black">Terms of Use &amp; Material Disclosures</h2>
          <p>All prices displayed are in INR. Orders are subject to server-side inventory verification and payment confirmation. Material descriptions distinguish exterior bio-leather from backing, lining, and hardware in alignment with CCPA Greenwashing Guidelines, 2024.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}