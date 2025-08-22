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

// 分辨率： 1040×585 (16:9)
// 格式： MP4 (H.264编码)
// 码率： 2-4 Mbps (平衡质量和文件大小)
// 时长： 建议5-15秒 (自动循环播放)
// 音频： 无需音频 (页面设置为muted)

export const PROJECTS: Project[] = [
  {
    name: 'Bitematch',
    description:
      'No more “What should I eat?” debates',
    link: 'https://github.com/nickhuo/bitematch',
    video:
      '/project/bitematch.mp4', 
    id: 'project1',
  },
  // 添加更多项目...
  // {
  //   name: 'Your Project Name',
  //   description: 'Project description...',
  //   link: 'https://your-project-link.com',
  //   video: '/project/your-project-video.mp4',
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
    label: 'X',
    link: 'https://twitter.com/imnickhuo', 
  },
  {
    label: 'Email',
    link: 'mailto:jiajunhuo726@gmail.com', 
  }
]