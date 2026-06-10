import * as sp from '../../../lib/socialProcessors';
import * as tp from '../../../lib/textProcessors';

export const SOCIAL_SUITE_CONFIGS = [
  {
    slug: 'caption-generator',
    name: 'Caption Generator',
    description: 'Generate social media captions for any topic.',
    options: [
      { value: 'professional', label: 'Professional' },
      { value: 'fun', label: 'Fun' },
      { value: 'minimal', label: 'Minimal' }
    ],
    process: async ({ input, option }) => sp.generateCaption(input, option)
  },
  {
    slug: 'bio-generator',
    name: 'Bio Generator',
    description: 'Create profile bios for social platforms.',
    dualInput: true,
    inputLabel: 'Name',
    inputBLabel: 'Niche',
    process: async ({ input, inputB }) => sp.generateBio(input, inputB)
  },
  {
    slug: 'username-generator',
    name: 'Username Generator',
    description: 'Generate creative username ideas.',
    process: async ({ input }) => sp.generateUsername(input)
  },
  {
    slug: 'youtube-title-generator',
    name: 'YouTube Title Generator',
    description: 'Generate click-worthy YouTube video titles.',
    process: async ({ input }) => sp.generateYoutubeTitle(input)
  },
  {
    slug: 'youtube-description-generator',
    name: 'YouTube Description Generator',
    description: 'Generate YouTube video descriptions with timestamps.',
    process: async ({ input }) => sp.generateYoutubeDescription(input)
  },
  {
    slug: 'youtube-channel-id-finder',
    name: 'YouTube Channel ID Finder',
    description: 'Extract video or channel ID from YouTube URLs.',
    process: async ({ input }) => sp.extractYoutubeId(input)
  },
  {
    slug: 'youtube-tags-extractor',
    name: 'YouTube Tags Extractor',
    description: 'Generate suggested tags for YouTube videos.',
    process: async ({ input }) => input.split(/[,\s]+/).filter(Boolean).map((t) => `#${t.replace(/^#/, '')}`).join(' ')
  },
  {
    slug: 'instagram-caption-generator',
    name: 'Instagram Caption Generator',
    description: 'Create Instagram-ready captions with hashtags.',
    process: async ({ input }) => sp.generateInstagramCaption(input)
  },
  {
    slug: 'instagram-hashtag-generator',
    name: 'Instagram Hashtag Generator',
    description: 'Generate Instagram hashtag sets.',
    process: async ({ input }) => tp.generateHashtags(input, 15)
  },
  {
    slug: 'instagram-bio-generator',
    name: 'Instagram Bio Generator',
    description: 'Create short Instagram profile bios.',
    process: async ({ input }) => sp.generateBio(input.split(' ')[0] || 'Creator', input)
  },
  {
    slug: 'twitter-post-generator',
    name: 'Twitter Post Generator',
    description: 'Generate Twitter/X posts under 280 characters.',
    process: async ({ input }) => sp.generateTwitterPost(input)
  },
  {
    slug: 'linkedin-post-generator',
    name: 'LinkedIn Post Generator',
    description: 'Generate professional LinkedIn posts.',
    process: async ({ input }) => sp.generateLinkedInPost(input)
  },
  {
    slug: 'social-media-post-generator',
    name: 'Social Media Post Generator',
    description: 'Generate posts for Twitter, LinkedIn, or general social.',
    options: [
      { value: 'twitter', label: 'Twitter/X' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'general', label: 'General' }
    ],
    process: async ({ input, option }) => sp.generateSocialPost(option, input)
  },
  {
    slug: 'emoji-generator',
    name: 'Emoji Generator',
    description: 'Suggest emojis based on keywords.',
    process: async ({ input }) => sp.generateEmoji(input)
  },
  {
    slug: 'social-fancy-text',
    name: 'Fancy Text Generator',
    description: 'Convert text to fancy Unicode styles.',
    process: async ({ input }) => tp.fancyText(input)
  },
  {
    slug: 'text-style-generator',
    name: 'Text Style Generator',
    description: 'Apply bold, italic, and monospace Unicode styles.',
    options: [
      { value: 'bold', label: 'Bold' },
      { value: 'italic', label: 'Italic' },
      { value: 'mono', label: 'Monospace' }
    ],
    process: async ({ input, option }) => (option === 'bold' ? tp.fancyText(input) : tp.convertCase(input, option === 'mono' ? 'lower' : option))
  },
  {
    slug: 'engagement-calculator',
    name: 'Engagement Calculator',
    description: 'Calculate social media engagement rate.',
    placeholder: 'likes,comments,shares,followers',
    process: async ({ input }) => {
      const [likes, comments, shares, followers] = input.split(',').map((v) => v.trim());
      return sp.engagementCalc(likes, comments, shares, followers);
    }
  },
  {
    slug: 'social-share-preview',
    name: 'Social Share Preview',
    description: 'Preview how a link title and description appear when shared.',
    dualInput: true,
    inputLabel: 'Title',
    inputBLabel: 'Description',
    process: async ({ input, inputB }) =>
      `┌─────────────────────────────────┐\n│ ${input.slice(0, 40)}${input.length > 40 ? '…' : ''}\n│ ${(inputB || '').slice(0, 50)}${(inputB || '').length > 50 ? '…' : ''}\n│ utilitytools.app\n└─────────────────────────────────┘`
  }
];
