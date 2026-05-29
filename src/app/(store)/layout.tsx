import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreSiteHeader } from "@/components/store/StoreSiteHeader";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <StoreSiteHeader />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 sm:px-6 sm:py-7">
          {children}
        </div>
      </div>
      <StoreFooter />
    </div>
  );
}
