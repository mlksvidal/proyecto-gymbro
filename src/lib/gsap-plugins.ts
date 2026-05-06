// ============================================================
// GSAP Plugin Registration — import once in main.tsx
// SplitText + ScrambleTextPlugin are free in GSAP 3.12+
// ============================================================

import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(SplitText, ScrambleTextPlugin)

export { gsap, SplitText, ScrambleTextPlugin }
