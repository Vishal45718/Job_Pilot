import Image from "next/image";

export function Features() {
  return (
    <section className="w-full max-w-[1440px] mx-auto py-24 px-6 flex flex-col gap-32">
      {/* Feature 1 */}
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1 flex flex-col gap-10">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
            Manage Your Job<br />Search With Ease
          </h2>
          
          <div className="flex flex-col gap-8">
            <div className="border-l-4 border-accent pl-6 flex flex-col gap-2">
              <h3 className="text-[16px] font-semibold text-text-primary">Find jobs that actually fit</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">Search by title and location or paste a job link. Get matched roles you can quickly scan.</p>
            </div>
            
            <div className="border-l-4 border-transparent pl-6 flex flex-col gap-2 opacity-60">
              <h3 className="text-[16px] font-semibold text-text-primary">Know the Company Before You Apply</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.</p>
            </div>
            
            <div className="border-l-4 border-transparent pl-6 flex flex-col gap-2 opacity-60">
              <h3 className="text-[16px] font-semibold text-text-primary">Keep track of every application</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-surface-muted rounded-2xl p-8 md:p-12 flex items-center justify-center">
          <Image 
            src="/images/jobs-lists.png" 
            alt="Jobs List" 
            width={800} 
            height={600} 
            className="w-full h-auto drop-shadow-sm rounded-xl"
          />
        </div>
      </div>

      {/* Feature 2 */}
      <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
        <div className="flex-1 flex flex-col gap-10">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
            Apply With More<br />Confidence, Every Time
          </h2>
          
          <div className="flex flex-col">
            <div className="flex flex-col gap-2 border-b border-border pb-8 mb-8">
              <h3 className="text-[16px] font-semibold text-text-primary">Understand your match score</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.</p>
            </div>
            
            <div className="flex flex-col gap-2 border-b border-border pb-8 mb-8">
              <h3 className="text-[16px] font-semibold text-text-primary">AI-Powered Job Matching</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-[16px] font-semibold text-text-primary">Focus on the right roles</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-surface-muted rounded-2xl p-8 md:p-12 flex items-center justify-center">
          <Image 
            src="/images/agnet-log.png" 
            alt="Agent Log" 
            width={800} 
            height={600} 
            className="w-full h-auto drop-shadow-sm rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
