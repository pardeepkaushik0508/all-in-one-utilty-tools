import { tools } from '../tools';

const CATEGORY_COLORS = {
  'PDF Tools': 'from-red-500/20 to-orange-500/20',
  'Image Tools': 'from-violet-500/20 to-fuchsia-500/20',
  'Video & Audio': 'from-blue-500/20 to-cyan-500/20',
  'Text & AI': 'from-emerald-500/20 to-teal-500/20',
  Developer: 'from-slate-500/20 to-zinc-500/20',
  Security: 'from-amber-500/20 to-yellow-500/20',
  Guides: 'from-indigo-500/20 to-purple-500/20'
};

function countWords(parts = []) {
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

function buildExtraSections(post) {
  const relatedTool = tools.find((t) => t.slug === post.relatedToolSlug);
  const toolName = relatedTool?.name || 'our utility tools';

  return [
    {
      id: 'why-it-matters',
      heading: 'Why this matters',
      paragraphs: [
        `Understanding ${post.title.toLowerCase()} helps you work faster with fewer mistakes. Many users discover this workflow only after wasting time on manual steps or desktop software installs.`,
        `Browser-based tools remove friction. You can complete the task from any device, share results immediately, and move on to the next item on your list. That is especially useful for ${post.category.toLowerCase()} workflows in fast-moving teams.`
      ]
    },
    {
      id: 'best-practices',
      heading: 'Best practices',
      paragraphs: [
        `Start with a clear goal: what output do you need, and who will use it? For ${toolName}, define quality expectations before you begin so you do not over-process files.`,
        `Keep originals backed up. Online tools are excellent for quick transformations, but archiving source files protects you if you need to re-edit later with different settings.`,
        `Review results before sharing externally. Automated processing is fast, yet a quick visual check prevents sending the wrong version to clients or classmates.`
      ]
    },
    {
      id: 'faq',
      heading: 'Frequently asked questions',
      paragraphs: [],
      faqs: [
        {
          question: 'Is this workflow free?',
          answer: `Yes — the related ${toolName} tool on our site is free for everyday use without mandatory registration.`
        },
        {
          question: 'Do I need special software?',
          answer: 'No. A modern browser is enough for most tasks described in this article.'
        },
        {
          question: 'Where can I learn more?',
          answer: 'Browse related articles in the same category or open the tool page for step-by-step instructions and FAQs.'
        }
      ]
    },
    {
      id: 'conclusion',
      heading: 'Conclusion',
      paragraphs: [
        `${post.title} does not have to be complicated. With the right tool and a simple checklist, you can get reliable results in minutes.`,
        `Bookmark the related tool page, explore similar utilities, and check back for updated guides as we expand our blog library.`
      ]
    }
  ];
}

export function enhanceBlogPost(post, relatedPosts = []) {
  const sections = [
    {
      id: 'introduction',
      heading: 'Introduction',
      paragraphs: post.content || []
    },
    ...buildExtraSections(post)
  ];

  const allParagraphs = sections.flatMap((section) => [
    ...section.paragraphs,
    ...(section.faqs || []).map((faq) => `${faq.question} ${faq.answer}`)
  ]);
  const wordCount = countWords(allParagraphs);
  const gradient = CATEGORY_COLORS[post.category] || 'from-violet-500/20 to-indigo-500/20';

  return {
    ...post,
    sections,
    wordCount,
    featuredImageGradient: gradient,
    tableOfContents: sections.map((section) => ({ id: section.id, title: section.heading })),
    relatedPosts: relatedPosts.slice(0, 4),
    cta: {
      title: relatedToolName(post),
      description: `Try the free ${relatedToolName(post)} tool — fast, secure, and easy to use.`,
      href: post.relatedToolSlug ? `/tool/${post.relatedToolSlug}` : '/#tools'
    }
  };
}

function relatedToolName(post) {
  return tools.find((t) => t.slug === post.relatedToolSlug)?.name || 'utility';
}
