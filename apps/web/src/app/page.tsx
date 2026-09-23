import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { ProductCapabilitiesSection } from '@/components/landing/ProductCapabilitiesSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';
import { AiHumanControlSection } from '@/components/landing/AiHumanControlSection';
import { OperationsLogisticsSection } from '@/components/landing/OperationsLogisticsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { FinalCtaSection } from '@/components/landing/FinalCtaSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#090D16', color: '#FFFFFF', overflowX: 'hidden' }}>
      <LandingHeader />
      <main style={{ width: '100%', margin: 0, padding: 0 }}>
        <HeroSection />
        <ProblemSolutionSection />
        <ProductCapabilitiesSection />
        <WorkflowSection />
        <AiHumanControlSection />
        <OperationsLogisticsSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
