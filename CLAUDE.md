# Malaysian Holiday Calendar — Development Guide

## Project Overview

A fully-featured holiday calendar web app for Malaysian states with national and state-specific holidays. Built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

- **Live:** https://holiday-calendar-hatori.vercel.app
- **GitHub:** https://github.com/abbywong-ew/holiday-calendar
- **Repo:** abbywong-ew/holiday-calendar

---

## Tech Stack

- **Framework:** Next.js 16.2.6 (App Router, React 19.2.4)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"`, `@theme {}` blocks)
- **Database:** Supabase PostgreSQL
- **State:** localStorage (`"my-calendar-app-data"`) + Supabase seed
- **Deployment:** Vercel (auto-deploy from GitHub)
- **CLI:** Supabase CLI v2.98.2, Vercel CLI v54.1.0, gh CLI

---

## Project Structure

```
my-calendar/
├── app/
│   ├── globals.css          # Tailwind imports, print styles, @media print rules
│   ├── calendar/
│   │   └── page.tsx         # Calendar view: year/state dropdowns, 12-month grid, legend
│   ├── settings/
│   │   └── page.tsx         # Settings page wrapper
│   └── layout.tsx           # Root layout with Navbar
├── components/
│   ├── Navbar.tsx           # Sticky nav, mobile floating dropdown (absolute, not flow)
│   ├── MonthGrid.tsx        # Single month calendar grid (7 cols), tooltips, print center-align
│   ├── CalendarGrid.tsx     # 12-month grid layout (2 cols desktop, 1 col mobile)
│   ├── HolidayList.tsx      # National + State holiday summaries (2-col on desktop, 1-col mobile)
│   ├── PrintButton.tsx      # Print trigger
│   ├── Toast.tsx            # Toast notifications
│   └── settings/
│       ├── StateSettings.tsx    # States table: State | Weekend Days | Actions (icon-only edit)
│       ├── HolidaySettings.tsx  # Holidays table: Holiday | Type | States | Date | Day | Actions (all 6 cols always shown, horizontal scroll on mobile)
│       └── YearSettings.tsx     # Year checkboxes: 2-col grid
├── hooks/
│   └── useCalendarData.ts   # Loads data from Supabase on mount, syncs to localStorage
├── utils/
│   ├── calendarUtils.ts     # Holiday logic, date calculations
│   ├── dateUtils.ts         # Date formatting helpers
│   └── supabaseClient.ts    # Supabase instance
├── types/
│   └── index.ts             # AppData, State, Holiday, DayOfWeek types
├── supabase/
│   ├── schema.sql           # Tables: states, holidays, holiday_states, holiday_variable_dates, year_config
│   ├── seed.sql             # 16 states, 18 holidays, 13 variable dates, 2020–2030 year config
│   ├── migrations/          # Copy of schema for version control
│   └── config.toml          # Linked to Supabase project `gdvsoeeittontmvywllm`
├── public/                  # Favicon, images
├── .env.local               # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
├── tsconfig.json            # Strict mode enabled
├── tailwind.config.ts       # Default config
├── next.config.ts           # Default config
├── package.json             # Dependencies
└── README.md                # User-facing documentation
```

---

## Key Files & Their Purpose

### Calendar Display (`components/MonthGrid.tsx`)
- **Line 73:** National holiday color: `#FFA726` (orange), text: `text-[#2D3320]` (dark green)
- **Line 92:** Print center-align: `print:justify-center print:pt-0`
- **Line 119–149:** Tooltip (absolute, z-[200], positioned below cell, dark bg)

### Print Styles (`app/globals.css`)
- **Line 47–117:** `@media print` rules
- **Line 105–108:** Force print colors: `.bg-\[\#FFA726\]`, `.bg-\[\#FFD54F\]`, `.bg-\[\#D6E8B0\]`, `.bg-\[\#7A8C3F\]`, `.bg-\[\#5C6B2E\]`
- **Line 85–102:** `.calendar-grid` = 3-col layout, `.print-holiday-list` = 2-col grid

