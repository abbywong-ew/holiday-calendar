# Jiyū-Hato: Freedom Pigeon Calendar

**自由のはと — Malaysian Holiday Calendar**

A fully-featured holiday calendar web application for Malaysian states with national and state-specific holidays. Built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

*Jiyū-Hato (自由のはと) = "Freedom Pigeon" — celebrating freedom, peace, and the joy of knowing when to celebrate.*

**Live Demo:** [https://holiday-calendar-hatori.vercel.app](https://holiday-calendar-hatori.vercel.app)

**GitHub:** [abbywong-ew/holiday-calendar](https://github.com/abbywong-ew/holiday-calendar)

**Project Folder:** `jiyuu-hato`

---

## About Jiyū-Hato 🕊️

The name celebrates **freedom** (jiyū / 自由) and **peace** (represented by the pigeon/hato / はと). The project reflects the belief that knowing when to celebrate—when to gather with loved ones, when to rest—is a fundamental freedom. The pigeon mascot embodies calm, peaceful design while guiding users through their calendar year with serenity.

---

## Features

### 📅 Calendar View
- **12-month calendar grid** with all days displayed in a clean, organized layout
- **National holidays** highlighted in orange
- **State-specific holidays** highlighted in yellow
- **Weekend highlighting** in light green (Saturday, Sunday for most states; Friday, Saturday for selected states)
- **Today indicator** with dark outline on current date
- **Interactive tooltips** showing all holidays and applicable states on hover
- **Print-optimized** A4 portrait layout with color preservation

### ⚙️ Settings Page
Three-tab management interface:

**1. Manage States**
- Edit weekend day configuration for each of the 16 Malaysian states
- Max 2 weekend days per state (Friday/Saturday/Sunday)
- Pre-configured for Malaysian states' actual weekend schedules

**2. Manage Holidays**
- Add, edit, and delete holidays
- Two date types:
  - **Fixed dates** (same every year, e.g., New Year's Day)
  - **Variable dates** (different each year, e.g., Chinese New Year)
- Assign holidays to specific states or all states
- Sortable table by name, type, and date
- Year filter to view dates in context
- Auto-scroll to form on edit

**3. Year Range**
- Toggle enabled years (2020–2030)
- At least one year must remain enabled

### 💾 Data Persistence
- **localStorage** for user edits (maintained across sessions)
- **Supabase seed data** for initial setup (16 states, 18 holidays, 11 years)
- Synced to database on first load

### 🖨️ Print Features
- Full A4 portrait layout with 12mm margins
- 3-column month grid layout
- Proper color adjustment for printing (orange/yellow/green preserved)
- Holiday list with date and day-of-week columns
- No interactive UI elements shown
- All data visible on a single page

---

## Tech Stack

- **Frontend:** Next.js 16.2.6 (App Router), React 19.2.4, TypeScript
- **Styling:** Tailwind CSS v4 with custom theme (avocado green palette)
- **Database:** Supabase PostgreSQL with Row Level Security
- **Storage:** Browser localStorage + Supabase
- **Deployment:** Vercel (automatic from GitHub)
- **CLI:** Supabase CLI for migrations

---

## Project Structure

```
my-calendar/
├── app/
│   ├── page.tsx           # Redirect to /calendar
│   ├── layout.tsx         # Root layout with Navbar
│   ├── globals.css        # Tailwind config + print styles
│   ├── calendar/
│   │   └── page.tsx       # Calendar page with dropdowns & grid
│   └── settings/
│       └── page.tsx       # Settings tabs (States, Holidays, Years)
├── components/
│   ├── Navbar.tsx         # Navigation bar
│   ├── CalendarGrid.tsx   # 12-month grid container
│   ├── MonthGrid.tsx      # Single month card with cells
│   ├── HolidayList.tsx    # Holiday summary below calendar
│   ├── PrintButton.tsx    # Print trigger
│   ├── Toast.tsx          # Notification component
│   └── settings/
│       ├── HolidaySettings.tsx  # Manage holidays (sortable, add/edit/delete)
│       ├── StateSettings.tsx    # Edit state weekend days
│       └── YearSettings.tsx     # Toggle enabled years
├── hooks/
│   └── useCalendarData.ts  # Centralized state + localStorage sync
├── types/
│   └── index.ts            # TypeScript types (State, Holiday, AppData)
├── utils/
│   ├── calendarUtils.ts    # Calendar grid builder, utilities
│   ├── dateUtils.ts        # Date formatting, month/year helpers
│   └── storageUtils.ts     # Seed data, load/save functions
├── supabase/
│   ├── config.toml         # Supabase CLI configuration
│   ├── migrations/
│   │   └── 20260520000000_init_schema.sql  # Schema migration
│   ├── schema.sql          # Database schema (tables, RLS)
│   └── seed.sql            # Seed data for 16 states + 18 holidays
├── .claude/
│   └── launch.json         # Dev server config for preview
├── public/                 # Static assets
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── next.config.ts          # Next.js config
└── README.md               # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abbywong-ew/holiday-calendar.git
   cd holiday-calendar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

---

## Supabase Setup

### Project Details
- **Project Name:** `holiday-calendar`
- **Region:** Southeast Asia (Singapore)
- **Project Ref:** `gdvsoeeittontmvywllm`

### Tables
| Table | Purpose | Rows |
|-------|---------|------|
| `states` | 16 Malaysian states + weekend config | 16 |
| `holidays` | Holiday definitions (name, type, date type) | 18 |
| `holiday_states` | Many-to-many: which states have which holidays | 244 |
| `holiday_variable_dates` | Date mapping for variable holidays per year | 13 |
| `year_config` | Enabled years (2020–2030) | 11 |

### Row Level Security (RLS)
All tables have RLS enabled with **public read-only access**. This means:
- Anyone can read holiday/state data
- Writes are disabled at the database level (edits stay in localStorage)
- No authentication required

### Schema & Seed
Run these scripts via Supabase SQL Editor or Supabase CLI:

```bash
# Push migrations
supabase db push

# Or manually:
# 1. supabase/migrations/20260520000000_init_schema.sql
# 2. supabase/seed.sql
```

---

## Holiday Data

### Seed Holidays (18 total)

**National Holidays (14):**
- New Year's Day (fixed: Jan 1)
- Chinese New Year Day 1 & 2 (variable)
- Wesak Day (variable)
- Agong's Birthday (variable)
- Hari Raya Puasa Day 1 & 2 (variable)
- Hari Raya Haji (variable)
- Awal Muharam (variable)
- Prophet Muhammad's Birthday (variable)
- Labour Day (fixed: May 1)
- National Day (fixed: Aug 31)
- Malaysia Day (fixed: Sep 16)
- Christmas Day (fixed: Dec 25)

**State Holidays (4):**
- Thaipusam (Perak, Selangor, Penang, WP KL)
- Nuzul Al-Quran (Perak)
- Perak Sultan's Birthday (Perak)
- Deepavali (All states except Kelantan & Terengganu)

**States (16):**
Johor, Kedah, Kelantan, Melaka, Negeri Sembilan, Pahang, Penang, Perak, Perlis, Sabah, Sarawak, Selangor, Terengganu, WP Kuala Lumpur, WP Labuan, WP Putrajaya

---

## Design Highlights

### Color Scheme (Avocado Green Theme)
- **Primary:** `#7A8C3F` (sage green)
- **Dark:** `#5C6B2E` (forest green)
- **Light:** `#9AAD52` (light green)
- **Background:** `#F7F9F2` (off-white)
- **National Holiday:** `#FF9800` (orange)
- **State Holiday:** `#FFD54F` (yellow)
- **Weekend:** `#D6E8B0` (pale green)

### Responsive Design
- Desktop: 3-column month grid, side-by-side settings
- Tablet: 2-column month grid, stacked controls
- Mobile: 1-column month grid, vertical Date Type layout

### Print-Optimized
- A4 portrait (210 × 297 mm)
- 12mm margins on all sides
- 3-column month grid for print
- Colors preserved with `print-color-adjust: exact`
- All data fits on one page
- Today's outline hidden in print

---

## Deployment

### Vercel
Automatically deployed from GitHub on every push to `master`:

```bash
git push origin master
# Vercel builds and deploys automatically
```

**Live URL:** [https://my-calendar-fawn.vercel.app](https://my-calendar-fawn.vercel.app)

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # Run TypeScript check
```

---

## Development

### Adding a Holiday
1. Go to **Settings > Manage Holidays > + Add Holiday**
2. Fill in name, type (National/State), and date type (Fixed/Variable)
3. Select applicable states
4. For variable dates, add dates per year
5. Click **Save Holiday**

### Editing State Weekend Days
1. Go to **Settings > Manage States**
2. Click **Edit** on a state
3. Select up to 2 weekend days (Friday, Saturday, Sunday)
4. Click **Save**

### Disabling Years
1. Go to **Settings > Year Range**
2. Uncheck years you want to disable (at least 1 must remain)
3. Changes save automatically

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Future Enhancements

- [ ] Supabase real-time sync for multi-user edits
- [ ] Authentication (email/OAuth) for personalized calendars
- [ ] Custom holiday creation by users
- [ ] Export calendar to iCal/CSV
- [ ] Dark mode theme
- [ ] Multi-language support (BM, English, Chinese)
- [ ] Holiday notifications/reminders

---

## Troubleshooting

**Print shows wrong colors?**
- Ensure "Background graphics" is enabled in print settings
- Check "Preserve colors" in browser print dialog

**Holidays not appearing after edit?**
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Clear localStorage and reload: `localStorage.clear()` in DevTools

**Today's date not highlighted?**
- Check browser system time is correct
- Outline only visible on screen, hidden in print preview

---

## License

MIT License — feel free to use and modify for personal or commercial projects.

---

## Support

For issues or questions:
- **GitHub Issues:** [abbywong-ew/holiday-calendar/issues](https://github.com/abbywong-ew/holiday-calendar/issues)
- **Supabase Support:** [supabase.com/support](https://supabase.com/support)

---

**Built with ❤️ by Claude Code** | Deployed on Vercel
