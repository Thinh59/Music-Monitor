"""Helper để dọn ký hiệu markdown khỏi text do Gemini sinh ra."""

import re

_HEADER_RE = re.compile(r"^\s{0,3}#{1,6}\s+", re.MULTILINE)
_BOLD_RE = re.compile(r"\*\*(.+?)\*\*", re.DOTALL)
_ITALIC_AST_RE = re.compile(r"(?<!\*)\*([^*\n]+?)\*(?!\*)")
_ITALIC_UND_RE = re.compile(r"(?<!_)_([^_\n]+?)_(?!_)")
_INLINE_CODE_RE = re.compile(r"`([^`\n]+?)`")
_BLOCKQUOTE_RE = re.compile(r"^\s{0,3}>\s?", re.MULTILINE)
_HR_RE = re.compile(r"^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$", re.MULTILINE)
_LIST_BULLET_RE = re.compile(r"^\s*[-*+]\s+", re.MULTILINE)
_LIST_NUM_RE = re.compile(r"^\s*\d+\.\s+", re.MULTILINE)
_LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]+\)")
_EMPTY_LINES_RE = re.compile(r"\n{3,}")


def strip_markdown(text: str | None) -> str:
    """Bỏ ký hiệu `##`, `**`, `__`, `>`, `---`, list markers, link [text](url) → text.

    Giữ nguyên emoji, dấu xuống dòng, thứ tự nội dung.
    """
    if not text:
        return ""

    out = text

    # Headers: "## Title" → "Title"
    out = _HEADER_RE.sub("", out)

    # Blockquote: "> quote" → "quote"
    out = _BLOCKQUOTE_RE.sub("", out)

    # Horizontal rule: "---" → ""
    out = _HR_RE.sub("", out)

    # Links: "[text](url)" → "text"
    out = _LINK_RE.sub(r"\1", out)

    # Bold: "**text**" → "text"
    out = _BOLD_RE.sub(r"\1", out)

    # Italic: "*text*" or "_text_" → "text"
    out = _ITALIC_AST_RE.sub(r"\1", out)
    out = _ITALIC_UND_RE.sub(r"\1", out)

    # Inline code: "`code`" → "code"
    out = _INLINE_CODE_RE.sub(r"\1", out)

    # List markers: keep bullet visible as "• " for readability
    out = _LIST_BULLET_RE.sub("• ", out)
    out = _LIST_NUM_RE.sub("", out)

    # Collapse 3+ blank lines to 2
    out = _EMPTY_LINES_RE.sub("\n\n", out)

    return out.strip()
