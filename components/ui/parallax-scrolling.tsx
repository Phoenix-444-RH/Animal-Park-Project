'use client';

import React, { useEffect, useRef } from 'react';
import { PawPrint } from 'lucide-react';

const layers = [
  {
    layer: '1',
    yPercent: 70,
    src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    alt: 'A cheerful golden dog outdoors',
  },
  {
    layer: '2',
    yPercent: 55,
    src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
    alt: 'A curious cat looking toward the camera',
  },
  {
    layer: '4',
    yPercent: 10,
    src: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=80',
    alt: 'A dog and cat resting together',
  },
];

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lenis: { on: (event: string, callback: () => void) => void; raf: (time: number) => void; destroy: () => void } | null = null;
    let gsapModule: any = null;
    let scrollTriggerModule: any = null;
    let triggerElement: Element | undefined;
    let tick: ((time: number) => void) | null = null;
    let isMounted = true;

    const setup = async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('@studio-freight/lenis'),
      ]);

      if (!isMounted) return;

      gsapModule = gsap;
      scrollTriggerModule = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]') ?? undefined;

      if (triggerElement) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerElement,
            start: '0% 0%',
            end: '100% 0%',
            scrub: 0,
          },
        });

        [
          { layer: '1', yPercent: 70 },
          { layer: '2', yPercent: 55 },
          { layer: '3', yPercent: 40 },
          { layer: '4', yPercent: 10 },
        ].forEach((layerObj, idx) => {
          tl.to(
            triggerElement?.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
            {
              yPercent: layerObj.yPercent,
              ease: 'none',
            },
            idx === 0 ? undefined : '<',
          );
        });
      }

      lenis = new Lenis({
        smoothWheel: true,
      });

      lenis.on('scroll', ScrollTrigger.update);
      tick = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };

    setup();

    return () => {
      isMounted = false;
      if (scrollTriggerModule) {
        scrollTriggerModule.getAll().forEach((st: any) => st.kill());
      }
      if (gsapModule && triggerElement) {
        gsapModule.killTweensOf(triggerElement.querySelectorAll('[data-parallax-layer]'));
      }
      if (gsapModule && tick) {
        gsapModule.ticker.remove(tick);
      }
      lenis?.destroy();
    };
  }, []);

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header">
        <div className="parallax__visuals">
          <div className="parallax__black-line-overflow" />
          <div data-parallax-layers className="parallax__layers">
            <img
              src={layers[0].src}
              loading="eager"
              data-parallax-layer="1"
              alt={layers[0].alt}
              className="parallax__layer-img"
            />
            <img
              src={layers[1].src}
              loading="eager"
              data-parallax-layer="2"
              alt={layers[1].alt}
              className="parallax__layer-img"
            />
            <div data-parallax-layer="3" className="parallax__layer-title">
              <div className="parallax__title-badge">
                <PawPrint size={18} />
                Animal Park
              </div>
              <h2 className="parallax__title">Parallax Pets</h2>
              <p className="parallax__subtitle">Scroll through a layered dog-and-cat showcase built for the homepage.</p>
            </div>
            <img
              src={layers[2].src}
              loading="eager"
              data-parallax-layer="4"
              alt={layers[2].alt}
              className="parallax__layer-img"
            />
          </div>
          <div className="parallax__fade" />
        </div>
      </section>
      <section className="parallax__content">
        <div className="parallax__content-icon">
          <PawPrint size={64} strokeWidth={1.5} />
        </div>
      </section>
    </div>
  );
}
