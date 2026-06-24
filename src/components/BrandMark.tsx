import Image from "next/image";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-brass bg-cream shadow-soft">
        <Image
          alt="Nancy's Castalla logo"
          className="object-cover"
          fill
          priority
          sizes="56px"
          src="/nancys-castalla-logo.jpg"
        />
      </div>
      <div className="leading-tight">
        <div className="font-serif text-xl font-bold tracking-wide text-forest">NANCY'S</div>
        <div className="text-xs font-bold uppercase tracking-[0.28em] text-coffee">Castalla</div>
      </div>
    </div>
  );
}
