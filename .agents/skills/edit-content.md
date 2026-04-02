---
description: Editorial review pass for any content before committing or publishing. Checks clarity, tone, grammar, purpose, assumptions, and voice guide compliance. Run this before pushing.
---

# Skill: Edit Content

Thorough editorial review of content before it goes out. Acts as a second pair of eyes.

## Inputs

- **file**: Path to the content file to review

## What to Check

### Purpose and structure

- Can you state what this piece is about in one sentence? If not, it's not clear enough. The title and summary front matter should pass this test on their own.
- Does the opening make the purpose obvious within the first two paragraphs?
- Does the reader know *why they should care* early on?
- Is there a logical flow from section to section, or do ideas jump around?
- Does anything feel like it's in the wrong place?
- Does it just... end? Or does it land somewhere?

### Assumptions and gaps

- What does this assume the reader already knows? Is that reasonable for the audience?
- Are there leaps in logic where the reader needs a bridge?
- Are claims backed up with evidence (links, data, examples, output)?
- If you removed all the code blocks and links, would the prose still make a specific point or would it collapse into vague hand-waving?

### Clarity

- Flag any sentence you had to read twice.
- Flag jargon or acronyms used without context.
- Flag paragraphs that are doing too much (split them).
- Flag sections that say the same thing twice in different words.

### Tone and voice

- Run the full [voice guide](.agents/skills/voice-guide.md) checklist:
  - Banned words scan
  - [AI slop patterns](voice-guide.md#ai-slop-patterns) scan
  - Em-dash count (more than ~3 per section is too many)
  - Staccato fragment patterns
  - Fabricated experiences or opinions
- Does it sound like a person wrote it or like it was generated?
- Is the author's personality coming through?

### Grammar and mechanics

- Spelling errors
- Awkward phrasing
- Subject-verb agreement
- Dangling modifiers
- Comma splices
- Consistent tense

### Links and references

- Do all links point somewhere real? (Check URLs if possible.)
- Are inline references used throughout, or are there long stretches of unsupported prose?
- Are images/figures referenced correctly and compressed?

## Output

Report findings grouped by severity:

1. **Must fix** — the reader will be confused, misled, or lost
2. **Should fix** — noticeably improves clarity or quality
3. **Nit** — minor polish, author's discretion

For each finding, quote the specific text and suggest a fix. Don't just say "this section is unclear" — say what's unclear and why.

After listing findings, give a one-paragraph overall assessment: does this piece accomplish what it set out to do?
