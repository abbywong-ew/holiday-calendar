# Jiyū-Hato: Freedom Pigeon Calendar — Development Guide

**自由のはと — Malaysian Holiday Calendar**

## Project Overview

A fully-featured holiday calendar web app for Malaysian states with national and state-specific holidays. Built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

**Project Name:** Jiyū-Hato (Freedom Pigeon)  
**Folder Name:** `jiyuu-hato`

- **Live:** https://holiday-calendar-hatori.vercel.app
- **GitHub:** https://github.com/abbywong-ew/holiday-calendar
- **Repo:** abbywong-ew/holiday-calendar

## Project Identity

**Jiyū-Hato** celebrates freedom (jiyū / 自由) and peace (pigeon / はと). The mascot — a serene, peaceful pigeon — embodies calm design while serving as the visual identity of the app. The design philosophy is "Peaceful Geometry": organic forms meet geometric precision, creating a brand that feels both modern and timeless, like a beloved character similar to maneki-neko (lucky cat).

---

## Visual Identity & Mascot 🕊️

**Character:** Jiyū-Hato Pigeon  
**Design Philosophy:** Peaceful Geometry  
**Files:**
- `public/jiyuu_hato_character.svg` — Mascot illustration
- Brand colors: Sage green (#7A8C3F), Warm peach (#FFA726), Off-white (#F7F9F2)
- Style: Simple, modern, slightly stylized (hand-crafted quality)
- Use cases: App icon/favicon, marketing, UI accents, splash screens

**Mascot Characteristics:**
- Peaceful, serene expression (gentle closed eyes)
- Subtle time/calendar halo (12-point marker circle)
- Upward tail feathers (symbolizing freedom)
- Rounded, organic forms with geometric precision
- Transparent background for flexible placement
- Scales infinitely (SVG format)

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
│       ├── StateSettings.tsx    # States table: State | Code | Weekend Days | Actions
│       ├── HolidaySettings.tsx  # Holidays table: Holiday | Date | Day | Type | States | Actions
│       ├── YearSettings.tsx     # Year checkboxes: 2-col grid
│       └── ColorSettings.tsx    # Color pickers for National/State/Weekend colors
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
- **6 columns:** Holiday | Date | Day | Type | States | Actions
- **States column:** Shows 3-letter postal codes (e.g. `PRK, SGR`) or `ALL` for national holidays
- **Mobile:** Table uses `overflow-x-auto`, first column sticky on scroll, all columns present
- **Filters:** Search (Holiday), text (Date), dropdown (Day), dropdown (Type), checkbox-dropdown (States)
- **States filter:** Spreadsheet-style checkbox dropdown — shows all 16 states, "Select all / Clear", count badge when active
- **Actions:** Icon-only buttons (pencil=edit, bin=delete), `p-1.5` sizing
- **Sort:** Click headers to sort by name/type/date
- **Default form:** Type = State, DateType = Variable, no states pre-checked
- **Filter row:** Two rows — (1) Filter by Year + Export/Import right-aligned, (2) Replacement for on own row
- **Export/Import:** Export downloads CSV template with holiday names + empty date columns (per enabled year); Import updates variable dates from CSV
- **Variable dates:** "Add Date" button → "Edit Date" when editing existing entry (no deletion, just pre-fill)
- **Filter year:** Defaults to current year

### State Settings (`components/settings/StateSettings.tsx`)
- **4 columns:** State | Code | Weekend Days | Actions
- **Code column:** 3-letter Malaysian postal code (JHR, KDH, KTN, MLK, NSN, PHG, PNG, PRK, PLS, SBH, SWK, SGR, TRG, KUL, LBN, PJY)
- **Actions:** Icon-only edit button (pencil), `p-1.5` sizing
- **Edit modal:** Includes State Code field with `(Default: XXX)` hint below it; auto-uppercases, validates 2–4 letters

### Year Settings (`components/settings/YearSettings.tsx`)
- **2-column grid:** Year checkboxes, responsive on mobile

### School Holiday Settings (`components/settings/SchoolHolidaySettings.tsx`)
- **Table columns:** Name | States | [one column per enabled year] | Actions
- **Year columns:** Shows date range (`MM-DD → MM-DD`) for each year, or `—` if no range for that year
- **Mobile:** Table uses `overflow-x-auto`, first column sticky on scroll
- **Add/Edit form:** Name + States (checkboxes) + Date Ranges section
- **Date ranges:** Edit-in-place with pencil icon (no deletion, pre-fill inputs), "+ Add Range" → "Edit Range" when editing
- **Year picker:** Shows `✓` suffix for years already assigned a range
- **Data structure:** `SchoolHoliday.ranges` is `Record<year, {startDate, endDate}>` (mirrors `Holiday.variableDates` pattern)

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

## Recent Amendments (2026-06-18)

### Settings UX
- Settings tabs reordered: **Holidays → States → Year Range → Colours** (default tab: Holidays)
- "Colors" renamed to "Colours" (British spelling)
- Added **Colors/Colours tab** (`components/settings/ColorSettings.tsx`): live color pickers for National Holiday, State Holiday, Weekend colors; changes apply immediately via CSS custom properties; Reset to Defaults button

### State Codes
- Added `code: string` field to `State` type (`types/index.ts`)
- `DEFAULT_STATE_CODES` map exported from `utils/storageUtils.ts` (3-letter Malaysian postal: JHR, KDH, KTN, MLK, NSN, PHG, PNG, PRK, PLS, SBH, SWK, SGR, TRG, KUL, LBN, PJY)
- Migration in `loadData()`: existing users without `code` field get codes auto-filled
- State Settings table: added Code column
- Edit State modal: Code field with `(Default: XXX)` hint from `DEFAULT_STATE_CODES`

### Holiday Settings Table
- Columns reordered: Holiday | Date | Day | Type | States | Actions
- States column now shows 3-letter codes (`PRK, SGR, PNG, KUL`) or `ALL`
- Added spreadsheet-style **checkbox-dropdown States filter** (click-outside closes, count badge when active)

### Calendar Tooltip
- State names in hover tooltip replaced with 3-letter codes; "All states" → `ALL`

### Print Improvements
- HolidayDateTable print: font 6.5px → 8.5px, cell padding 0.5px → 2px 4px, year col 68px → 90px, line-height 1.1 → 1.4
- Print header format changed: `"Perak — 2026 Holiday Calendar"` → `"2026 Holiday Calendar - Perak"`

### Add Holiday Form
- Default type: State (not National)
- Default date type: Variable Date
- Applies to States: shown inline beside label, full list without scrollbar
- Date Type: side-by-side Fixed/Variable panels, unselected panel greyed at opacity-30
- Variable date input: `type="date"` with label `"Date (dd/mm/yyyy)"`

---

## Recent Amendments (2026-06-19)

### Variable Date & Range Editing
- **Holidays:** "Add Date" button changes to "Edit Date" when editing a variable date entry (no form deletion)
- **School Holidays:** "+ Add Range" button changes to "Edit Range" when editing a date range (no form deletion)
- Both use `editingVarYear` / `editingRangeYear` state to track active edit mode
- State clears on `cancelForm()`, `openAddForm()`, and `openEditForm()` to reset UI

### Filter Row Responsive Layout
- **HolidaySettings:** Two-row fixed layout instead of responsive flex-wrap
  - **Row 1:** Filter by Year [dropdown] | Export button | Import button (right-aligned)
  - **Row 2:** Replacement for: [dropdown]
  - No horizontal scrollbar on mobile, clean stacking
- **Filter component:** Uses `flex flex-col gap-2` at root, Row 1 uses `flex items-center gap-3` with `ml-auto` push-right

### Sticky Table Columns
- **Holidays & School Holidays tables:** First column (Holiday name / School Holiday name) now sticky on horizontal scroll
- Implementation: `sticky left-0 z-10` + `bg-white` + `border-r border-gray-200` on tbody td
- Header cells also sticky: `sticky left-0 z-10` + `bg-[#F7F9F2]` + `border-r border-gray-200`
- Hover state preserved with `group-hover:bg-gray-50` on row-body

### Settings Tab Wrapping
- `app/settings/page.tsx` tab container: removed `w-fit`, added `flex-wrap`
- All 6 tabs now wrap across multiple rows on small screens (mobile)
- Full visibility at 375px; no overflow off-screen

### Heading Alignment Polish
- **HolidaySettings & SchoolHolidaySettings:** Changed heading flex from `items-center` to `items-start`
- Removes vertical centering offset caused by taller "+ Add" button
- Aligns heading top with other settings pages (StateSettings, etc.)
- Visual consistency across all Settings tabs

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

## Completed Features

### School Holidays (✅ completed)
School holidays implemented as date ranges (start date → end date), distinct from single-day public holidays.

**Implemented:**
- ✅ Separate `SchoolHoliday` type with `ranges: Record<year, {startDate, endDate}>` (per-year date ranges)
- ✅ Display on calendar: colored cells spanning multiple days with tooltip
- ✅ Settings: separate **School Holidays tab** with table (Name | States | [Year columns] | Actions)
- ✅ States: school holidays differ by state (same approach as existing state holidays)
- ✅ Color: CSS custom property `--hol-school` with color picker in **Colours tab**
- ✅ Print: HolidayList shows school holiday ranges (start → end + day count)
- ✅ Calendar legend: checkbox toggle (default off, user can enable)
- ✅ CSV backup/restore: School Holidays CSV export with per-year start/end/duration columns

## Future Plans

### Phase 9 Roadmap
- Import/export enhancements for bulk holiday management
- Advanced filtering and search across multiple criteria
- Holiday replacement notes/details
- Calendar view options (agenda, list, grid variants)

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
