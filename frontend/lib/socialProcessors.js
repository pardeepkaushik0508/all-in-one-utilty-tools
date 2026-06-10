/* Client-side social media tool processors */

export function generateCaption(topic, tone = 'professional') {
  return `${tone === 'fun' ? '🚀' : '✨'} ${topic}\n\nDiscover tips, tools, and ideas to level up your workflow.\n\n#${topic.replace(/\s+/g, '').toLowerCase()} #content #tools`;
}

export function generateBio(name, niche) {
  return `${name} | ${niche}\nSharing useful tools & tips daily.\nLink in bio 👇`;
}

export function generateUsername(keyword) {
  const suffix = Math.floor(Math.random() * 9999);
  return [`${keyword}${suffix}`, `${keyword}_official`, `the.${keyword}`, `${keyword}.hq`].join('\n');
}

export function generateYoutubeTitle(topic) {
  return [
    `How to ${topic} (Step-by-Step Guide)`,
    `${topic} — Complete Tutorial for Beginners`,
    `I Tried ${topic} So You Don't Have To`
  ].join('\n');
}

export function generateYoutubeDescription(topic) {
  return `In this video, we cover ${topic}.\n\nTimestamps:\n0:00 Intro\n1:00 Setup\n3:00 Demo\n\nResources:\n- UtilityTools.app\n\n#${topic.replace(/\s+/g, '')}`;
}

export function extractYoutubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : 'Could not extract channel/video ID from URL.';
}

export function generateInstagramCaption(product) {
  return `${product} ✨\n\nTap save for later.\n.\n.\n.\n#${product.replace(/\s+/g, '').toLowerCase()} #instagram #tools`;
}

export function generateTwitterPost(message) {
  const trimmed = message.slice(0, 270);
  return `${trimmed}${message.length > 270 ? '…' : ''}\n\n#tools #productivity`;
}

export function generateLinkedInPost(topic) {
  return `Thoughts on ${topic}:\n\n1. Start small\n2. Stay consistent\n3. Measure results\n\nWhat would you add?`;
}

export function generateSocialPost(platform, topic) {
  if (platform === 'twitter') return generateTwitterPost(topic);
  if (platform === 'linkedin') return generateLinkedInPost(topic);
  return generateCaption(topic);
}

export function generateEmoji(text) {
  const map = { love: '❤️', fire: '🔥', star: '⭐', check: '✅', rocket: '🚀', sparkles: '✨' };
  return Object.entries(map)
    .filter(([k]) => text.toLowerCase().includes(k))
    .map(([, e]) => e)
    .join(' ') || '✨ 🔥 ⭐';
}

export function engagementCalc(likes, comments, shares, followers) {
  const total = Number(likes) + Number(comments) + Number(shares);
  const rate = followers ? ((total / Number(followers)) * 100).toFixed(2) : '0';
  return `Engagement actions: ${total}\nEngagement rate: ${rate}%`;
}
