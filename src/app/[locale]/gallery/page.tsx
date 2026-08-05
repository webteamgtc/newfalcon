import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryAmbitionSection from "@/components/gallery/GalleryAmbitionSection";
import GalleryRecognitionSection from "@/components/gallery/GalleryRecognitionSection";
import GalleryJourneySection from "@/components/gallery/GalleryJourneySection";
import GalleryMomentsSection from "@/components/gallery/GalleryMomentsSection";

export default function GalleryPage() {
  return (
    <>
      <GalleryHero />
      <GalleryAmbitionSection />
      <GalleryRecognitionSection />
      <GalleryJourneySection />
      <GalleryMomentsSection />
    </>
  );
}
