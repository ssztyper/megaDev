# megaDev · S01E03 "what it shows"

Ticket #4471 of the support desk (412 merged reports) holds more than one problem. This repo carries:

- **Issues** — one ticket per problem, each with the number of reports it covers.
- **The page** — `src/routes/kb/incidents/4471-split/+page.svx`, signed in its frontmatter, plus the
  components it uses (`src/lib/kb/problems.ts`, `src/lib/kb/ProblemTable.svelte`).
- **The page as the desk sees it** — `rendered/4471-split.html` (build it again with `npm install && npm run render`).
- `src/` is the kb export (`KB-README.md` is its README). Everything outside the new page and its two
  components is unchanged from the export.
