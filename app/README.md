# Personal Hub (Android)

Your reading topics, notes, Instagram messages and phone screen time in one quiet app. Tabs:
Today (screen time), Messages, Library, Upskill and Notes. Your topics and notes are stored on the phone.

All topic content is fetched from the internet the first time you open a topic, then saved on the
phone for offline reading (refresh button in the top right of a topic):

| Tab in a topic | Source |
| --- | --- |
| Read | Full Wikipedia article, split into sections (CC BY-SA 4.0) |
| Books | Open Library search by author or subject, with a description for each book |
| Quotes | Wikiquote (CC BY-SA 4.0), can be saved as a note |
| News | Google News RSS search; articles open in the browser |
| Notes | Your own notes |

Add any topic you want to learn about with **Add topic** (a subject or a person/author) and it gets the
same treatment. The search terms for the built-in topics are in `src/seed.ts`.

## Messages (Instagram)

The Messages tab shows Instagram's own website inbox (`instagram.com/direct/inbox`) inside the app, signed in
with your personal account, so you can read and send DMs without the Instagram app installed.
Why not the official API: it only supports Professional accounts, can only reply within 24 hours, cannot start
new chats or groups, and needs a server for live alerts.

- Settings has **Messages only** (default on): if the page tries to open the feed, explore or reels it is sent back to the inbox.
- The phone's back button goes back inside Instagram first.
- No notifications while the app is closed, and photos/video uploads depend on Android's file picker.
- Untested against the real Instagram site: sign-in, any security check and the guard have not been tried yet.
- The clickable design is in `../index.html`.

## Status

Checked on this Mac (2026-10-31):
- `npm run typecheck` passes.
- The Android JS bundle builds (`npx expo export --platform android`).
- A debug APK builds, and it contains the Kotlin usage-stats module and the INTERNET, usage-access and app-name permissions.
- The fetch code (`src/content.ts`) was run against the live Wikipedia, Wikiquote, Open Library and Google News endpoints for four topics.

Not checked yet: the app has never been run on a phone or an emulator, so the screens, the usage-access
flow and the real screen-time numbers are unverified.

## Run it on your phone

Tools (already installed under your home folder): Node in `~/.local/node`, JDK 17 in `~/.local/jdk-17`,
Android SDK in `~/Library/Android/sdk`. A new terminal picks them up from `~/.zshrc`.

1. On the phone: Settings, About phone, tap Build number 7 times. Then Developer options, turn on USB debugging. Plug it in and accept the prompt.
2. In this folder: `npm run android` (the first run takes a while, later runs are quick).
3. Open the app, go to Today and tap **Allow usage access**. Switch on Personal Hub in the list and come back.

Screen time uses a small native module (`modules/usage-stats`, Kotlin), so the app needs this build.
Expo Go cannot run it. In Expo Go the Today screen shows sample numbers instead.

## Layout

- `app/` screens (Expo Router): `(tabs)` for the four tabs, `topic/`, `note/`, and the add and settings modals
- `src/content.ts` the fetchers and parsers; `src/contentStore.tsx` the on-phone cache
- `src/store.tsx` topics, notes and reading progress (AsyncStorage); theme, shared UI, charts and the usage hook
- `modules/usage-stats/` Android UsageStatsManager wrapper: permission check, settings shortcut, 7 days of usage

## Known limits

- Wikiquote lines are cleaned with simple rules, so an occasional citation or a misattributed quote can slip through. Check the source.
- News results are search results, not curated; some are off topic. Articles are links only, their text is not copied.
- Screen time is the time apps were in the foreground (from usage events). It can differ slightly from Digital Wellbeing.
- The module asks for `QUERY_ALL_PACKAGES` to show app names. Fine for a personal build, restricted on Google Play.
