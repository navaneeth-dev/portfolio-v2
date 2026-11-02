import { motion } from "motion/react";
import { BookOpen, PenLine } from "lucide-react";
import HeroLock from "./HeroLock";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

// A fixed 24×14 field of squares, scattered by a hash so it renders the same on
// server and client. Some stay put, some pop in light or dark gray, and some
// flash red; the CSS animations stay still for reduced-motion users.
const hash = (i: number, seed: number) =>
  Math.imul(i + seed, 0x9e3779b1) >>> 16;
const pixels = Array.from({ length: 24 * 14 }, (_, i) => ({
  x: i % 24,
  y: Math.floor(i / 24),
  n: hash(i, 1) % 17,
  i,
}))
  .filter(({ n }) => n < 11)
  .map(({ x, y, n, i }) => ({
    x,
    y,
    delay: `${hash(i, 7) % 3000}ms`,
    className:
      n === 0 && i % 3 === 0
        ? "fill-primary"
        : n < 3
          ? "fill-neutral-200 motion-safe:animate-pixel-flash"
          : n < 6
            ? "fill-neutral-200"
            : n < 8
              ? "fill-neutral-600 opacity-0 motion-safe:animate-pixel-pop"
              : "fill-neutral-400 opacity-0 motion-safe:animate-pixel-pop",
  }));

export default function HeroSection() {
  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="hidden md:block absolute right-0 top-1/2 w-[40vw] h-[40vw] translate-x-1/2 lg:left-[calc(min(100%,50%+40rem)+2.78rem)] lg:right-auto lg:translate-x-0 lg:w-[40rem] lg:h-[40rem] -translate-y-1/2 rotate-45 bg-primary"
      />
      {/* From lg up the diamond is anchored to the content column: its left point sits 5.5rem
          inside the column's right edge, just past the tags. A filler from its centre to the window
          edge keeps it solid on screens wider than the diamond. */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute inset-y-0 right-0 left-[calc(min(100%,50%+40rem)+22.78rem)] bg-primary"
      />
      <div className="relative container px-6 md:px-12 mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-12 py-6 md:py-12 max-w-screen-xl">
        <div className="relative flex flex-1 justify-center w-full min-w-0">
          <svg
            viewBox="0 0 24 14"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 h-full aspect-square [mask-image:radial-gradient(closest-side,#000_35%,transparent)] md:-inset-y-8 md:-left-12 md:-right-6 md:translate-x-0 md:h-auto md:aspect-auto md:[mask-image:radial-gradient(closest-side,#000_45%,transparent)] xl:-left-40 2xl:-left-80 xl:[mask-image:radial-gradient(closest-side,#000_55%,transparent)]"
          >
            {pixels.map(({ x, y, delay, className }) => (
              <rect
                key={`${x}-${y}`}
                x={x + 0.2}
                y={y + 0.2}
                width="0.6"
                height="0.6"
                style={{ animationDelay: delay }}
                className={className}
              />
            ))}
          </svg>
          <HeroLock />
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-1 flex-col items-center md:items-start gap-y-5 text-center md:text-left"
        >
          <motion.h1
            variants={itemVariants}
            className="text-2xl md:text-3xl lg:text-4xl font-bold"
          >
            I build self-hosted,
            <br />
            highly available infrastructure.
          </motion.h1>
          <motion.ul
            variants={itemVariants}
            className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 text-sm text-neutral-700"
          >
            {[
              "Platform Engineering",
              "DevOps",
              "Cybersecurity",
              "System Design",
            ].map((skill) => (
              <li
                key={skill}
                className="bg-white border border-neutral-300 rounded px-2 py-0.5"
              >
                {skill}
              </li>
            ))}
          </motion.ul>
          <motion.p
            variants={itemVariants}
            className="text-sm text-neutral-700"
          >
            Hi! I’m Navaneeth. Platform Engineer 2
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3"
          >
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 md:gap-2 bg-primary text-white px-3 md:px-4 py-2 border border-black rounded hover:shadow-[5px_5px_0_rgba(0,0,0,1)] transition-shadow"
            >
              <PenLine className="size-4" aria-hidden="true" />
              Connect with me
            </a>
            <a
              href="/blog"
              className="inline-flex items-center gap-1.5 md:gap-2 bg-white text-black px-3 md:px-4 py-2 border border-black rounded hover:shadow-[5px_5px_0_rgba(0,0,0,1)] transition-shadow"
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Read my work
            </a>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
