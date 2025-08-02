import { motion } from "motion/react";

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

export default function HeroSection() {
  return (
    <main className="relative overflow-hidden">
      <div
        className="container px-12 mx-auto flex flex-col-reverse md:flex-row justify-around items-center py-6 max-w-screen-xl"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-1 flex-col gap-y-6 py-12"
        >
          <motion.h1
            variants={itemVariants}
            className="text-center md:text-left text-2xl md:text-3xl"
          >
            Hi, my name is<br /><span className="font-bold">Navaneeth</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-center md:text-left"
          >
            I am a final year Computer Science undergrad student with more than 5 years of experience across Full Stack
            development, Cyber Security and DevOps.
          </motion.p>
          <motion.a
            variants={itemVariants}
            href="/contact"
            className="bg-primary text-white px-4 py-2 border border-black self-center md:self-start rounded hover:shadow-[5px_5px_0_rgba(0,0,0,1)] transition-shadow"
          >
            Connect with me
          </motion.a>
        </motion.div>
        <div className="flex-1 flex justify-center">
          <picture className="z-10">
            <source srcSet="/lock.webp" type="image/webp" />
            <img src="/lock.png" alt="3D Lock" className="max-h-96 w-[500px] animate-bounce-slow" />
          </picture>
        </div>
      </div>
      <div
        className="hidden md:block overflow-hidden bg-primary w-[55vw] h-[55vw] absolute -right-2 top-1/2 rotate-45 -translate-y-1/2 translate-x-1/2"
      >
      </div>
      <div
        className="bg-primary md:hidden absolute top-12 right-1/2 translate-x-1/2 translate-y-1/4 max-w-[9rem] max-h-[9rem] w-[38vw] h-[38vw] rotate-45"
      >
      </div>
    </main>
  );
}
