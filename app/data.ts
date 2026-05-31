type Project = {
  name: string
  description: string
  link: string
  video: string
  id: string
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
  // 添加更多项目...
  // {
  //   name: 'Your Project Name',
  //   description: 'Project description...',
  //   link: 'https://your-project-link.com',
  //   video: '/project/your-project-video.mp4',
  //   id: 'project2',
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