import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import type { 
  TableHTMLAttributes, 
  HTMLAttributes, 
  ThHTMLAttributes, 
  TdHTMLAttributes 
} from 'react'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Cover: ({
      src,
      alt,
      caption,
    }: {
      src: string
      alt: string
      caption: string
    }) => {
      // Check if the image is a GIF to determine if it should be unoptimized
      const isGif = src.toLowerCase().endsWith('.gif')
      
      return (
        <figure>
          <Image 
            src={src} 
            alt={alt} 
            className="rounded-xl" 
            width={800}
            height={400}
            style={{ width: '100%', height: 'auto' }}
            unoptimized={isGif}
          />
          <figcaption className="text-center">{caption}</figcaption>
        </figure>
      )
    },
    // Minimal table component that matches the prose style
    table: (props: TableHTMLAttributes<HTMLTableElement>) => (
      <div className="my-8 overflow-x-auto">
        <table className="w-full [&_tr:last-child_td]:border-b-0">
          {props.children}
        </table>
      </div>
    ),
    thead: (props: HTMLAttributes<HTMLTableSectionElement>) => (
      <thead>
        {props.children}
      </thead>
    ),
    th: (props: ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
      <th className="border-b border-gray-200 dark:border-gray-700 pb-3 pr-6 text-left text-sm font-medium text-[#373632] dark:text-[#D8D8D6] last:pr-0">
        {props.children}
      </th>
    ),
    td: (props: TdHTMLAttributes<HTMLTableDataCellElement>) => (
      <td className="border-b border-gray-100 dark:border-gray-800 py-4 pr-6 text-sm text-[#373632] dark:text-[#D8D8D6] align-top last:pr-0">
        {props.children}
      </td>
    ),
  }
}
