// ============================================================
// GYMBRO — LevelUpModal (T31)
// Full-screen overlay with GSAP timeline + confetti
// ============================================================

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import confetti from 'canvas-confetti'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { TierInfo } from '@/lib/tiers'

interface LevelUpModalProps {
  open: boolean
  tier: TierInfo
  xpEarned?: number
  onClose: () => void
}

export function LevelUpModal({ open, tier, xpEarned = 0, onClose }: LevelUpModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLDivElement>(null)

  // Prefers reduced motion
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    if (!open) return

    if (prefersReduced) {
      // Simple fade in for reduced motion
      return
    }

    // Screen flash
    const flash = document.createElement('div')
    flash.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: white; pointer-events: none;
      opacity: 0;
    `
    document.body.appendChild(flash)

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.removeChild(flash)
      },
    })

    // 1. Screen flash 100ms
    tl.to(flash, { opacity: 0.9, duration: 0.05 })
      .to(flash, { opacity: 0, duration: 0.15 })

    // 2. Animate title zoom + bounce
    if (titleRef.current) {
      tl.fromTo(
        titleRef.current,
        { scale: 0.5, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' },
        '-=0.1'
      )
    }

    // 3. Subtitle fade in
    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.3'
      )
    }

    // 4. Confetti rain at 0.5s mark
    tl.call(() => {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.4 },
        colors: [tier.color, '#ABFF35', '#D8FF3D', '#F5DD00', '#FFFFFF'],
        ticks: 300,
        gravity: 0.8,
        scalar: 1.1,
      })
    })

    // 5. XP counter fade in
    if (xpRef.current) {
      tl.fromTo(
        xpRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
        '+=0.2'
      )
    }

    // 6. Button fade in
    if (btnRef.current) {
      tl.fromTo(
        btnRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        '+=0.1'
      )
    }

    // Auto-dismiss after 5s
    const autoDismiss = setTimeout(onClose, 5000)
    return () => {
      tl.kill()
      clearTimeout(autoDismiss)
      if (document.body.contains(flash)) {
        document.body.removeChild(flash)
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="levelup-overlay"
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{
            zIndex: 'var(--z-top)',
            background: 'rgba(0,0,0,0.95)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Subiste al BRO TIER ${tier.level}: ${tier.name}`}
        >
          {/* Glow orb */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-36 h-36 rounded-full mb-8 flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${tier.color}40 0%, ${tier.color}08 70%)`,
              boxShadow: `0 0 60px ${tier.color}50, 0 0 120px ${tier.color}20`,
            }}
          >
            <Trophy size={56} style={{ color: tier.color }} aria-hidden="true" />
          </motion.div>

          {/* "SUBISTE AL" label */}
          <p
            className="text-[13px] font-[var(--font-body)] uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            SUBISTE AL
          </p>

          {/* BRO TIER X */}
          <h1
            ref={titleRef}
            className="text-[56px] md:text-[72px] font-[var(--font-display)] font-bold uppercase leading-none mb-2"
            style={{
              color: tier.color,
              textShadow: `0 0 30px ${tier.color}80`,
              opacity: prefersReduced ? 1 : 0,
            }}
          >
            BRO TIER {tier.level}
          </h1>

          {/* Tier name */}
          <p
            ref={subtitleRef}
            className="text-[28px] font-[var(--font-display)] font-bold uppercase tracking-widest mb-6"
            style={{
              color: 'var(--color-text)',
              opacity: prefersReduced ? 1 : 0,
            }}
          >
            {tier.name}
          </p>

          {/* XP earned */}
          {xpEarned > 0 && (
            <div
              ref={xpRef}
              className="flex items-baseline gap-1 mb-8 px-5 py-2 rounded-full"
              style={{
                background: 'rgba(171,255,53,0.12)',
                border: '1px solid rgba(171,255,53,0.3)',
                opacity: prefersReduced ? 1 : 0,
              }}
            >
              <span
                className="text-[20px] font-[var(--font-display)] font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                +{xpEarned} XP
              </span>
            </div>
          )}

          {/* DALE button */}
          <div
            ref={btnRef}
            style={{ opacity: prefersReduced ? 1 : 0 }}
          >
            <Button variant="primary" size="xl" onClick={onClose}>
              ¡DALE!
            </Button>
          </div>

          {/* Tap hint */}
          <p
            className="text-[12px] font-[var(--font-body)] mt-4"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            Se cierra automáticamente en 5 segundos
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
