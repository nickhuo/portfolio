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
      'A gallery of something wonderful',
    link: 'https://github.com/nickhuo/portfolio',
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
    title: 'Behind the Build: My Tools & Workflow',
    description: '“A craftsman must first sharpen his tools before he can do his work well”',
    link: 'writing/behind-the-build-my-tools-workflow',
    uid: 'writing-1',
  },
  {
    title: 'The 59-Try Rule',
    description: 'Why high-upside success is worth 59 shots?',
    link: 'writing/the-59-try-rule',
    uid: 'writing-2',
  }
  // add more blog posts...
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