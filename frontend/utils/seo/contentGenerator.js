import { tools } from '../tools';
import { getCategoryProfile } from './categoryProfiles';

function hashSlug(slug) {
  return slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function pick(list, slug, offset = 0) {
  return list[(hashSlug(slug) + offset) % list.length];
}

function countWords(texts = []) {
  return texts.join(' ').split(/\s+/).filter(Boolean).length;
}

function buildOverview(tool, profile) {
  const name = tool.name;
  const desc = tool.description;
  const category = tool.category;

  return [
    `The ${name} tool on All-in-One Utility Tools helps ${profile.audience} handle ${profile.context} without installing desktop software. ${desc} Everything runs in your browser, which means you can start working in seconds on any device with an internet connection.`,
    `Many people search for a reliable ${name.toLowerCase()} solution when they need fast results without complicated settings. Our interface keeps the workflow simple: upload or paste your input, adjust optional settings if needed, and download the output. Whether you are handling one file or several, the tool is designed to stay responsive and easy to understand.`,
    `Unlike bloated all-in-one suites that hide basic features behind paywalls, this ${category.toLowerCase()} utility is free to use for everyday tasks. You do not need to create an account, and there are no watermarks added to your results. That makes it practical for quick fixes at work, school projects, and personal organization.`,
    `${profile.privacy} We built the experience for users who care about speed and clarity. Clear labels, helpful defaults, and visible progress indicators reduce guesswork so you can finish faster. If you are comparing online tools, look for transparent processing, mobile-friendly layouts, and download links that work immediately — those are core parts of this ${name} experience.`,
    `Common scenarios include preparing files before email, optimizing assets for a website, cleaning up content before publishing, or converting media for a presentation. The ${name} tool supports those real-world moments where you need a dependable result, not a learning curve. Keep this page bookmarked for repeat tasks throughout your week.`,
    `From a quality perspective, we focus on practical output you can use right away. The tool uses established libraries and APIs where appropriate, and we continue refining error messages so failures are understandable. If something does not work, you will see a clear explanation instead of a generic failure screen.`,
    `For teams and solo creators alike, browser-based utilities reduce friction. You can switch between phone, tablet, and laptop without syncing installs. The ${name} page also includes educational sections below — features, step-by-step instructions, use cases, benefits, and FAQs — so you can learn best practices while you work.`,
    `If you are building a content workflow, combine ${name} with related utilities on this site. Many users chain tools together: compress first, convert second, then merge or share. Explore the related tools section at the bottom of this page to discover complementary options in ${category} and neighboring categories.`,
    `Search engines and human readers both benefit from helpful, specific information. This overview explains what ${name} does, who it is for, and how it fits into daily tasks. We avoid vague marketing language and focus on actionable context so you can decide quickly whether this tool matches your goal today.`,
    `Ready to begin? Use the interactive ${name} panel above, then review the how-it-works steps if you want a guided walkthrough. For troubleshooting, check the FAQ section — it covers file limits, supported formats, privacy, and compatibility questions we hear most often from users.`,
    `When evaluating online ${tool.category.toLowerCase()} utilities, reliability matters as much as features. ${name} is maintained as part of an integrated toolkit, which means updates, fixes, and UX improvements roll out consistently. You are not using a one-off script page — you are using a production tool designed for repeat visits.`,
    `Accessibility is part of the product experience. Buttons, labels, and contrast are designed for comfortable use in both light and dark themes. Keyboard-friendly controls and readable typography help you work longer without fatigue, whether you are polishing a document, preparing images, or running quick conversions.`,
    `Performance is tuned for real devices. Pages use lazy loading for heavy tool modules, responsive layouts for narrow screens, and clear loading indicators during processing. For text utilities, many operations run instantly in your browser. For image tasks, uploads show previews before you commit to processing.`,
    `Content creators, students, freelancers, and teams all use ${name} for different reasons. Some need a fast answer once a week; others build it into a daily workflow. The tool scales to both patterns — no forced onboarding, no mandatory exports to proprietary formats, and no artificial usage caps for standard tasks.`,
    `Security-minded users appreciate transparent processing. Inputs are used to generate your result, not to train unrelated models. Avoid uploading confidential material if your organization policy forbids cloud processing; for sensitive text transforms that run locally in the browser, data may never leave your device.`,
    `SEO professionals and publishers can combine ${name} with other utilities on this site for content production pipelines: analyze text, format data, optimize media, and publish faster. Internal links between related tools help you discover the next step without returning to a generic search engine results page.`,
    `Educators and trainers can reference this page when teaching digital literacy, media preparation, or writing skills. The how-to section provides a structured walkthrough suitable for classrooms, while FAQs address the practical questions students ask when trying a tool for the first time.`,
    `We continue expanding the ${category} collection based on user needs. Bookmark this ${name} page if you expect to return — browser bookmarks and shared links make it easy to resume work. If a feature you need is available in a related tool, the related tools grid at the bottom of the page will point you there quickly.`,
    `In summary, ${name} delivers a focused, free, browser-based way to ${desc.charAt(0).toLowerCase()}${desc.slice(1)} The combination of practical UI, educational content, and complementary tools makes this page useful for both quick tasks and learning how to work more efficiently online.`
  ];
}

function buildFeatures(tool, profile) {
  const base = [
    `Free online ${tool.name} with no account required`,
    `Works on desktop, tablet, and mobile browsers`,
    `Clear interface designed for fast, one-session tasks`,
    `Secure server-side processing with automatic cleanup`,
    `Download results immediately after processing`,
    `Helpful validation messages for unsupported inputs`,
    `Optimized for users who need reliable ${tool.category.toLowerCase()} workflows`,
    `Part of a growing library of 30+ free utility tools`
  ];

  const specific = {
    'merge-pdf': ['Combine multiple PDFs in custom order', 'Supports batch uploads', 'Single merged download'],
    'edit-pdf': ['Add text, signatures, shapes, and highlights', 'Undo/redo editor', 'Export edited PDF'],
    'create-pdf': ['Create from images, text, or mixed files', 'Page size and orientation controls', 'Reorder and rotate pages'],
    'ai-content-generator': ['Gemini-powered writing assistant', 'Optional image context upload', 'Copy-ready output'],
    'ai-image-generator': ['Text-to-image with Gemini', 'Multiple aspect ratios', 'Reference image support'],
    'video-downloader': ['YouTube and direct URL support', 'MP4 output when available', 'No browser extension needed'],
    'scan-to-pdf': ['Camera capture and uploads', 'Enhancement controls for scans', 'Multi-page PDF export']
  };

  return [...(specific[tool.slug] || []), ...base].slice(0, 10);
}

function buildHowItWorks(tool) {
  const steps = {
    'merge-pdf': [
      { title: 'Upload PDF files', description: 'Select two or more PDF documents from your device.' },
      { title: 'Arrange order', description: 'Confirm the sequence before merging.' },
      { title: 'Merge and download', description: 'Click merge and save the combined PDF.' }
    ],
    'edit-pdf': [
      { title: 'Upload your PDF', description: 'Open the document you want to modify.' },
      { title: 'Choose an editing tool', description: 'Add text, signatures, images, shapes, or drawings.' },
      { title: 'Save changes', description: 'Export the edited PDF with your annotations applied.' }
    ],
    default: [
      { title: `Open ${tool.name}`, description: `Navigate to this page and locate the ${tool.name} panel.` },
      { title: 'Provide your input', description: 'Upload a file, paste text, or enter the required values.' },
      { title: 'Adjust options', description: 'Use optional settings to fine-tune quality, size, or format.' },
      { title: 'Process and download', description: 'Run the tool and download your result when processing completes.' }
    ]
  };

  return steps[tool.slug] || steps.default;
}

function buildUseCases(tool, profile) {
  return [
    `Prepare ${profile.context} before sharing with clients or classmates`,
    `Fix last-minute file issues without installing desktop software`,
    `Optimize content for mobile viewing and faster uploads`,
    `Support remote work when you only have browser access`,
    `Handle quick ${tool.category.toLowerCase()} tasks during meetings or calls`,
    `Combine ${tool.name.toLowerCase()} with other utilities for a full workflow`
  ];
}

function buildBenefits(tool) {
  return [
    'Save time with a focused tool built for one job',
    'Avoid paid subscriptions for occasional tasks',
    'Work from any device with a modern browser',
    'Get immediate downloads without waiting for email links',
    'Learn from on-page guides, FAQs, and related resources',
    `Use a trusted ${tool.category.toLowerCase()} utility with clear privacy practices`
  ];
}

function buildFaqs(tool, profile) {
  const name = tool.name;
  const common = [
    {
      question: `Is ${name} free to use?`,
      answer: `Yes. ${name} is free for everyday use. You can process your files or inputs without creating an account.`
    },
    {
      question: `Do I need to install software for ${name}?`,
      answer: 'No installation is required. The tool runs entirely in your web browser on desktop and mobile.'
    },
    {
      question: `Are my files stored permanently?`,
      answer: `${profile.privacy} Files are not kept permanently after processing.`
    },
    {
      question: `What file size limits apply?`,
      answer: 'Upload limits depend on server configuration, typically up to 100MB per file for media and document tools. Very large files may take longer to process.'
    },
    {
      question: `Can I use ${name} on mobile?`,
      answer: 'Yes. The interface is responsive and supports modern mobile browsers for most workflows.'
    },
    {
      question: `Which browsers are supported?`,
      answer: 'Recent versions of Chrome, Firefox, Safari, and Edge are recommended for the best experience.'
    },
    {
      question: `Why did my upload fail?`,
      answer: 'Common causes include unsupported formats, exceeded size limits, or network interruptions. Check the file type and try again with a stable connection.'
    },
    {
      question: `Can I use ${name} for commercial work?`,
      answer: 'You may use processed outputs in personal and commercial projects, but always verify licensing for source materials you do not own.'
    },
    {
      question: `Are there related tools I should try next?`,
      answer: `Yes. Browse the related tools section on this page for complementary utilities in ${tool.category} and other categories.`
    },
    {
      question: `How do I get better results with ${name}?`,
      answer: pick(
        [
          'Use high-quality source files and follow the on-page how-to steps.',
          'Start with recommended default settings, then adjust based on output quality.',
          'Process smaller batches when working with large media files.'
        ],
        tool.slug
      )
    }
  ];

  const specific = {
    'merge-pdf': [
      {
        question: 'How many PDFs can I merge at once?',
        answer: 'You can merge multiple PDF files in one session. Arrange them in the desired order before merging.'
      }
    ],
    'ai-content-generator': [
      {
        question: 'Does AI content generation require an API key?',
        answer: 'AI features require server-side configuration. If unavailable, the tool may show a fallback message.'
      }
    ],
    'video-downloader': [
      {
        question: 'Which video URLs are supported?',
        answer: 'YouTube links and direct MP4/WebM URLs are supported. Private or restricted videos may not download.'
      }
    ]
  };

  return [...(specific[tool.slug] || []), ...common].slice(0, 10);
}

function buildRelatedTools(tool) {
  const sameCategory = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug);
  const other = tools.filter((t) => t.category !== tool.category && t.slug !== tool.slug);
  const seed = hashSlug(tool.slug);
  const picks = [
    ...sameCategory.slice(seed % Math.max(1, sameCategory.length)),
    ...other.slice(seed % Math.max(1, other.length))
  ];
  return [...new Map(picks.map((t) => [t.slug, t])).values()].slice(0, 6);
}

export function generateToolSeoContent(tool) {
  const profile = getCategoryProfile(tool.category);
  const overview = buildOverview(tool, profile);
  const keywords = [
    tool.name.toLowerCase(),
    tool.slug.replace(/-/g, ' '),
    ...profile.keywords,
    `${tool.name.toLowerCase()} online`,
    `free ${tool.name.toLowerCase()}`
  ];

  const metaTitle = `Free ${tool.name} Online — ${tool.category} | All-in-One Utility Tools`;
  const metaDescription = `${tool.description} Use our free ${tool.name} tool online — fast, secure, no signup. Works on desktop and mobile.`;

  return {
    metaTitle,
    metaDescription,
    keywords: [...new Set(keywords)],
    overview,
    overviewWordCount: countWords(overview),
    features: buildFeatures(tool, profile),
    howItWorks: buildHowItWorks(tool),
    useCases: buildUseCases(tool, profile),
    benefits: buildBenefits(tool),
    faqs: buildFaqs(tool, profile),
    relatedTools: buildRelatedTools(tool),
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    generatedAt: new Date().toISOString()
  };
}

export function generateAllToolSeoContent() {
  return Object.fromEntries(tools.map((tool) => [tool.slug, generateToolSeoContent(tool)]));
}
