// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Eric Xiaoyun Liu';
export const SITE_DESCRIPTION = 'The academic portfolio of Xiaoyun.';

export const CV_URL = 'https://cdn.liuxy.space/academic/about/XiaoyunLiu_ms_cv_2eu.pdf';

export const CONTACT = {
  organization: 'MATHSDISC',
  addressLines: [
    'Università degli studi di Verona',
    'Strada le Grazie, 15, 37134 Verona, Italy',
  ],
  emails: [
    '12211218@mail.sustech.edu.cn',
    'dawn@liuxy.space'
  ],
};

export type SocialIcon = 'website' | 'scholar' | 'email' | 'github' | 'linkedin' | 'twitter';

export const SOCIAL_LINKS: ReadonlyArray<{
  label: string;
  href: string;
  icon: SocialIcon;
}> = [
  {
    label: 'Website',
    href: 'https://liuxy.space',
    icon: 'website',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/synxn1o',
    icon: 'github',
  },
  {
    label: 'Email',
    href: 'mailto:12211218@mail.sustech.edu.cn',
    icon: 'email',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/xiaoyun-liu-46915b318/',
    icon: 'linkedin',
  }
];

export const FOOTER_CREDIT = {
  // designerName: 'Shravan Goswami',
  // designerUrl: 'https://shravangoswami.com',
  // sourceLabel: 'Open Source',
  // sourceUrl: 'https://github.com/shravanngoswamii/astro-scholar',
};

// Umami analytics — configured via environment variables so no tracking ID is
// committed. Set PUBLIC_UMAMI_WEBSITE_ID (e.g. in a .env file or a CI variable)
// to enable it; leave it unset to disable analytics entirely.
export const UMAMI_SRC = import.meta.env.PUBLIC_UMAMI_SRC ?? 'https://cloud.umami.is/script.js';
export const UMAMI_WEBSITE_ID = import.meta.env.PUBLIC_UMAMI_WEBSITE_ID ?? '';
