# DESIGN — Ravens Week-Of Brief

## Palette (anti-slop)

| Token | Hex | Use |
|-------|-----|-----|
| Charcoal bg | `#121417` | Page |
| Panel | `#1a1d22` | Chrome |
| Card | `#22262c` | Surfaces |
| Line | `#353a42` | Borders |
| Text / white | `#f5f5f2` | Body |
| Muted | `#a8a89e` | Secondary |
| Gold | `#d4a017` | Primary accent, active tabs, big numbers |
| Good / LIVE | `#3ecf8e` | LIVE badges |
| Hot | `#e85d5d` | OUT |
| **Raven purple (one accent)** | `#4a2c7a` | Mark underline + Sunday-mode tab ring only |

Purple is otherwise banned. No purple gradients, no purple cards, no purple text flood.

## Layout

1. Top brand bar + LIVE/SYNTHETIC count pills  
2. Sunday-mode toggle (gold accent checkbox)  
3. Five tabs: Week card · Injury · Lines · Simmons/House · Sunday 107  
4. Cards with left-border angle strips (green=LIVE, gold=SYNTHETIC)  
5. Sticky-header injury table  

## Typography

IBM Plex Sans / system UI. Mono for stamps and records.

## Interaction

- Sunday mode flips body class, focuses Sunday 107 tab, stores preference in `localStorage`  
- Checklist + fifth-pick side/why persist locally — no network write except static GET  
- Badges always visible next to statuses and cards  

## Tone

Household sports desk, not marketplace. Short sentences. Stamps over vibes.
