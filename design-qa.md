# Visual QA — Zaynabxon portfolio

final result: passed

## Source and evidence

- Selected reference: Shahnoza’s existing cinematic entrance, adapted to Zaynabxon as requested. Source capture: `C:/Users/DELL/Desktop/orbit-assets/previews/mega-intro-mobile.png`.
- Implementation: `http://127.0.0.1:5175/`. Entrance capture: `C:/Users/DELL/Desktop/orbit-assets/previews/zaynabxon-polished-mobile-intro.png`.
- Actual side-by-side comparison: `C:/Users/DELL/Desktop/orbit-assets/previews/zaynabxon-intro-comparison.png` (source on left, implementation on right). Both source and implementation are 390 × 843 pixels from a 390 × 844 CSS viewport; they were placed unscaled on a 780 × 843 analysis sheet. No density rescaling was needed. Both captures show the Russian signature phase. The exact camera-animation time differs slightly, which accounts for the glass ribbon’s vertical position.
- New homepage: `C:/Users/DELL/Desktop/orbit-assets/previews/zaynabxon-polished-desktop.png`, 1280 × 900; dark variant: `zaynabxon-polished-dark.png` in the same folder.
- Mobile homepage and contact captures: `zaynabxon-polished-mobile.png`, `zaynabxon-polished-mobile-contact.png` in that folder. The browser’s JPEG capture is scaled from the 390 × 844 CSS viewport to 375 × 811 pixels when the scrollbar is present. Geometry checks used CSS coordinates rather than raster measurements.
- Baseline before visual work: `C:/Users/DELL/Desktop/orbit-assets/previews/zaynabxon-light-desktop.png`. The editorial homepage is an intentional redesign requested by the user, not a pixel clone of Shahnoza’s homepage. Profile facts and section order are retained.

## Required visual surfaces

- **Typography:** local Unbounded and Manrope match the reference entrance. Local Caveat provides the handwritten signature and selected homepage, process, Stories and contact accents. Zaynabxon’s longer first name fits both entrance lines without clipping. Body text was increased for mobile reading. DOM checks found no clipped headings, paragraphs, buttons or links across UZ/RU/EN at 320, 768 and 1280 px.
- **Spacing/layout:** the reference’s centered entrance, corner frame, upper skip control and bottom progress row are retained. The homepage now places the portrait beside the value proposition on desktop and stacks them on phones. Large empty settings cards and repeated placeholder galleries were removed. Four deliverables form a two-column mobile grid; navigation remains accessible in a bottom dock.
- **Color/tokens:** beige light surfaces and burgundy accents; deep burgundy dark surfaces and pale rose accents. Calculated contrast is 4.74:1 for light body text, 6.70:1 for the primary light button, 9.41:1 for dark body text, and 10.67:1 for muted entrance text against its base plate. The actual entrance image is dark behind its text.
- **Images:** the reference’s real burgundy-glass raster asset is reused, not approximated. The provided portrait loads at native width 1024; the real Space Academy diploma at 1800. The portrait crop retains the face; the full certificate is contained and opens uncropped. JPEG softness in the proof captures comes from browser capture compression. Important typography is readable at the native comparison size, so an additional cropped comparison was unnecessary.
- **Copy:** localized copy describes SMM/content marketing, creative briefs, coordination and review. The supplied facts remain 3 years’ experience, age 23, six skills and three named courses. The wording does not claim she personally films/edits everything or invent clients, conversions or revenue. Missing project examples have one explicit pending state.

## Findings and iteration history

1. **[P1, resolved] First-screen hierarchy.** Baseline settings/contact/skill cards displaced the main proposition below the fold. Replaced with a large portrait and adjacent headline, copy and CTA. Evidence: final desktop and mobile homepage captures.
2. **[P2, resolved] Portrait annotation.** First implementation rotated a long annotation along the edge, clipping its copy. Moved it horizontally above the name with a small rotation. Evidence: final homepage captures in both themes.
3. **[P2, resolved] False card affordance.** Decorative arrows implied that the informational deliverables opened something. Removed those arrows; kept actual links/buttons where an action exists. Evidence: `zaynabxon-polished-process.png`.
4. **[P2, resolved] Mobile school-name spacing.** Hiding the desktop line break joined “SpaceAcademy.” Added a literal space. Verified in the mobile certificate view.
5. **[P2, resolved] Small mobile copy.** Increased hero/body/deliverable text and checked wrapping at 320/390 px. Final mobile screenshot and nine responsive language checks show no horizontal overflow.

The final reference/implementation comparison has no actionable P0/P1/P2 differences. Changes to monogram, name, profession and manifesto are intentional personalization. No remaining P3 issue requires blocking handoff.

## Interaction and technical checks

- Entrance automatically completes after 4.6 seconds on desktop and phone-sized viewports; its signal/name/signature/curtain phases were captured in sequence.
- Skip button and Escape close the intro, restore scrolling and return focus. Replay returns focus to its invoking button.
- Certificate opens in a native modal, closes by Escape/button, restores the trigger focus and body scrolling.
- Language and theme controls work. All internal anchor destinations exist. Telegram, phone and email links point to the supplied Zaynabxon contacts.
- Both visible images loaded. Fresh page reload and interaction checks produced zero console errors or warnings.
- TypeScript production build, Vite build and ESLint on changed TS/TSX files pass. Build prints the pre-existing Browserslist dataset-age notice.
- Server listens on `0.0.0.0:5175`; `http://192.168.0.103:5175/` returns HTTP 200 with the correct portfolio.

## Limits and handoff

- Browser viewports were tested; physical phone hardware and another Wi-Fi client were not directly controlled.
- Reduced-motion support is implemented: automatic intro is skipped, optional replay uses a static composition, and decorative motion is disabled. OS-level reduced-motion preference was not changed for testing.
- Public deployment is outside this turn. The local preview stays running; the LAN address requires the same network as the computer.

## Implementation checklist

- [x] Adapt reference entrance and local assets.
- [x] Rewrite localized editorial copy without inventing facts.
- [x] Improve layout, handwriting accents and motion.
- [x] Resolve P1/P2 findings and recapture.
- [x] Verify primary interactions, responsive layouts, console and build.

final result: passed
