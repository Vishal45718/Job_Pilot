import Image from "next/image";

export function Testimonial() {
  return (
    <section className="w-full py-24 px-6 flex flex-col items-center text-center border-t border-border bg-surface relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-3xl flex flex-col items-center">
        <span className="text-accent text-[12px] font-bold tracking-widest uppercase mb-8">SUCCESS STORIES</span>
        
        <blockquote className="text-2xl md:text-3xl text-text-primary font-medium leading-relaxed">
          "I used to spend my evenings copy-pasting resumes. Now I open my dashboard to see interviews waiting. It feels like cheating. Had 3 offers on the table simultaneously."
        </blockquote>
        
        <div className="mt-8 flex items-center gap-4">
          <Image 
            src="/images/user-icon.png" 
            alt="Tom Wilson" 
            width={48} 
            height={48} 
            className="rounded-full"
          />
          <div className="flex flex-col text-left">
            <span className="text-[14px] font-semibold text-text-primary">Tom Wilson</span>
            <span className="text-[12px] text-text-secondary">Junior Developer</span>
          </div>
        </div>
      </div>
    </section>
  );
}
