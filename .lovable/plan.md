
## Scope

Four interlocking features powered by Lovable Cloud:

1. **Auth** — three roles (driver, provider, admin) with route gating
2. **Providers backend** — admin-only CRUD replacing mock data
3. **Live GPS broadcast** — provider app pushes location, driver sees real-time movement
4. **Uber-style route** — real Google Directions polyline, animated marker follows the road

## 1. Enable Lovable Cloud

Provision Postgres + Auth. No mention of Supabase to the user.

## 2. Database schema

```
profiles (id uuid pk → auth.users, full_name, phone, created_at)
user_roles (id, user_id, role enum: 'driver'|'provider'|'admin', unique(user_id,role))
providers (id, user_id fk?, name, workshop, type, avatar, rating, verified,
           home_lat, home_lng, phone, active, created_at)
jobs (id, driver_id, provider_id, status enum, price, eta_min,
      pickup_lat, pickup_lng, dest_lat, dest_lng, created_at, completed_at)
provider_locations (provider_id pk, lat, lng, heading, speed, updated_at)
analytics_events (id, user_id, event, props jsonb, created_at)
```

RLS:
- `profiles`: self read/update
- `user_roles`: self read; admin write (via `has_role` security-definer fn)
- `providers`: public read of active rows; admin write
- `jobs`: driver and assigned provider read/write own rows; admin read all
- `provider_locations`: public read; only owning provider writes
- `analytics_events`: self insert; admin read

Realtime enabled on `jobs` and `provider_locations`.

## 3. Auth UI

- `/auth` — email/password + Google sign-in, role picker on signup (driver/provider; admin seeded manually)
- `_authenticated/` layout gate (client-only, integration-managed)
- `_authenticated/_admin/` nested gate using `has_role`
- Root `onAuthStateChange` listener invalidates router + query cache

## 4. Admin providers CRUD

`/_authenticated/_admin/providers` — table with create/edit/delete sheet, fields match schema. Server fns use `requireSupabaseAuth` + admin role check.

## 5. Replace mock data

`src/lib/mock-data.ts` callers swap to server fns that query the `providers` table (public read). Home page nearby list, provider detail sheet, track page all read from DB.

## 6. Provider GPS broadcast

- `/_authenticated/provider/broadcast` page: provider toggles "Go online", browser `navigator.geolocation.watchPosition` posts to `upsertMyLocation` server fn every 5s.
- Driver track page subscribes to realtime `provider_locations` updates for the assigned provider; updates animated marker position.

## 7. Uber-style route on map

- New `RouteMap` component (replaces/augments `LiveMap`) uses Google Directions Service (`google.maps.DirectionsService`) to fetch the real driving route between provider and driver.
- Renders the polyline as a thick branded line.
- Animated marker interpolates along the route's decoded path (not straight line). When live GPS updates arrive, marker snaps to nearest point on route.
- Camera follows marker (pan + slight zoom).
- Used on `/track/$jobId` (driver) and on provider broadcast page (reverse view).

## 8. Analytics tracking

`logEvent(name, props)` helper → `analytics_events` insert. Wire to: sign-in, SOS request, job accept, job complete, rating submit, page views on key routes.

## Technical notes

- Google Maps key already in `.env` — reused.
- Directions API must be enabled on the Google Cloud key; we'll surface a clear error in `RouteMap` if it isn't.
- All server fns live in `src/lib/*.functions.ts` with `requireSupabaseAuth`; admin-only fns check `has_role(uid,'admin')` server-side.
- `attachSupabaseAuth` already wired in `src/start.ts` (verify).

## Out of scope (ask before adding)

- Payments / escrow integration (currently UI-only)
- SMS OTP for provider phone verification
- Push notifications
- Provider mobile app (using browser geolocation for now)

## Build order

1. Enable Cloud + create schema (migration)
2. Auth pages + role gating
3. Seed admin + providers backend CRUD
4. Swap mock data → DB reads
5. Provider broadcast page + realtime subscription
6. RouteMap with Directions API, wire to track page
7. Analytics events
