'use client'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 -mx-6 mb-8 flex items-center justify-between px-6 py-4">
      <div className="pointer-events-none absolute inset-0 bg-white/80 backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black_80%,transparent)] [mask-image:linear-gradient(to_bottom,black_80%,transparent)] dark:bg-[#111110]/80" />
      <div className="relative">
        <Link href="/" className="font-medium tracking-tight text-black dark:text-white">
          Jiajun (Nick) Huo
        </Link>
        <TextEffect
          as="p"
          preset="fade"
          per="word"
          className="text-zinc-600 dark:text-zinc-500"
          delay={0.3}
          speedReveal={2}
        >
          Builder, love making something wonderful
        </TextEffect>
      </div>
    </header>
  )
}
