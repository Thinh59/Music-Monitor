// Frontend safety net — strip residual markdown nếu backend lỡ trả ký hiệu.

const HEADER = /^\s{0,3}#{1,6}\s+/gm;
const BOLD = /\*\*([\s\S]+?)\*\*/g;
const ITALIC_AST = /(?<!\*)\*([^*\n]+?)\*(?!\*)/g;
const ITALIC_UND = /(?<!_)_([^_\n]+?)_(?!_)/g;
const INLINE_CODE = /`([^`\n]+?)`/g;
const BLOCKQUOTE = /^\s{0,3}>\s?/gm;
const HR = /^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/gm;
const BULLET = /^\s*[-*+]\s+/gm;
const NUM_LIST = /^\s*\d+\.\s+/gm;
const LINK = /\[([^\]]+)\]\([^)]+\)/g;
const MULTI_BLANK = /\n{3,}/g;

export function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(HEADER, "")
    .replace(BLOCKQUOTE, "")
    .replace(HR, "")
    .replace(LINK, "$1")
    .replace(BOLD, "$1")
    .replace(ITALIC_AST, "$1")
    .replace(ITALIC_UND, "$1")
    .replace(INLINE_CODE, "$1")
    .replace(BULLET, "• ")
    .replace(NUM_LIST, "")
    .replace(MULTI_BLANK, "\n\n")
    .trim();
}
