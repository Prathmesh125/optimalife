export function cleanMarkdown(markdown: string): string {
  if (!markdown) return "";

  // Remove the repetitive WordPress "Menu" blocks that got scraped
  let cleaned = markdown.replace(/Menu\s*(?:\*\s*\[.*?\]\(.*?\)\s*)+/g, "");
  
  // Remove repetitive logo text / image links that appear at the top/bottom
  cleaned = cleaned.replace(/\[\s*!\[.*?logo.*?\]\(.*?\)\s*\]\(.*?\)/gi, "");
  cleaned = cleaned.replace(/!\[.*?logo.*?\]\(.*?\)/gi, "");
  
  // Remove "Our Links" footer block
  cleaned = cleaned.replace(/Our Links\s*(?:\*\s*\[.*?\]\(.*?\)\s*)+/g, "");
  
  // Remove "Connnet with us Send Copyright..." block
  cleaned = cleaned.replace(/Connet with us\s*Send\s*(Copyright.*)?/g, "");
  cleaned = cleaned.replace(/Connnet with us\s*Send/g, "");

  // Remove top breadcrumbs and title
  cleaned = cleaned.replace(/Discover Optima Life's Story and Mission/i, "");
  cleaned = cleaned.replace(/\* \[Home\]\(https:\/\/www\.optimalife\.in\/\)\n\s*\* About us/i, "");
  cleaned = cleaned.replace(/\[optimalife\]\(https:\/\/www\.optimalife\.in\/\)/i, "");

  // Remove ugly/blurry icon images that got scraped (Vision, Mission, Values)
  cleaned = cleaned.replace(/!\[.*?\]\(.*?Our-Vision-1\.png\)/gi, "");
  cleaned = cleaned.replace(/!\[.*?\]\(.*?Our-Mission\.png\)/gi, "");
  cleaned = cleaned.replace(/!\[.*?\]\(.*?Our-Values\.png\)/gi, "");
  
  // Remove broken images that just point to /about-us/
  cleaned = cleaned.replace(/!\[.*?\]\(https?:\/\/(www\.)?optimalife\.in\/about-us\/?\)/gi, "");

  // Remove empty headings or random whitespace
  cleaned = cleaned.replace(/#+\s*$/gm, "");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}
