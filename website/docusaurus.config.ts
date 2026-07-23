import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';

const config: Config = {
  title: 'n8n Toolkit',
  tagline:
    'Typed, dependency-free tooling for managing and syncing n8n instances — n8n-client (TypeScript client for the n8n Public API) and n8n-sync (external-hook bundles that sync credentials and workflows between instances).',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://n8n-toolkit.pages.dev/',
  baseUrl: '/',
  trailingSlash: true,

  organizationName: 'egose',
  projectName: 'n8n-toolkit',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '',
          remarkPlugins: [[npm2yarn, { sync: true }]],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/social-card.png',
    navbar: {
      title: 'n8n Toolkit',
      logo: {
        alt: 'n8n Toolkit logo',
        src: 'img/n8n-client-mark.svg',
        srcDark: 'img/n8n-client-mark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'n8nClient',
          position: 'left',
          label: 'n8n-client',
        },
        {
          type: 'docSidebar',
          sidebarId: 'n8nSync',
          position: 'left',
          label: 'n8n-sync',
        },
        {
          href: 'https://github.com/egose/n8n-toolkit',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Egose. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
    colorMode: {
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/img/favicon.svg',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/img/favicon-32.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/img/favicon-16.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        href: '/img/apple-touch-icon.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'manifest',
        href: '/manifest.webmanifest',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'robots',
        content: 'index, follow',
      },
    },
  ],
  plugins: ['./src/plugins/tailwind-config.js'],
};

export default config;
