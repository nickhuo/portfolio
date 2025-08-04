type Project = {
  name: string
  description: string
  link: string
  video: string
  id: string
}

type BlogPost = {
  title: string
  description: string
  link: string
  uid: string
}

type SocialLink = {
  label: string
  link: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Portfolio Website',
    description:
      'A modern portfolio website built with Next.js and Motion.',
    link: 'https://nichol.com',
    video:
      '/placeholder-project-video.mp4', 
    id: 'project1',
  },
  // 添加更多项目...
  // {
  //   name: 'Your Project Name',
  //   description: 'Project description...',
  //   link: 'https://your-project-link.com',
  //   video: '/path-to-your-project-video.mp4',
  //   id: 'project2',
  // },
]


export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'Exploring the Intersection of Design, AI, and Design Engineering',
    description: 'How AI is changing the way we design',
    link: '/writing/exploring-the-intersection-of-design-ai-and-design-engineering',
    uid: 'writing-1',
  },
  // 添加您的其他博客文章...
  // {
  //   title: 'Your Blog Post Title',
  //   description: 'Blog post description...',
  //   link: '/blog/your-blog-post-slug',
  //   uid: 'blog-2',
  // },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'GitHub',
    link: 'https://github.com/nickhuo', 
  },
  {
    label: 'LinkedIn',
    link: 'https://www.linkedin.com/in/nickhuo', 
  },
  {
    label: 'Twitter',
    link: 'https://twitter.com/imnickhuo', 
  },
  {
    label: 'Email',
    link: 'mailto:jiajunhuo726@gmail.com', 
  }
]