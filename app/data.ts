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
      'A modern portfolio website built with Next.js and Motion Primitives.',
    link: 'https://nichol.com',
    video:
      '/placeholder-project-video.mp4', // 替换为您的项目视频
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
    link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
    uid: 'blog-1',
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
    label: 'Github',
    link: 'https://github.com/nickhuo', // 请更新为您的GitHub链接
  },
  {
    label: 'LinkedIn',
    link: 'https://www.linkedin.com/in/nickhuo', // 请更新为您的LinkedIn链接
  },
  {
    label: 'Twitter',
    link: 'https://twitter.com/imnickhuo', // 请更新为您的Twitter链接
  },

]

export const EMAIL = 'jiajunhuo726@gmail.com' // 请更新为您的邮箱地址
