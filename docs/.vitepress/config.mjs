import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'metis',
  description: 'An open agent-skill ecosystem built on the USER.md convention. Skills serve the user.',
  base: '/metis/',
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/metis/favicon.svg' }]
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Convention', link: '/convention' },
      { text: 'Skills', link: '/skills' },
      { text: 'CLI', link: '/cli' },
      { text: 'skill-atlas', link: '/atlas' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'The USER.md Convention', link: '/convention' }
        ]
      },
      {
        text: 'Ecosystem',
        items: [
          { text: 'Skills Catalog', link: '/skills' },
          { text: 'metis-os CLI', link: '/cli' },
          { text: 'skill-atlas', link: '/atlas' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mappedinfo/metis' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Shiqi Wang and metis contributors'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/mappedinfo/metis/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
