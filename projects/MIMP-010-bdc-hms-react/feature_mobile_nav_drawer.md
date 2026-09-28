---
name: feature-mobile-nav-drawer
description: Mobile nav drawer added to AppLayout — hamburger button in top bar opens a full sidebar overlay giving access to all nav items including primary:false ones
metadata: 
  node_type: memory
  type: project
  originSessionId: 98457b54-ef15-4b68-9010-f2a1df4356dd
---

## Mobile Navigation Drawer — AppLayout

**Problem fixed (2026-05-25):** Mobile bottom tab bar only showed `primary !== false` items (max 5). Items marked `primary: false` — Lab Queue, Doctor Queue, Expenses, Reports, Accounting, Users, Doctors — were inaccessible on mobile.

**Why:** Desktop sidebar shows all items; mobile had no fallback for hidden items. Admin users on mobile couldn't reach Accounting, Reports, etc.

**How to apply:** The drawer is the mobile equivalent of the desktop sidebar. If you add a new nav item marked `primary: false`, it will automatically appear in the mobile drawer without any extra work.

---

## Implementation

**File:** `src/components/layout/AppLayout.jsx`

### New: `MobileDrawer` component
Left-slide overlay (z-50), width `w-72`, `bg-[#003344]`. Shows:
- Logo + Bengali centre name header with `×` close button
- Full grouped nav (all items, with group section labels — same as desktop sidebar)
- User avatar / name / role + Logout button at bottom
- Backdrop (z-40, `bg-black/50 backdrop-blur-sm`) — click closes drawer
- Nav link click automatically closes drawer

Transition: `translate-x-0` when open, `-translate-x-full` when closed (`duration-200`).

### Updated: `MobileTopBar`
Added `onMenuOpen` prop. Renders a hamburger `<Menu size={20}>` button on the left side before the page title. Replaces the BDC logo that was there before (logo moved into drawer header only).

### Updated: `AppLayout`
```js
const [drawerOpen, setDrawerOpen] = useState(false);
// ...
<MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} navItems={navItems} user={user} onLogout={handleLogout} />
<MobileTopBar title={pageTitle} action={mobileAction} onMenuOpen={() => setDrawerOpen(true)} />
```

## Bottom tab bar unchanged
`MobileBottomNav` still shows the primary items for quick one-tap access. The drawer complements it — it does not replace it.
