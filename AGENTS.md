<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rick and Morty Character Finder

A Next.js app for browsing Rick and Morty characters, with email-password authentication and a favourites feature. Data comes from https://rickandmortyapi.com/. Users and favourites are stored in MongoDB.

## Stack

- Next.js (App Router, `cacheComponents` enabled), React 19, TypeScript, Tailwind CSS 4
- shadcn/ui (`base-nova` style, Base UI primitives) in `src/components/ui`
- Better Auth with the MongoDB adapter (`@better-auth/mongo-adapter`), database name `rick-and-morty`
- Email verification emails are sent through Infobip (`src/lib/infobip.ts`, `src/lib/verification-email.ts`)
- Jest and React Testing Library for unit tests, ESLint for linting

## Commands

- `npm run dev` - start the dev server
- `npm run build` - production build (also validates Cache Components rules)
- `npm run typecheck` - `tsc --noEmit`
- `npm run lint` - ESLint
- `npm test` - Jest
- `npm run seed:user` - create the local test user `user1@test.com`

Run typecheck, lint and tests before finishing a change.

## Environment

Set in `.env.local` (never commit it, never print secrets):

- `MONGODB_URI` - MongoDB connection string
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` - Better Auth
- Infobip credentials used by `src/lib/infobip.ts`

## Project structure

- `src/app` - routes. `(pages)` group holds the pages: home, `login`, `signup`, `account`. `api/characters` and `api/auth/[...all]` are route handlers.
- `src/actions` - Server Actions, one file per domain (`characters.ts`, `auth.ts`). Add new domains here, for example `favourites.ts`.
- `src/components` - app components in PascalCase files that match the exported component name (`CharacterCard.tsx`). `ui/` holds shadcn components and keeps shadcn's lowercase filenames.
- `src/lib` - server and shared helpers: `auth.ts`, `mongodb.ts`, `session.ts`, `pagination.ts`, `cache-tags.ts`.
- `src/types` - shared TypeScript types.
- `scripts` - one-off scripts such as the user seed.

## Conventions

### Data and caching

- Fetch data on the server and pass it to client components. Avoid client-side data fetching.
- Data fetching lives in Server Actions. A `"use server"` file can only export async functions, so keep constants and types in `src/lib` or `src/types`.
- Cached reads use an internal, non-exported function with `"use cache"`, `cacheLife(...)` and `cacheTag(...)`. Tag names come from `CACHE_TAGS` in `src/lib/cache-tags.ts`.
- After a mutation, use `updateTag` so the user sees their own write immediately. Use `revalidateTag` only when stale data is acceptable.
- With Cache Components, anything that reads runtime data (`headers()`, `cookies()`, `searchParams`, uncached fetches) must sit inside a `<Suspense>` boundary. Keep the static shell outside it.
- Remote character images need their host allowed in `next.config.ts` (`images.remotePatterns`).

### Server Actions security

Every action is a public POST endpoint. In each action:

- Get the user from `getSession()` in `src/lib/session.ts` and reject unauthenticated calls for anything user specific.
- Never trust identity or ownership from the client. Take only an ID plus the change, derive the user from the session, and look up rows by owner.
- Validate all inputs (`FormData`, numbers, IDs) and return only the data the UI needs.
- Use generic error messages for auth failures so accounts cannot be enumerated.

### Authentication

- Better Auth is configured in `src/lib/auth.ts` with email and password, required email verification, and the `nextCookies()` plugin as the last plugin.
- Sign in and sign out are Server Actions in `src/actions/auth.ts`. The header shows sign in, or the account icon and sign out button, based on the session.
- Protect pages by checking the session in the page (not only in a proxy) and redirecting to `/login`.

### UI

- Use shadcn components from `src/components/ui`. Add more with `npx shadcn@latest add <component>`.
- The shadcn CLI sometimes generates `import { cn } from "cn"` and adds a `cn` package. Change the import to `@/lib/utils` and remove the `cn` package.
- Define components as arrow functions (`const CharacterCard = (props: Props) => { ... }`), not `function` declarations. This includes pages and layouts: declare the arrow function, then `export default` it. Generated shadcn files in `src/components/ui` are exempt.
- Pagination links must stay real links (`next/link`), not buttons.
- Character card: two columns (image left, details right). Status shows a green dot for Alive, red for Dead, grey for unknown. The list is a 3 column grid.

### Testing

- Test files sit next to the code as `*.test.ts(x)`.
- Jest does not support async Server Components. Test synchronous components, helpers and route handlers, and mock Server Actions with `jest.mock`.
- Route handler tests use the `/** @jest-environment node */` docblock.

## Feature plan

Done:

- Homepage with heading, banner, paginated 3 column character card grid
- `GET /api/characters` route handler and `getCharacters` Server Action
- Email-password authentication (login, signup, sign out, account page, header) with MongoDB storage

To do, in order:

1. **Fuzzy search** on the homepage. Search is combined with pagination, and the query lives in the URL (`?q=`). Use a fuzzy matching library such as Fuse.js.
2. **Favourites**: favourite and unfavourite button on each character card (signed-in users only). Store favourites in MongoDB keyed by user ID and character ID, with a unique index on that pair.
3. **Optimistic updates** for favouriting with `useOptimistic`, rolling back if the action fails.
4. **Favourites page**: list the user's favourited characters as cards, with batch selection and batch removal.
5. **Favourite count** on each card showing how many users favourited that character, updated in real time (for example polling or server-sent events). Keep the count query efficient (aggregate or a counter collection).

Keep changes scoped to the current step. Do not build later steps early.
