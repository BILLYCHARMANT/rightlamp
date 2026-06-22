import { Suspense } from "react";

import { FeaturedProducts } from "@/components/store/FeaturedProducts";

import { ProductGridSkeleton } from "@/components/store/ProductGridSkeleton";

import { AboutSection } from "@/components/store/portfolio/AboutSection";

import { DifferentiatorsSection } from "@/components/store/portfolio/DifferentiatorsSection";

import { HeroSection } from "@/components/store/portfolio/HeroSection";

import { PartnersStrip } from "@/components/store/portfolio/PartnersStrip";

import { PortfolioGallery } from "@/components/store/portfolio/PortfolioGallery";

import { QuoteCTA } from "@/components/store/portfolio/QuoteCTA";

import { ServicesSection } from "@/components/store/portfolio/ServicesSection";
import { SectionBand } from "@/components/store/ui/SectionBand";



export default function StoreHomePage() {

  return (

    <>

      <HeroSection />

      <AboutSection />

      <ServicesSection />

      <PortfolioGallery />

      <DifferentiatorsSection />

      <Suspense fallback={<ShopSectionSkeleton />}>

        <FeaturedProducts />

      </Suspense>

      <PartnersStrip />

      <QuoteCTA />

    </>

  );

}



function ShopSectionSkeleton() {

  return (

    <SectionBand variant="white" className="py-16 sm:py-20">

      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="mb-8 h-10 w-56 animate-pulse rounded-xl bg-surface-muted" />

        <ProductGridSkeleton count={8} />

      </div>

    </SectionBand>

  );

}

