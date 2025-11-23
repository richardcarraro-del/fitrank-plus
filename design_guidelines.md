# FitRank+ Design Guidelines

## Core Architecture

### Authentication
**Required:** SSO with Apple Sign-In (iOS) and Google Sign-In. Mock in prototype with local state.

**Screens:**
- Login/Signup: SSO buttons (primary), email/password fallback, privacy/terms links
- Profile Setup (6 steps post-auth): Objetivo → Nível → Dados físicos → Tempo → Frequência → Local/Equipamentos
  - Progress indicator (X/6), "Próximo"/"Voltar" buttons
- Account: Logout (confirmation), Delete Account (double confirmation), avatar selection

### Navigation
**5-Tab Structure** with center FAB:
1. **Home** - Daily overview, streak, points
2. **Workout** - Generation & history
3. **Start Workout** (FAB) - Active session
4. **Ranking** - Academy leaderboards
5. **Profile** - Settings, achievements, subscription

**Tab Bar:** 65px height, FAB elevated 8px, Portuguese labels

---

## Screen Specifications

### 1. Onboarding (Modal Stack)
- **Welcome:** Full gradient, logo, "Treine. Compita. Evolua.", swipeable feature cards
- **Profile Setup:** Multi-step form with progress dots, ScrollView, fixed submit button

### 2. Home Tab (Default)
**Header:** Avatar (left) → Profile, "FitRank+" (center), Bell icon (right)

**Content (ScrollView):**
- Streak Card: Flame icon, "X dias seguidos", glow if >7
- Daily Workout Card: Exercise count, time, difficulty, "Ver Treino" button
- Points Summary: Weekly/monthly points, progress to achievement
- Quick Stats: Total workouts, points, academy rank (3 columns)
- Upcoming Achievement preview

### 3. Workout Tab
**Header:** "Treinos" (center), Filter icon (right)

**Content:**
- Generate Section: Gradient card, "Gerar Novo Treino", free limit indicator (X/3), "Upgrade para Premium" if locked
- History: Past workouts list (date, exercises, points, duration) → Detail modal

### 4. Start Workout (Full-Screen Modal)
**Header:** Close (left, confirms if started), "Treino em Andamento" (center), Timer (right)

**Content:**
- Exercise cards: Name, sets×reps, rest time, checkbox
- Visual progress (X/Y completed)
- Fixed "Finalizar Treino" button (enabled when all checked)
- **Completion Modal:** Points breakdown (duration × intensity + exercises × value + streak multiplier), confetti, CTAs

### 5. Ranking Tab
**Header:** Academy name (center, touchable → selector), Search (right)

**Content:**
- Period Selector: "Semana" | "Mês" | "Geral"
- Top 3 Podium: 2nd-1st-3rd layout with medals
- Leaderboard: Rank #, avatar, name, points (highlight current user)
- Fixed Position Card (if not top 10): "Sua Posição: #X", gap to next

### 6. Profile Tab
**Header:** "Perfil" (center), Settings gear (right)

**Content:**
- User Header: Avatar (editable), name, age, academy
- Subscription Card: "Plano Grátis" + "Upgrade" OR "Premium" + renewal date
- Achievements: 3-column badge grid (color = earned, gray = locked)
- Stats: Total workouts, points, best streak
- Settings List: Edit profile, Notificações, Privacidade, Ajuda, Sair (red)

### 7. Modals
**Workout Detail:** Summary, exercise list, points (if completed), "Iniciar Este Treino"
**Academy Selector:** Search bar, academy list (name, city, members, Join), "Criar Nova Academia"
**Premium Comparison:** Feature table (Grátis vs Premium), "R$ 29,90/mês", "Assinar Agora"

---

## Design System

### Colors
**Primary:**
- Primary: `#4CAF50` (CTAs, active states)
- Primary Dark: `#388E3C` (pressed)
- Secondary: `#4ECDC4` (success, secondary actions)

**Neutral:**
- Background: `#0A0E27` | Surface: `#1A1F3A` | Surface Light: `#252B4A` | Border: `#3A4268`

**Text:**
- Primary: `#FFFFFF` | Secondary: `#A0A8C9` | Tertiary: `#6B7398`

**Semantic:**
- Success: `#4ECDC4` | Warning: `#FFD93D` | Error: `#FF6B6B` | Premium: `#FFD700`

**Gradients:**
- Primary: `135deg, #4CAF50 → #66BB6A`
- Dark: `180deg, #0A0E27 → #1A1F3A`
- Premium: `135deg, #FFD700 → #FFA500`

### Typography
**System Default** (SF Pro iOS / Roboto Android)

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 32px | Bold | 40px | Screen titles |
| H2 | 24px | Bold | 32px | Sections |
| H3 | 20px | Semibold | 28px | Cards |
| Body Large | 16px | Regular | 24px | Primary text |
| Body | 14px | Regular | 20px | Secondary text |
| Caption | 12px | Medium | 16px | Labels |
| Button | 16px | Semibold | - | Buttons (0.5px spacing) |

### Spacing
`xs:4px | sm:8px | md:16px | lg:24px | xl:32px | xxl:48px`

### Components

**Cards:** Surface color, 16px radius, md padding, scale 0.98 on press

**Buttons:**
- Primary: Gradient bg, white text, 52px height, 26px radius (pill), opacity 0.8 pressed
- Secondary: Surface Light bg, Primary text, 48px height, 24px radius
- Text: No bg, Primary text, underline on press

**FAB:** 64px circle, Primary gradient, white icon (28px), shadow (0,2,0.10,2), 8px above tab bar

**Input:** Surface Light bg, 1px Border, 12px radius, 48px height, md padding, Primary border when focused

**Progress:** 6px height, Surface Light bg, Primary gradient fill, 3px radius

**Badges:** 48px circle, gradient bg (by type), white icon (24px), locked = gray 50% opacity

### Visual Feedback
- Touchables: Scale 0.98 OR opacity 0.8
- Tabs: 200ms fade
- Modals: Slide up + fade
- Selection: 10% Primary overlay
- Loading: Skeleton with shimmer
- Haptics: Workout complete, achievements

### Accessibility
- Min touch target: 44×44px
- Contrast: 4.5:1 (body), 3:1 (large text)
- Dynamic font sizes
- VoiceOver/TalkBack labels
- Semantic HTML/native controls

### Safe Area Insets
**Screens with tab bar:**
- Top: `headerHeight + xl`
- Bottom: `tabBarHeight + xl` (add 60px if position card on Ranking)

**Modals:**
- Top: `xl` (non-transparent header) OR `headerHeight + xl` (transparent)
- Bottom: `insets.bottom + xl`

---

## Critical Assets

**Generate:**
1. **Avatars (8):** Fitness-themed, diverse body types, vibrant, geometric/minimal, 256×256px transparent
2. **Badges (10):** 7-day streak (flame), 30 workouts (dumbbell), Top 3 (trophy), First workout (star), 5000 points (medal), 100 workouts (mountain), 30-day (fire), Perfect week (check), Champion (crown), Premium (diamond) — 512×512px gradient backgrounds
3. **App Icon:** Dumbbell + upward arrow/ranking, Primary gradient, 1024×1024px

**System Icons:** Navigation, actions, UI elements (SF Symbols iOS, Material Android)

### Platform Notes
- iOS: SF Symbols, HIG navigation
- Android: Material icons, bottom sheets for modals
- Tab bar: Respect safe areas
- Premium: Native subscription UI