import { About } from '@/components/About';
import { Certificates } from '@/components/Certificates';
import { Contact } from '@/components/Contact';
import { Faq } from '@/components/Faq';
import { FreeConsultation } from '@/components/FreeConsultation';
import { Hero } from '@/components/Hero';
import { JsonLd } from '@/components/JsonLd';
import { Pricing } from '@/components/Pricing';
import { Privacy } from '@/components/Privacy';
import { Reviews } from '@/components/Reviews';
import { Services } from '@/components/Services';
import { Topics } from '@/components/Topics';
import { buildJsonLd } from '@/lib/jsonLd';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Certificates />
      <Topics />
      <FreeConsultation />
      <Pricing />
      <Contact />
      <Reviews />
      <Faq />
      <Privacy />
      <JsonLd data={buildJsonLd()} />
    </>
  );
}