### Mobile Nav (`components/Navbar.tsx`)
- **Line 14:** `relative` on nav, `z-50` sticky
- **Line 51–69:** Mobile dropdown: `absolute top-full left-0 right-0` (floats, doesn't push content)

### Holiday Settings (`components/settings/HolidaySettings.tsx`)
- **6 columns always shown:** Holiday | Type | States | Date | Day | Actions
- **Mobile:** Table uses `overflow-x-auto`, all columns present, user scrolls horizontally
- **Filters:** Search (Holiday), dropdown (Type), search (Date), dropdown (Day)
- **Actions:** Icon-only buttons (pencil=edit, bin=delete), `p-1.5` sizing
- **Sort:** Click headers to sort by name/type/date
- **Colspan:** Updated to 6 for empty state message

### State Settings (`components/settings/StateSettings.tsx`)
- **3 columns:** State | Weekend Days | Actions
- **Actions:** Icon-only edit button (pencil), `p-1.5` sizing

### Year Settings (`components/settings/YearSettings.tsx`)
- **2-column grid:** Year checkboxes, responsive on mobile

---

## Colors & Styling Conventions

| Element | Color | Usage |
|---------|-------|-------|
| Primary (nav, buttons) | `#7A8C3F` | Buttons, active states |
| Primary Dark | `#5C6B2E` | Hover states, dark headers |
| Primary Light | `#9aad52` | Lighter accents |
| National Holiday | `#FFA726` | Calendar cells (was `#FF9800`, updated 2026-06-17) |
| State Holiday | `#FFD54F` | Calendar cells |
| Weekend | `#D6E8B0` | Calendar cells, light green |
| Text Primary | `#2D3320` | Main text, dark green |
| Text Secondary | `#5A6640` | Labels, secondary text |
| Background | `#F7F9F2` | Off-white, app bg |
| White | `#FFFFFF` | Surfaces |

**Print:** All colors forced with `!important` in CSS to preserve on print.

---

## Responsive Breakpoints

- **Mobile:** < 768px (375px in testing)
- **Tablet:** 768px–1024px (md: breakpoint)
- **Desktop:** ≥ 1024px

**Holiday table behavior:**
- All 6 columns always visible
- Mobile: horizontal scroll with `overflow-x-auto`
- No columns hidden on mobile

---

## Supabase Setup

**Project Ref:** `gdvsoeeittontmvywllm`

**Tables:**
1. **states** — 16 Malaysian states, weekend_days (TEXT[] array)
2. **holidays** — 18 holidays (national + state), type, stateIds
3. **holiday_states** — Join table (all-states cross join + specific assignments)
4. **holiday_variable_dates** — 13 variable date entries for 2026
5. **year_config** — Years 2020–2030, all enabled

**RLS:** All tables have public SELECT policy (read-only for frontend)

**Seed Data:** `supabase/seed.sql` (run via Management API when TCP ports blocked)

**Network Issue Workaround:** 
- TCP ports 5432/6543 blocked by local firewall
- Solution: Use Supabase Management REST API (`https://api.supabase.com/v1/projects/{ref}/database/query`)
- CLI token stored in Windows Credential Manager
- Combined schema + seed into single HTTPS POST request

---

## Recent Amendments (2026-06-17)

### Batch 1: Print & Settings
- Print: centered date numbers, aligned headers
- Settings h2: standardized `mb-4` across all 3 tabs
- Holiday Settings: added Day column (Mon–Sun)
- Holiday Settings: added per-column filters (Name, Type, Date, Day)

### Batch 2: Mobile & UI Polish
- Mobile nav: floating dropdown (`absolute top-full`), no page push-down
- Orange: standardized to `#FFA726` throughout (lighter than original)
- Holiday Settings: icon-only Edit/Delete buttons
- State Settings: icon-only Edit button
- Holiday Settings: all 6 columns always shown, horizontal scroll on mobile

### Final: Responsive Audit
- ✅ Desktop: all features clean and accessible
- ✅ Mobile (375px): all tables/forms responsive, scrollable tables on mobile
- ✅ Year Range: 2-col checkbox grid on both sizes
- ✅ Calendar: full-width dropdowns, responsive month grids

---

## Development Patterns

### Adding Styles
- Use Tailwind classes (v4 syntax)
- Print-specific: `print:` variant
- Responsive: `md:` for tablet+, no prefix for mobile-first
- Custom colors: Use CSS variables from `@theme {}` in globals.css

### Handling Holidays
- **Fixed dates:** Same every year (New Year's Day = Jan 1)
- **Variable dates:** Different each year (Chinese New Year calculated annually)
- See `calendarUtils.ts` for `buildMonthCalendar()`, `getHolidaysForYearAndState()`

### State Persistence
1. Load from Supabase on first mount (`useCalendarData.ts`)
2. Store in localStorage under `"my-calendar-app-data"`
3. Sync updates back to localStorage (frontend-only, no backend writes)
4. On next visit, load from localStorage

### TypeScript
- Strict mode enabled
- All types in `types/index.ts`
- No `any` usage

---

## Deployment

**GitHub:** Push to master, Vercel auto-deploys
- Latest: commit `90a1507` (feat: finalize responsive UI and mobile-friendly updates)
- Changelog: `git log --oneline`

**Vercel:**
- Org: abbywong-ews-projects
- Project: holiday-calender-state
- URL: https://holiday-calendar-hatori.vercel.app (alias)
- Build: Next.js 16.2.6 with Turbopack, TypeScript check, static prerendering
- Build time: ~12s

---

## Running Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# Then open http://localhost:3000

# Build for production
npm run build

# Deploy to Vercel
vercel deploy --prod
```

**Environment Variables (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=https://gdvsoeeittontmvywllm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-here>
```

---

## Common Tasks

### Add a New Holiday
1. Settings > Holidays > + Add Holiday
2. Enter name, select type (National/State)
3. Choose states (or all)
4. Select date type: Fixed (same year) or Variable (per year)
5. Save — data stored in localStorage

### Edit State Weekend Days
1. Settings > States > click pencil icon on state row
2. Select up to 2 weekend days (Friday/Saturday/Sunday)
3. Save

### Enable/Disable Years
1. Settings > Year Range
2. Toggle checkboxes (at least 1 must stay enabled)
3. Changes apply immediately

### Print Calendar
1. Calendar page > click Print button
2. Browser print dialog opens
3. A4 portrait, 12mm margins, colors preserved

---

## Notes for Claude

- **File encoding:** UTF-8, no BOM
- **Commit style:** Conventional commits (`feat:`, `fix:`, etc.)
- **No breaking changes:** Only additive, backwards-compatible edits
- **User's preference:** Terse responses, no trailing summaries
- **Mobile-first mentality:** Always test at 375px after layout changes
- **Print-first:** When styling dates/holidays, consider print variant
- **Data consistency:** Always update color hex values everywhere (`#FFA726` in CSS, Tailwind, types, constants)
- **Icons:** Edit = pencil, Delete = trash bin, 14px size, `p-1.5` padding
