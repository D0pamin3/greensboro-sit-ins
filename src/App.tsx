import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowDown, Info, Maximize2, Users, Calendar, History, Volume2, Pause, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioInstance = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = (audioFile: string) => {
    if (playingAudio === audioFile) {
      if (audioInstance.current) {
        audioInstance.current.pause();
        audioInstance.current = null;
      }
      setPlayingAudio(null);
    } else {
      // Clean up previous audio
      if (audioInstance.current) {
        audioInstance.current.pause();
        audioInstance.current = null;
      }
      
      const audio = new Audio(audioFile);
      audioInstance.current = audio;
      audio.play().catch(err => console.error("Audio play failed:", err));
      setPlayingAudio(audioFile);
      
      audio.onended = () => {
        audioInstance.current = null;
        setPlayingAudio(null);
      };
    }
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. GSAP 3D Room Transitions
    const rooms = gsap.utils.toArray<HTMLElement>('.exhibit-room');
    
    // Initial State
    rooms.forEach((room, i) => {
      if (i === 0) {
        gsap.set(room, { opacity: 1, z: 0, visibility: 'visible' });
      } else {
        gsap.set(room, { opacity: 0, z: -1000, visibility: 'hidden' });
      }
    });

    rooms.forEach((room, i) => {
      const isFirst = i === 0;
      const isLast = i === rooms.length - 1;
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: `${i * 1500}vh top`,
          end: `${(i + 1) * 1500}vh top`,
          scrub: 1,
          onToggle: (self) => {
            if (self.isActive) {
              const navElement = document.querySelector('.nav-current');
              if (navElement) {
                navElement.textContent = (room as HTMLElement).dataset.title || 'Exhibit';
              }
              // Bring active room to front
              gsap.set(room, { zIndex: 50 });
            } else {
              gsap.set(room, { zIndex: 1 });
            }
          }
        }
      });

      if (isFirst) {
        // Room 1 starts visible
        gsap.set(room, { opacity: 1, z: 0, visibility: 'visible', zIndex: 50 });
        tl.to(room as HTMLElement, { z: 200, duration: 0.8, ease: 'none' });
        tl.to(room as HTMLElement, { opacity: 0, z: 1200, duration: 0.2, ease: 'power2.in', visibility: 'hidden' });
      } else {
        // Entry phase
        tl.set(room as HTMLElement, { visibility: 'visible' });
        tl.fromTo(room as HTMLElement, 
          { opacity: 0, z: -1500 }, 
          { opacity: 1, z: 0, duration: 0.1, ease: 'power2.out' }
        );

        // Stay phase - maximum hold for reading
        tl.to(room as HTMLElement, { z: 20, duration: 0.85, ease: 'none' });

        // Exit phase
        if (!isLast) {
          tl.to(room as HTMLElement, { opacity: 0, z: 1500, duration: 0.05, ease: 'power2.in', visibility: 'hidden' });
        }
      }

      // Detail animations
      const details = (room as HTMLElement).querySelectorAll('.fade-up');
      if (details.length > 0) {
        if (isFirst) {
          tl.to(details, { opacity: 0, y: -60, duration: 0.4 }, 0.2);
        } else {
          tl.fromTo(details, 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.2 }, 
            0.1
          );
        }
      }
    });

    // 3. Parallax Mouse Effect & Spotlight
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      
      gsap.to(trackRef.current, {
        rotationY: x * 0.1,
        rotationX: -y * 0.1,
        duration: 2,
        ease: 'power2.out'
      });

      // Move spotlight
      gsap.to('.museum-spotlight', {
        left: e.clientX,
        top: e.clientY,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 4. Update Progress Bar
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        gsap.to('.progress-fill', { width: `${self.progress * 100}%`, duration: 0.1 });
      }
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="bg-white text-black min-h-[12000vh] font-sans overflow-x-hidden selection:bg-neutral-200 selection:text-black">
      {/* Perspective Viewport */}
      <main className="fixed inset-0 perspective-[1200px] overflow-hidden pointer-events-none md:pointer-events-auto z-10">
        <div ref={trackRef} className="h-full transform-style-3d will-change-transform">
          
          {/* SLIDE 1: LOBBY */}
          <section className="exhibit-room h-screen w-full flex items-center justify-center absolute inset-0 transform-style-3d bg-white overflow-hidden" data-title="Lobby">
            <div className="absolute inset-0 z-0">
              <img 
                src="./gboro2.jpg"
                className="w-full h-full object-cover opacity-35 grayscale contrast-125 scale-105" 
                alt="Greensboro Archive Background"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white" />
            </div>
            <div className="text-center max-w-4xl px-6 relative z-10">
              <h1 className="text-6xl md:text-9xl font-serif font-bold italic-serif-header mb-4 leading-tight tracking-tighter fade-up">
                Greensboro <br />
                <span className="text-black italic">Sit-Ins</span>
              </h1>
              <p className="text-lg md:text-xl uppercase tracking-[0.5em] opacity-60 mb-12 fade-up">
                Digital Museum
              </p>
              <div className="flex flex-col items-center gap-4 fade-up">
                <span className="text-xs uppercase tracking-widest opacity-40">Scroll to enter gallery</span>
                <div className="w-px h-16 bg-gradient-to-b from-black to-transparent" />
                <ArrowDown className="w-5 h-5 text-black animate-bounce" />
              </div>
            </div>
            <button 
              onClick={() => toggleAudio('./New Recording.m4a')}
              className="absolute top-8 right-8 z-[110] flex items-center gap-2 group pointer-events-auto fade-up"
              aria-label={playingAudio === 'New Recording.m4a' ? 'Pause narration' : 'Play narration'}
            >
              <div className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 ${playingAudio === 'New Recording.m4a' ? 'bg-black text-white animate-pulse' : 'group-hover:bg-black group-hover:text-white'}`}>
                {playingAudio === 'New Recording.m4a' ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {playingAudio === 'New Recording.m4a' ? 'Playing' : 'Narration'}
              </span>
            </button>
          </section>

          {/* SLIDE 2: HISTORICAL CONTEXT */}
          <section className="exhibit-room h-screen w-full flex items-center justify-center absolute inset-0 transform-style-3d bg-white" data-title="Context">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-32 max-w-7xl px-12 items-center">
              <div className="fade-up relative space-y-4">
                <div className="aspect-[4/5] bg-neutral-100 border border-black/5 relative overflow-hidden grayscale shadow-2xl">
                  <img 
                    src="./Emmet_till.jpg"
                    alt="The Chicago Defender"
                    className="w-full h-full object-cover brightness-110 contrast-125 transition-transform duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="aspect-[4/5] bg-neutral-100 border border-black/10 relative overflow-hidden grayscale shadow-2xl translate-x-12 -translate-y-8 z-10">
                  <img 
                    src="./jim-crow-must-go-350_orig.gif"
                    alt="Protest sign"
                    className="w-full h-full object-contain p-6"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="pt-2">
                  <p className="text-[10px] uppercase tracking-widest opacity-40 leading-tight">Media records and protest artifacts. 1955-1960.</p>
                </div>
              </div>
              <div className="space-y-8 fade-up text-black">
                <div className="flex items-center gap-3">
                  <History className="text-black w-6 h-6 border p-1 rounded-sm" />
                   <span className="text-xs uppercase tracking-widest font-bold">Historical Context</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-serif leading-tight text-black">A Nation Divided</h2>
                <div className="space-y-6">
                  <p className="text-lg text-black font-light leading-relaxed">
                    1960. Jim Crow laws enforced segregation. Statutes denied Black citizens rights. Discrimination existed in public spaces.
                  </p>
                  <p className="text-lg text-black font-light leading-relaxed">
                    The 1955 murder of 14-year-old Emmett Till ignited outrage. Mamie Till-Mobley held an open-casket funeral. This choice exposed racial violence. You see the spark for student activism.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs uppercase tracking-widest opacity-40">
                  <span>1955. 1960.</span>
                  <div className="w-8 h-px bg-black" />
                  <span>Era of Civil Unrest</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => toggleAudio('./New Recording 2.m4a')}
              className="absolute top-8 right-8 z-[110] flex items-center gap-2 group pointer-events-auto fade-up"
              aria-label={playingAudio === 'New Recording 2.m4a' ? 'Pause narration' : 'Play narration'}
            >
              <div className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 ${playingAudio === 'New Recording 2.m4a' ? 'bg-black text-white animate-pulse' : 'group-hover:bg-black group-hover:text-white'}`}>
                {playingAudio === 'New Recording 2.m4a' ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {playingAudio === 'New Recording 2.m4a' ? 'Playing' : 'Narration'}
              </span>
            </button>
          </section>

          {/* SLIDE 3: THE MOMENT */}
          <section className="exhibit-room h-screen w-full flex items-center justify-center absolute inset-0 transform-style-3d bg-white" data-title="The Moment">
            <div className="relative w-full max-w-6xl px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 fade-up text-black">
                <div className="inline-flex items-center gap-2 px-4 py-1 border border-black/10 bg-black/5 text-black text-[10px] uppercase font-bold tracking-widest mb-1">
                  <Maximize2 className="w-3 h-3" /> Inciting Incident
                </div>
                <h2 className="text-5xl font-serif italic text-black">Resistance Takes Root</h2>
                <p className="text-black font-light leading-relaxed text-lg">
                  February 1, 1960. Four students from North Carolina A&T entered Woolworth's. They purchased school supplies. They sat at the white-only lunch counter.
                </p>
                <p className="text-black font-light leading-relaxed">
                  Staff refused service. The students stayed. Silence challenged a segregated system. They returned the next day with more supporters. Your actions create history.
                </p>
              </div>
              <div className="fade-up">
                <div className="aspect-[16/10] bg-neutral-100 border border-black/10 p-4 flex items-center justify-center shadow-2xl relative overflow-hidden">
                  <img 
                    src="./131_gbo_sitin_jpg.jpg"
                    alt="Greensboro Sit-in Archive"
                    className="w-full h-full object-contain grayscale scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/5 mix-blend-overlay pointer-events-none" />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.3em] opacity-40 text-center">Archive: Protest, February 1960.</p>
              </div>
            </div>
            <button 
              onClick={() => toggleAudio('./New Recording 3.m4a')}
              className="absolute top-8 right-8 z-[110] flex items-center gap-2 group pointer-events-auto fade-up"
              aria-label={playingAudio === 'New Recording 3.m4a' ? 'Pause narration' : 'Play narration'}
            >
              <div className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 ${playingAudio === 'New Recording 3.m4a' ? 'bg-black text-white animate-pulse' : 'group-hover:bg-black group-hover:text-white'}`}>
                {playingAudio === 'New Recording 3.m4a' ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {playingAudio === 'New Recording 3.m4a' ? 'Playing' : 'Narration'}
              </span>
            </button>
          </section>

          {/* SLIDE 4: INDIVIDUAL IMPACT */}
          <section className="exhibit-room h-screen w-full flex items-center justify-center absolute inset-0 transform-style-3d bg-white" data-title="Profiles">
            <div className="w-full max-w-7xl px-12 text-black">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="fade-up space-y-8">
                  <h2 className="text-5xl font-serif text-black mb-4 italic">Apostles of Change</h2>
                  <p className="text-black text-xl font-light leading-relaxed">
                    Ezell Blair Jr. David Richmond. Franklin McCain. Joseph McNeil. These students led a new era.
                  </p>
                  <p className="text-black font-light leading-relaxed opacity-80">
                    They studied non-violence. They faced hostility with poise. Poise proved youth leads change. Direct action forced social shifts. You witness their courage.
                  </p>
                  <div className="pt-8 border-t border-black/10 flex justify-between items-end">
                    <div>
                      <h4 className="text-xl font-serif font-bold text-black italic">Greensboro Four</h4>
                      <p className="text-[10px] uppercase opacity-40 mt-1 tracking-widest">McNeil, Blair Jr., McCain, Richmond</p>
                    </div>
                  </div>
                </div>
                <div className="fade-up px-8">
                  <div className="aspect-[4/5] bg-neutral-100 border border-black/5 relative overflow-hidden flex items-center justify-center p-4 shadow-2xl skew-y-1">
                    <img 
                      src="./the-greensboro-four-walking-540.jpg"
                      alt="The Greensboro Four walking to Woolworth"
                      className="w-full h-full object-contain grayscale"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => toggleAudio('./New Recording 4.m4a')}
              className="absolute top-8 right-8 z-[110] flex items-center gap-2 group pointer-events-auto fade-up"
              aria-label={playingAudio === 'New Recording 4.m4a' ? 'Pause narration' : 'Play narration'}
            >
              <div className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 ${playingAudio === 'New Recording 4.m4a' ? 'bg-black text-white animate-pulse' : 'group-hover:bg-black group-hover:text-white'}`}>
                {playingAudio === 'New Recording 4.m4a' ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {playingAudio === 'New Recording 4.m4a' ? 'Playing' : 'Narration'}
              </span>
            </button>
          </section>

          {/* SLIDE 5: COLLECTIVE ACTION */}
          <section className="exhibit-room h-screen w-full flex items-center justify-center absolute inset-0 transform-style-3d bg-white" data-title="Collective">
            <div className="max-w-6xl px-12 text-black grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
              <div className="space-y-8 fade-up">
                <div className="flex items-center gap-4">
                  <Users className="w-8 h-8 text-black" />
                  <h2 className="text-5xl md:text-6xl font-serif italic text-black">United Action</h2>
                </div>
                <p className="text-lg text-black font-light leading-relaxed">
                  Organization grew. Students formed the Student Executive Committee for Justice. Bennett College women joined. Picket lines surrounded the store. Four students became thousands. Protests spread to 55 cities. You use economic pressure to win. Participants maintained discipline during assaults.
                </p>
              </div>
              <div className="space-y-8 fade-up">
                <div className="aspect-video bg-neutral-100 border border-black/10 p-2 relative overflow-hidden shadow-xl grayscale">
                  <img 
                    src="./8522_a5f0b33ed703d9f-1980x1294.jpg"
                    alt="Collective Action and Protests"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="text-xs uppercase font-bold tracking-[0.2em] mb-4">Methods</h4>
                <div className="space-y-10">
                   <div className="flex gap-6">
                     <span className="text-3xl font-serif opacity-30">01</span>
                     <div>
                       <span className="font-bold block text-sm uppercase mb-1">Campus Integration</span>
                       <p className="text-xs opacity-60 font-light">Coordination between student bodies.</p>
                     </div>
                   </div>
                   <div className="flex gap-6">
                     <span className="text-3xl font-serif opacity-30">02</span>
                     <div>
                       <span className="font-bold block text-sm uppercase mb-1">Economic Leverage</span>
                       <p className="text-xs opacity-60 font-light">Boycotts reduced store revenue.</p>
                     </div>
                   </div>
                   <div className="flex gap-6">
                     <span className="text-3xl font-serif opacity-30">03</span>
                     <div>
                       <span className="font-bold block text-sm uppercase mb-1">Training</span>
                       <p className="text-xs opacity-60 font-light">Adherence to peaceful resistance.</p>
                     </div>
                   </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => toggleAudio('./New Recording 5.m4a')}
              className="absolute top-8 right-8 z-[110] flex items-center gap-2 group pointer-events-auto fade-up"
              aria-label={playingAudio === 'New Recording 5.m4a' ? 'Pause narration' : 'Play narration'}
            >
              <div className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 ${playingAudio === 'New Recording 5.m4a' ? 'bg-black text-white animate-pulse' : 'group-hover:bg-black group-hover:text-white'}`}>
                {playingAudio === 'New Recording 5.m4a' ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {playingAudio === 'New Recording 5.m4a' ? 'Playing' : 'Narration'}
              </span>
            </button>
          </section>

          {/* SLIDE 6: IMPACT & LEGACY */}
          <section className="exhibit-room h-screen w-full flex items-center justify-center absolute inset-0 transform-style-3d bg-white" data-title="Impact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 max-w-6xl px-12 items-center text-black">
              <div className="space-y-8 fade-up">
                <h2 className="text-6xl font-serif leading-tight text-black">Victory & <br /><span>Legacy</span></h2>
                <div className="p-6 border-l border-black bg-black/5">
                  <p className="text-lg leading-relaxed text-black italic">Woolworth's desegregated the counters on July 25, 1960. Black employees ate lunch at the workplace.</p>
                </div>
                <p className="text-black font-light leading-relaxed">
                  Victory inspired the formation of the Student Nonviolent Coordinating Committee. Protests triggered the Civil Rights Act of 1964. Non-violent resistance works. You see the results in this museum.
                </p>
              </div>
              <div className="relative fade-up h-[400px] bg-neutral-100 border border-black/10 flex flex-col items-center justify-center text-center p-2 overflow-hidden grayscale">
                   <img 
                     src="./sit-in-e1570204225795-1280x640-1.jpg"
                     alt="Woolworth Lunch Counter desegregation"
                     className="w-full h-full object-contain"
                     referrerPolicy="no-referrer"
                   />
                   <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 border border-black/10 text-[8px] uppercase tracking-widest font-bold">Historical Record</div>
              </div>
            </div>
            <button 
              onClick={() => toggleAudio('./New Recording 6.m4a')}
              className="absolute top-8 right-8 z-[110] flex items-center gap-2 group pointer-events-auto fade-up"
              aria-label={playingAudio === 'New Recording 6.m4a' ? 'Pause narration' : 'Play narration'}
            >
              <div className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 ${playingAudio === 'New Recording 6.m4a' ? 'bg-black text-white animate-pulse' : 'group-hover:bg-black group-hover:text-white'}`}>
                {playingAudio === 'New Recording 6.m4a' ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {playingAudio === 'New Recording 6.m4a' ? 'Playing' : 'Narration'}
              </span>
            </button>
          </section>

          {/* SLIDE 7: REFLECTION */}
          <section className="exhibit-room h-screen w-full flex items-center justify-center absolute inset-0 transform-style-3d bg-white" data-title="Reflection">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl px-12 items-center text-black">
              <div className="text-center md:text-left fade-up">
                <h2 className="text-6xl md:text-8xl font-serif italic mb-8 text-black">Legacy</h2>
                <p className="text-xl md:text-2xl font-light leading-relaxed opacity-70 mb-8 text-black">
                  History lives in your voice.
                </p>
                <p className="text-lg font-light leading-relaxed opacity-60 text-black">
                  The Greensboro Four started a movement. They sat down when ordered to stand. This bravery demanded equality. Your actions matter.
                </p>
              </div>
              <div className="fade-up">
                 <div className="aspect-[3/4] bg-neutral-100 border border-black/10 p-6 relative overflow-hidden grayscale shadow-2xl">
                    <img 
                      src="./p2_12_4-rl.jpg"
                      alt="The Greensboro Four Statue at NC A&T"
                      className="w-full h-full object-contain scale-110"
                      referrerPolicy="no-referrer"
                    />
                 </div>
                 <p className="mt-6 text-[10px] uppercase tracking-[0.3em] opacity-40 text-center">Monument at NC A&T.</p>
              </div>
            </div>
            <button 
              onClick={() => toggleAudio('./25E084FA-FBEF-443C-825B-5A00479E730C.m4a')}
              className="absolute top-8 right-8 z-[110] flex items-center gap-2 group pointer-events-auto fade-up"
              aria-label={playingAudio === '25E084FA-FBEF-443C-825B-5A00479E730C.m4a' ? 'Pause narration' : 'Play narration'}
            >
              <div className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center transition-all duration-300 ${playingAudio === '25E084FA-FBEF-443C-825B-5A00479E730C.m4a' ? 'bg-black text-white animate-pulse' : 'group-hover:bg-black group-hover:text-white'}`}>
                {playingAudio === '25E084FA-FBEF-443C-825B-5A00479E730C.m4a' ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {playingAudio === '25E084FA-FBEF-443C-825B-5A00479E730C.m4a' ? 'Playing' : 'Narration'}
              </span>
            </button>
          </section>

          {/* SLIDE 8: CITATIONS */}
          <section className="exhibit-room h-screen w-full flex items-center justify-center absolute inset-0 transform-style-3d bg-white" data-title="Citations">
            <div className="max-w-4xl px-12 text-black">
              <h2 className="text-4xl font-serif italic mb-8 fade-up">Works Cited</h2>
              <div className="space-y-4 text-[11px] font-serif fade-up opacity-80 leading-relaxed max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                <p className="pl-8 -indent-8">
                  "Greensboro Sit-in." History.com, A&E Television Networks, 1 Feb. 2010, www.history.com/topics/black-history/the-greensboro-sit-in
                </p>
                <p className="pl-8 -indent-8">
                  International Civil Rights Center & Museum. Greensboro, NC, 2024, www.sitinmovement.org
                </p>
                <p className="pl-8 -indent-8">
                  "Greensboro Lunch Counter." National Museum of American History, Smithsonian Institution, americanhistory.si.edu/explore/exhibitions/greensboro-lunch-counter
                </p>
                <p className="pl-8 -indent-8">
                  McEvoy, Colin. “How the Greensboro Four Sat down and Changed the World.” Biography, 5 Sept. 2025, www.biography.com/activists/a65996650/civil-rights-greensboro-four-history
‌                </p>
                <p className="pl-8 -indent-8">
                   Wolff, Miles. Lunch at the 5 & 10. Ivan R. Dee, 1970.
                </p>
                <p className="pl-8 -indent-8 pt-4 border-t border-black/5">
                  Visual Assets
                </p>
                <p className="pl-8 -indent-8">
                  "Jim Crow Must Go Protest." Historical Archive, 2024.
                </p>
                <p className="pl-8 -indent-8">
                  "The Chicago Defender Headlines." Library of Congress, 1955.
                </p>
                <p className="pl-8 -indent-8">
                  "Lunch Counter Interior." Unsplash, 2024, unsplash.com/photos/1555396273-367ea4eb4db5.
                </p>
                <p className="pl-8 -indent-8">
                  "Memorial Monument Statue." Unsplash, 2024, unsplash.com/photos/1518709268805-4e9042af9f23.
                </p>
              </div>
              <div className="mt-12 fade-up">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-8 py-3 border border-black/20 hover:border-black hover:bg-black/5 transition-all text-[10px] uppercase tracking-[0.3em] text-black pointer-events-auto"
                >
                  Return to Lobby
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Atmospheric UI */}
      <nav className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center pointer-events-none">
        <span className="nav-current text-[10px] md:text-xs uppercase tracking-[0.5em] text-black font-bold mb-4 drop-shadow-xl transition-all duration-300">Lobby</span>
        <div className="w-32 md:w-64 h-[1px] bg-black/10 relative overflow-hidden backdrop-blur-sm">
          <div className="progress-fill absolute top-0 left-0 h-full bg-black w-0 transition-all" />
        </div>
      </nav>

      <div className="fixed inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_50%_0%,transparent_0%,rgba(0,0,0,0.02)_100%)]" />
      <div className="museum-spotlight fixed w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-[2] opacity-20 blur-[150px] bg-black/5" />
      <div className="fixed inset-0 pointer-events-none z-[3] mix-blend-multiply opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="fixed inset-0 pointer-events-none z-[4] opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 60%, white 100%)' }} />
    </div>
  );
}
