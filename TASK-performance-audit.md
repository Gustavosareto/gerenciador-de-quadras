# Performance & Improvement Audit

## ✅ Completed Improvements
- **Booking Integrity**: Fixed race condition in `createBookingAction` using `prisma.$transaction`.
- **Booking Validation**: Added server-side validation for dates and customer names.
- **Visual Performance**: Optimized `Threads` 3D background to adapt to device pixel ratio (capped at 2x).
- **Memory Usage**: Removed aggressive `will-change` properties from `ScrollReveal` text animations.

## ⚠️ Identified Issues & Recommendations

### 1. Bundle Size
- **Issue**: The project imports `framer-motion`, `gsap`, `three.js`, `ogl`, and `@gsap/react`. This is excessive for the current visual effects.
- **Recommendation**: Consolidate animations.
    - Replace `ScrollReveal` (GSAP) with `framer-motion` (already used in `SplitText`).
    - This would allow removing `gsap` entirely, saving ~40-60KB gzipped.
    - `Threads.tsx` uses `ogl` (lightweight WebGL) which is fine, but ensure `three.js` is not imported elsewhere if not needed.

### 2. Database & Data Model
- **Issue**: No database-level exclusion constraints for bookings.
- **Recommendation**: Create a PostgreSQL migration to add an exclusion constraint using `box` or `tstzrange` to guarantee 0% probability of overlapping bookings at the database level.
- **Review**: `NotificationJob` table might need maintenance policies (archiving old jobs).

### 3. Server Actions
- **Issue**: `actions.ts` uses `any` types frequently.
- **Recommendation**: Introduce Zod for strict schema validation on all server action inputs.

### 4. Accessibility (a11y)
- **Review**: Ensure `ScrollReveal` and `SplitText` respect `prefers-reduced-motion`.
