'use client'
import { XIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import posthog from 'posthog-js'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { Magnetic } from '@/components/ui/magnetic'
import { Spotlight } from '@/components/ui/spotlight'
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogContainer,
} from '@/components/ui/morphing-dialog'
import Balancer from 'react-wrap-balancer'
import { PROJECTS, BLOG_POSTS, SOCIAL_LINKS } from './data'
import { WEBSITE_URL } from '@/lib/constants'

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = {
  duration: 0.3,
}

const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Jiajun (Nick) Huo',
  url: WEBSITE_URL,
  jobTitle: 'Software Engineer',
  sameAs: [
    'https://github.com/nickhuo',
    'https://www.linkedin.com/in/nickhuo',
    'https://twitter.com/imnickhuo',
  ],
}

function ProjectVideo({ src, name }: { src: string; name: string }) {
  return (
    <MorphingDialog
      transition={{
        type: 'spring',
        bounce: 0,
        duration: 0.3,
      }}
    >
      <div
        onClick={() =>
          posthog.capture('project_video_expanded', { project_name: name })
        }
      >
        <MorphingDialogTrigger>
          <video
            src={src}
            autoPlay
            loop
            muted
            className="aspect-video w-full cursor-zoom-in rounded-xl"
          />
        </MorphingDialogTrigger>
      </div>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative aspect-video rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950 dark:ring-zinc-800/50">
          <video
            src={src}
            autoPlay
            loop
            muted
            className="aspect-video h-[50vh] w-full rounded-xl md:h-[70vh]"
          />
        </MorphingDialogContent>
        <MorphingDialogClose
          className="fixed top-6 right-6 h-fit w-fit rounded-full bg-white p-1"
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { delay: 0.3, duration: 0.1 },
            },
            exit: { opacity: 0, transition: { duration: 0 } },
          }}
        >
          <XIcon className="h-5 w-5 text-zinc-500" />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}

function MagneticSocialLink({
  children,
  link,
  label,
}: {
  children: React.ReactNode
  link: string
  label: string
}) {
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        rel="noopener noreferrer"
        onClick={() =>
          posthog.capture('social_link_clicked', { label, url: link })
        }
        className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2.5 py-1 text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
        >
          <title>External link icon</title>
          <path
            d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      </a>
    </Magnetic>
  )
}

export default function Personal() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_SCHEMA) }}
      />
      <h1 className="sr-only">
        Jiajun (Nick) Huo — Software Engineer & Builder
      </h1>
      <motion.main
        className="space-y-24"
        variants={VARIANTS_CONTAINER}
        initial={prefersReducedMotion ? 'visible' : 'hidden'}
        animate="visible"
      >
        <motion.section
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2 className="mb-2 text-lg font-medium tracking-tight">
            Dots Connected
          </h2>
          <div className="flex-1">
            <p className="text-zinc-600 dark:text-zinc-400">
              I&apos;m studying at UIUC and working on AI agents and data
              systems, trying to make software that feels calm, useful and a
              little smarter than it looks. Right now I am doing research at
              the Beckman Institute on multi-agent systems for personalized
              learning and helping build an AI copilot for aircraft.
              Before this I worked on data infra at Sonic SVM on Solana, and 
              earlier on ads and growth at Tencent and
              Baidu. I like problems where have to talk to users,
              understand constraints and iterate, and I believe good products
              come from a long series of small, correct decisions rather than
              big genius ideas.
            </p>
          </div>
        </motion.section>

        <motion.section
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2 className="mb-5 text-lg font-medium tracking-tight">Projects</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PROJECTS.map((project) => (
              <div key={project.name} className="space-y-2">
                <div className="relative overflow-hidden rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
                  <Spotlight
                    className="from-zinc-200/50 via-zinc-300/30 to-transparent dark:from-zinc-600/40 dark:via-zinc-700/20"
                    size={300}
                  />
                  <ProjectVideo src={project.video} name={project.name} />
                </div>
                <div className="px-1">
                  <a
                    className="font-base group relative inline-block font-[450] text-zinc-900 dark:text-zinc-50"
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      posthog.capture('project_link_clicked', {
                        project_name: project.name,
                        url: project.link,
                      })
                    }
                  >
                    {project.name}
                    <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 transition-all duration-200 group-hover:max-w-full"></span>
                  </a>
                  <p className="text-base text-zinc-600 dark:text-zinc-400">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2 className="mb-3 text-lg font-medium tracking-tight">Writing</h2>
          <div className="flex flex-col space-y-0">
            <AnimatedBackground
              enableHover
              className="h-full w-full rounded-lg bg-zinc-100 dark:bg-zinc-900/80"
              transition={{
                type: 'spring',
                bounce: 0,
                duration: 0.2,
              }}
            >
              {BLOG_POSTS.map((post) => (
                <Link
                  key={post.uid}
                  className="-mx-3 rounded-xl px-3 py-3"
                  href={post.link}
                  data-id={post.uid}
                  onClick={() =>
                    posthog.capture('blog_post_clicked', {
                      title: post.title,
                      uid: post.uid,
                      url: post.link,
                    })
                  }
                >
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-normal dark:text-zinc-100">
                      <Balancer>{post.title}</Balancer>
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      <Balancer>{post.description}</Balancer>
                    </p>
                    <span className="text-xs text-zinc-400 tabular-nums dark:text-zinc-500">
                      {post.date}
                    </span>
                  </div>
                </Link>
              ))}
            </AnimatedBackground>
          </div>
        </motion.section>

        <motion.section
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2 className="mb-5 text-lg font-medium tracking-tight">Connect</h2>

          <div className="flex items-center justify-start space-x-3">
            {SOCIAL_LINKS.map((link) => (
              <MagneticSocialLink
                key={link.label}
                link={link.link}
                label={link.label}
              >
                {link.label}
              </MagneticSocialLink>
            ))}
          </div>
        </motion.section>
      </motion.main>
    </>
  )
}
