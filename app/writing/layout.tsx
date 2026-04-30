'use client'
import { motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import posthog from 'posthog-js'
import { ScrollProgress } from '@/components/ui/scroll-progress'

export default function LayoutBlogPost({
  children,
}: {
  children: React.ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()
  const pathname = usePathname()

  useEffect(() => {
    posthog.capture('writing_post_viewed', { path: pathname })
  }, [pathname])

  return (
    <>
      <div className="pointer-events-none fixed left-0 top-0 z-10 h-12 w-full bg-white to-transparent backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] dark:bg-[#111110]" />
      <ScrollProgress
        className="fixed top-0 z-20 h-0.5 bg-blue-400/70 dark:bg-blue-400/50"
        springOptions={{
          bounce: 0,
        }}
      />

      <motion.main
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="prose prose-gray mt-24 pb-20 prose-h4:prose-base dark:prose-invert prose-h1:text-xl prose-h1:font-medium prose-h2:mt-12 prose-h2:scroll-m-20 prose-h2:text-lg prose-h2:font-medium prose-h3:text-base prose-h3:font-medium prose-h4:font-medium prose-h5:text-base prose-h5:font-medium prose-h6:text-base prose-h6:font-medium prose-strong:font-medium text-[15px] leading-relaxed text-[#373632] dark:text-[#D8D8D6]"
      >
        {children}
      </motion.main>
    </>
  )
}
