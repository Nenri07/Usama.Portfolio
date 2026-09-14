# Requirements Document

## Introduction

This feature delivers a single-page, heavily motion-driven marketing website for Qasim Events (Qasim Khalid), a Qatar-based event activation company. The site is a single route built with Next.js App Router, TypeScript, and Tailwind CSS v4 (CSS-first `@theme`). It presents the company's depth to a prospective client through smooth scrolling, parallax, split-text staggers, scroll-choreographed reveals, magnetic hover buttons, and a custom cursor, in the style of agency sites such as jesperlandberg.com.

The motion system is layered deliberately to avoid competing animation loops: **GSAP with ScrollTrigger is the primary animation and scroll-choreography engine**, **Lenis provides smooth scroll and is wired to drive ScrollTrigger**, and **anime.js is demoted to a secondary role for small standalone effects only** (count-up, marquee). Every animation defaults to its final, visible, correctly laid-out state, so if any motion library fails to load or initialize, all content remains fully readable — this graceful-degrade rule is non-negotiable. The site also respects `prefers-reduced-motion` by disabling non-essential motion.

To closely match the feel of high-fidelity agency sites (e.g. jesperlandberg.com), the Work section is presented as a big-type Project_List (large heading-sized text rows, one per project) rather than a card grid, and hovering a row summons a floating preview image that follows the cursor on a single full-viewport WebGL canvas (via `ogl`) with a displacement / RGB-shift warp effect. Scroll inertia is retuned to a heavier momentum, section and hero headings mask in line-by-line, and the custom cursor gains a hover state over interactive elements and project rows. Every one of these signature behaviors degrades gracefully: on touch / coarse pointers, under `prefers-reduced-motion`, when WebGL is unavailable, or when any library init fails, the page collapses to a fully readable, correctly laid-out final state (the Project_List still reads as plain text, headings render fully visible, scrolling is native).

All content is static and hardcoded in one data module; there is no backend, CMS, or subpages. The page presents its sections in a fixed order — Hero → Trusted By (Clients) → Work/Projects → Numbers/Results → Team → Contact — with a consistent dark navy/black aesthetic and a single maroon accent used sparingly. No revenue, cost, or net-profit figures appear anywhere on the public site; only visitor, winner, staff, day, and activation counts are shown. Event photographs are supplied later by the user in `public/work` and all image references degrade gracefully.

## Glossary

- **Site**: The single-page Qasim Events website, encompassing all sections on one route.
- **Scaffold_Process**: The project setup sequence that creates the Next.js application and installs dependencies (animejs, lenis, clsx, gsap, ogl).
- **Motion_System**: The layered animation architecture combining GSAP+ScrollTrigger (primary), Lenis (smooth scroll driving ScrollTrigger), and anime.js (secondary standalone effects).
- **GSAP**: The GreenSock Animation Platform, the primary animation engine, including its ScrollTrigger plugin.
- **ScrollTrigger**: The GSAP plugin that choreographs animations to scroll position, updated by Lenis scroll events.
- **Lenis**: The smooth-scroll library that both smooths page scrolling and drives ScrollTrigger updates.
- **Reduced_Motion_Preference**: The user's operating-system setting exposed as the `prefers-reduced-motion: reduce` media query.
- **Hero_Section**: The first section, presenting a full-bleed background image, animated split-text headline, subheadline, and scroll cue.
- **Clients_Section**: The "Trusted By" section, presenting an infinite horizontal auto-scroll of client, venue, and partner wordmarks.
- **Work_Section**: The section presenting the Project_List — 13 enriched projects rendered as large heading-sized text rows, with a cursor-following WebGL hover preview and graceful text fallback.
- **Project_List**: The big-type layout of the Work_Section: one large heading-sized text row per Project_Record (title, venue, year, and highlights), read top to bottom, replacing the former card grid as the primary presentation.
- **Project_Row**: A single row in the Project_List representing one Project_Record and acting as the hover target that drives the Hover_Image_Canvas.
- **Hover_Image_Canvas**: The single full-viewport fixed WebGL canvas (via `ogl`) that renders one floating preview image at a time, following the pointer with a Displacement_Effect while a Project_Row is hovered.
- **WebGL_Preview**: The floating preview image drawn on the Hover_Image_Canvas for the currently hovered Project_Row; only one is visible at a time and it warps/fades when the hovered row changes.
- **Displacement_Effect**: The shader effect applied to the WebGL_Preview — a displacement warp driven by pointer velocity and hover progress plus an RGB-channel offset (RGB shift), used on enter, leave, and while moving.
- **Line_Mask_Reveal**: The shared heading-reveal pattern that splits a heading into lines, clips each line, and translates it up into view line-by-line on scroll via GSAP + ScrollTrigger.
- **Heavy_Inertia**: The retuned Lenis smooth-scroll configuration with heavier momentum (higher duration / lower lerp) producing a buttery, weighty scroll feel while still driving ScrollTrigger.
- **Cursor_Hover_State**: The state of the Custom_Cursor while over an interactive element or Project_Row, in which it grows / changes appearance and may show a short label (e.g. "View").
- **WebGL_Support**: The runtime condition in which a WebGL rendering context can be created and the `ogl` library loads; its absence triggers the non-WebGL fallback.
- **Results_Section**: The section presenting headline statistic blocks with count-up animation (formerly the Numbers bar).
- **Team_Section**: The section presenting role-based team member cards revealed with the shared scroll-reveal pattern.
- **Contact_Section**: The final section, presenting a closing line and two contact buttons.
- **Work_Card**: An individual cell in the Work_Section representing one project with title, venue, year, service highlights, and optional counts.
- **Team_Card**: An individual card in the Team_Section representing one team role with a role title, optional name, and image.
- **Project_Record**: A single project data entry with title, venue, year, service/highlights list, and optional staff/winner/visitor/day counts.
- **Team_Record**: A single team data entry with a role title, an optional name, and an image reference.
- **Client_Entry**: A single client, venue, or partner wordmark in the Clients_Section.
- **Scroll_Reveal_Pattern**: The single shared reveal pattern (GSAP+ScrollTrigger driven) that reveals elements when they scroll into view, reused across sections.
- **Split_Text_Reveal**: The shared utility that splits a heading into words or characters and staggers their entrance animation.
- **Parallax_Effect**: The shared utility that translates an element on scroll at a rate different from the page scroll.
- **Magnetic_Button**: The shared interaction that translates a button toward the pointer while the pointer is near it.
- **Custom_Cursor**: The shared custom pointer element that replaces or augments the native cursor.
- **Count_Up_Animation**: The anime.js-driven animation that increments a numeric value from a starting value to its target when a Results_Section block scrolls into view.
- **Prohibited_Financial_Figures**: Any revenue, cost, or net-profit monetary value; these are excluded from the public Site.
- **Public_Metric**: A permitted displayed count — visitor, winner, staff, day, or activation count.
- **Work_Image_Set**: The set of image files in `public/work` referenced by the Work_Section, either by sequential name (`img-000.png` onward) or by an optional explicit path per Project_Record.

## Requirements

### Requirement 1: Project Scaffold and Image Set

**User Story:** As a developer, I want the project scaffolded with the full motion toolchain installed, so that I can implement and run the motion-driven Site immediately.

#### Acceptance Criteria

1. WHEN the Scaffold_Process is executed, THE Scaffold_Process SHALL create a Next.js application configured with the App Router, TypeScript, and Tailwind CSS.
2. WHEN the Next.js application has been created, THE Scaffold_Process SHALL install the animejs, lenis, clsx, gsap, and ogl packages as project dependencies.
3. IF the Scaffold_Process fails to create the Next.js application or install any of the packages animejs, lenis, clsx, gsap, or ogl, THEN THE Scaffold_Process SHALL halt and produce an error indication identifying the failed step, and SHALL NOT report the scaffold as complete.
4. THE Site SHALL reference project images from the `public/work` directory, mapping each Project_Record either to a sequential file name `img-000.png` onward by definition order or to an optional explicit image path defined on that Project_Record.
5. WHEN a file in the Work_Image_Set is present in `public/work` at its referenced path, THE Site SHALL display that image without requiring code changes.
6. IF a file in the Work_Image_Set is absent from `public/work` or does not match its referenced path, THEN THE Site SHALL omit that image from display without producing an error that prevents the remaining images and content from displaying.

### Requirement 2: Hero Section

**User Story:** As a visitor, I want an impactful, motion-rich hero section, so that I immediately understand the brand and its energy.

#### Acceptance Criteria

1. WHEN the Hero_Section loads, THE Hero_Section SHALL display a full-bleed background image that covers 100% of the Hero_Section width and height without distorting the image aspect ratio.
2. IF the Hero_Section background image fails to load within 3 seconds, THEN THE Hero_Section SHALL display a solid background color fallback and retain all foreground content as visible.
3. WHEN the Hero_Section loads and the Reduced_Motion_Preference is not set, THE Hero_Section SHALL animate the headline via the Split_Text_Reveal utility, fading each unit from 0% to 100% opacity and translating it vertically from 20 pixels below to its final position, completing within 600 milliseconds per unit with a stagger delay between 80 and 120 milliseconds between consecutive units.
4. THE Hero_Section SHALL display the subheadline on a single line with a maximum length of 120 characters and no text wrapping.
5. THE Hero_Section SHALL display a scroll cue anchored to the bottom edge of the section, remaining fully visible within the initial viewport when the Hero_Section loads.
6. WHERE the Hero_Section applies a Parallax_Effect to the background image, THE Hero_Section SHALL keep the headline, subheadline, and scroll cue fully readable at every scroll position.

### Requirement 3: Trusted By Clients

**User Story:** As a visitor, I want to see the clients, venues, and partners the company has worked with, so that I trust its track record.

#### Acceptance Criteria

1. THE Clients_Section SHALL display the client, venue, and partner wordmarks "Qatari Diar", "Lusail", "Qatar Foundation", "LULU", "Lagoona Mall", "Doha Festival City", "Qatar Racing Club", and "FIFA World Cup 2022".
2. THE Clients_Section SHALL render each Client_Entry as styled text without image or logo files.
3. THE Clients_Section SHALL render all Client_Entry items in the specified order, separated by a fixed visual gap between adjacent entries.
4. WHEN the Clients_Section is loaded and the Reduced_Motion_Preference is not set, THE Clients_Section SHALL animate the wordmarks as a continuous horizontal auto-scroll using an anime.js loop that translates the wordmarks along the horizontal axis at a constant speed with no pause between iterations.
5. WHEN the auto-scroll reaches the end of the wordmark sequence, THE Clients_Section SHALL loop back seamlessly so that no blank gap larger than the fixed inter-entry gap appears in the visible area.
6. IF anime.js fails to load or initialize, THEN THE Clients_Section SHALL display all Client_Entry items as static styled text remaining fully visible and readable.
7. WHILE the Reduced_Motion_Preference is set, THE Clients_Section SHALL display all Client_Entry items as static styled text without auto-scroll motion.

### Requirement 4: Work Projects List

**User Story:** As a visitor, I want to browse the company's past work as a bold, big-type project list, so that I can scan the scope and scale of its activations the way I would on a high-end agency site.

#### Acceptance Criteria

1. THE Work_Section SHALL display exactly 13 Project_Row items arranged as a vertical Project_List of large heading-sized text rows, one per Project_Record, read top to bottom.
2. THE Work_Section SHALL map each Project_Row to its preview image using the image path resolved for its Project_Record, preferring an explicit image path when defined and otherwise the sequential name by definition order.
3. THE Work_Section SHALL display each Project_Row using the exact title, venue, year, and service highlights from its Project_Record.
4. WHERE a Project_Record defines staff, winner, visitor, or day counts, THE Project_Row SHALL display those Public_Metric values.
5. THE Work_Section SHALL exclude every Prohibited_Financial_Figure from every Project_Row.
6. WHEN a Project_Row's top edge scrolls to within the bottom 90% of the viewport height and the Reduced_Motion_Preference is not set, THE Scroll_Reveal_Pattern SHALL reveal that Project_Row using the Line_Mask_Reveal so its heading text masks in line-by-line over a duration between 400 and 800 milliseconds.
7. WHEN the Scroll_Reveal_Pattern reveals Project_Row items in the same viewport pass, THE Scroll_Reveal_Pattern SHALL delay each successive Project_Row by 80 to 150 milliseconds multiplied by its zero-based row index.
8. WHILE a visitor hovers over a Project_Row and the Reduced_Motion_Preference is not set and WebGL_Support is present, THE Work_Section SHALL summon the WebGL_Preview for that Project_Row on the Hover_Image_Canvas and SHALL apply a hover emphasis to the row over a transition duration between 200 and 400 milliseconds.
9. THE Work_Section SHALL use the single shared Scroll_Reveal_Pattern for every Project_Row.
10. IF a Project_Row image fails to load or WebGL_Support is absent, THEN THE Work_Section SHALL render that Project_Row as fully readable text retaining the title, venue, year, service highlights, and any Public_Metric values without breaking the Project_List layout.

### Requirement 5: Results Numbers

**User Story:** As a visitor, I want to see key performance numbers, so that I can quickly grasp the company's impact.

#### Acceptance Criteria

1. THE Results_Section SHALL display statistic blocks with the values "3.75M peak visitors", "13+ activations", "3 FIFA World Cup 2022 activations", "7,000+ prize winners", and "12,000 balloons across 8 Qatar landmarks".
2. WHEN a Results_Section statistic block becomes at least 50% visible in the viewport and the Reduced_Motion_Preference is not set, THE Count_Up_Animation SHALL increment that block's displayed numeric value from 0 to its target value over a duration between 1 and 3 seconds, triggered through the Scroll_Reveal_Pattern.
3. WHEN the Count_Up_Animation reaches a block's target value, THE Count_Up_Animation SHALL stop and THE Results_Section SHALL display the block's exact target value without further changes.
4. IF a statistic block that has already completed its Count_Up_Animation scrolls out of and back into view, THEN THE Count_Up_Animation SHALL NOT restart and THE Results_Section SHALL continue displaying the target value.
5. THE Results_Section SHALL display only Public_Metric values and SHALL exclude every Prohibited_Financial_Figure.
6. WHILE the Reduced_Motion_Preference is set, THE Results_Section SHALL display each statistic block's exact target value without count-up motion.

### Requirement 6: Team Section

**User Story:** As a prospective client, I want to see the team behind the activations, so that I trust the company can deliver at scale.

#### Acceptance Criteria

1. THE Team_Section SHALL display one Team_Card for each Team_Record, showing the role title from that Team_Record.
2. WHERE a Team_Record defines a name value, THE Team_Card SHALL display that name alongside the role title.
3. WHERE a Team_Record does not define a name value, THE Team_Card SHALL display the role title without any placeholder or invented name.
4. THE Team_Section SHALL display a Team_Card image sourced from `public/work` for each Team_Record.
5. IF a Team_Card image fails to load, THEN THE Team_Section SHALL render that Team_Card with a placeholder background and retain the role title and any name without breaking the layout.
6. WHEN a Team_Card scrolls into view and the Reduced_Motion_Preference is not set, THE Scroll_Reveal_Pattern SHALL reveal that Team_Card using the single shared reveal pattern with a per-card stagger.
7. WHILE the Reduced_Motion_Preference is set, THE Team_Section SHALL display all Team_Card items in their final visible state without reveal motion.

### Requirement 7: Contact Section

**User Story:** As a visitor, I want a clear way to make contact, so that I can start a conversation with the company.

#### Acceptance Criteria

1. THE Contact_Section SHALL display a closing headline with a font size between 32 and 72 pixels.
2. THE Contact_Section SHALL display an Email button and a WhatsApp button positioned side by side within the same horizontal row.
3. THE Contact_Section SHALL configure the Email button with a `mailto` link using an editable email string that defaults to `hello@qasim-events.qa`.
4. WHEN a visitor activates the Email button, THE Contact_Section SHALL open the device default email client with the recipient prefilled to the configured email string.
5. THE Contact_Section SHALL configure the WhatsApp button with a `wa.me` link using an editable Qatar phone number string in international format beginning with the country code `974`.
6. WHEN a visitor activates the WhatsApp button, THE Contact_Section SHALL open the WhatsApp conversation target for the configured phone number.
7. IF the configured email string or Qatar phone number string is empty, THEN THE Contact_Section SHALL disable the corresponding button and prevent link activation.
8. THE Contact_Section SHALL exclude any input form and any text entry field.

### Requirement 8: Visual System and Behavior

**User Story:** As a visitor, I want a cohesive, premium visual experience, so that the brand feels confident and trustworthy.

#### Acceptance Criteria

1. THE Site SHALL apply a single dark navy or black base color across all sections, with a single maroon accent color occupying no more than 10 percent of the visible surface area per viewport.
2. THE Site SHALL render body text at a minimum of 16 pixels and headings at a minimum of 32 pixels in a sans-serif typeface, with a minimum spacing of 24 pixels between content blocks.
3. THE Site SHALL exclude box-shadow on content containers and SHALL apply a maximum border-radius of 0 pixels to content containers.
4. WHEN the page loads and the Reduced_Motion_Preference is not set, THE Site SHALL apply Lenis-driven smooth scrolling tuned to Heavy_Inertia (heavier momentum via higher duration and lower lerp) while Lenis continues to drive ScrollTrigger.
5. THE Site SHALL present all six sections in the order Hero_Section, Clients_Section, Work_Section, Results_Section, Team_Section, Contact_Section on a single route.
6. THE Site SHALL exclude every Prohibited_Financial_Figure from every section, displaying only Public_Metric values where counts are shown.

### Requirement 9: Motion System and Scroll Choreography

**User Story:** As a visitor, I want fluid, choreographed motion throughout the page, so that the experience feels like a premium agency site.

#### Acceptance Criteria

1. THE Motion_System SHALL use GSAP with the ScrollTrigger plugin as the primary engine for scroll-choreographed reveals and parallax.
2. WHEN the page loads, THE Motion_System SHALL integrate Lenis to drive ScrollTrigger by forwarding Lenis scroll events to `ScrollTrigger.update` and advancing Lenis from the GSAP ticker with lag smoothing disabled.
3. THE Motion_System SHALL restrict anime.js to standalone secondary effects, comprising the Count_Up_Animation and the Clients_Section marquee, and SHALL NOT use anime.js for scroll-choreographed reveals.
4. THE Motion_System SHALL provide the shared utilities Split_Text_Reveal, Line_Mask_Reveal, Parallax_Effect, Magnetic_Button, and Custom_Cursor for reuse across sections.
5. WHILE a pointer is within the magnetic radius of a Magnetic_Button and the Reduced_Motion_Preference is not set, THE Magnetic_Button SHALL translate toward the pointer, and WHEN the pointer leaves the magnetic radius THE Magnetic_Button SHALL return to its resting position.
6. WHERE the Custom_Cursor is enabled and the Reduced_Motion_Preference is not set, THE Custom_Cursor SHALL follow the pointer position across the Site.
7. IF GSAP, ScrollTrigger, or Lenis fails to load or initialize, THEN THE Site SHALL display every affected element in its final visible state with native scrolling functional, without producing an error that prevents content from displaying.
8. WHILE the Reduced_Motion_Preference is set, THE Motion_System SHALL disable non-essential motion, comprising parallax, split-text staggers, Line_Mask_Reveal, magnetic button movement, Heavy_Inertia smooth scrolling, the WebGL_Preview / Displacement_Effect, and the Custom_Cursor, and SHALL present all content in its final visible state with native scrolling.

### Requirement 10: WebGL Hover-Image Project List

**User Story:** As a visitor, I want the project list to summon a floating image that follows my cursor as I hover each project, so that the work section feels like a high-fidelity, tactile agency showcase.

#### Acceptance Criteria

1. THE Work_Section SHALL render the Project_List as large heading-sized text rows, one Project_Row per Project_Record, that remain fully readable independent of any WebGL rendering.
2. THE Site SHALL render the WebGL_Preview on a single Hover_Image_Canvas that is fixed to the full viewport and shared across all Project_Row items, rather than one canvas per image.
3. WHILE a visitor hovers a Project_Row and WebGL_Support is present and the Reduced_Motion_Preference is not set, THE Hover_Image_Canvas SHALL display that Project_Row's WebGL_Preview and SHALL update the WebGL_Preview position each frame to follow the pointer using a smoothed (eased) position.
4. WHILE the WebGL_Preview is transitioning in, out, or between Project_Row items, THE Hover_Image_Canvas SHALL apply the Displacement_Effect comprising a displacement warp driven by pointer velocity and hover progress and an RGB-channel offset.
5. THE Hover_Image_Canvas SHALL display at most one WebGL_Preview at any time, warping and fading from the previous Project_Row's image to the newly hovered Project_Row's image when the hovered row changes.
6. WHEN the pointer leaves all Project_Row items, THE Hover_Image_Canvas SHALL fade the WebGL_Preview out to fully hidden.
7. IF WebGL_Support is absent, or the WebGL context cannot be created or is lost, or the `ogl` library fails to load, THEN THE Work_Section SHALL omit the Hover_Image_Canvas and present the Project_List as fully readable text, optionally with a plain image preview via the shared image component, without producing an error that prevents content from displaying.
8. WHILE the pointer is a coarse or touch pointer or the Reduced_Motion_Preference is set, THE Work_Section SHALL NOT initialize the Hover_Image_Canvas and SHALL present the Project_List in its final readable state.
9. THE Hover_Image_Canvas SHALL cap loaded texture dimensions to a bounded maximum size and SHALL dispose the WebGL context and its GPU resources when the Work_Section unmounts.
10. WHEN the Hover_Image_Canvas initializes, THE Work_Section SHALL defer WebGL setup so that it does not block the first paint of the Project_List text.

### Requirement 11: High-Fidelity Motion Refinements

**User Story:** As a visitor, I want weighty scroll inertia, headings that mask into view line-by-line, and a cursor that reacts to what I hover, so that the whole page feels like a premium, motion-crafted experience.

#### Acceptance Criteria

1. WHEN the page loads and the Reduced_Motion_Preference is not set, THE Motion_System SHALL configure Lenis with Heavy_Inertia while continuing to forward Lenis scroll events to ScrollTrigger and advancing Lenis from the GSAP ticker with lag smoothing disabled.
2. WHILE the Reduced_Motion_Preference is set, THE Motion_System SHALL disable Heavy_Inertia smooth scrolling and present near-instant or native scrolling.
3. WHEN a heading bound to the Line_Mask_Reveal scrolls into view and the Reduced_Motion_Preference is not set, THE Line_Mask_Reveal SHALL split that heading into lines, clip each line, and translate each line upward into view line-by-line via GSAP and ScrollTrigger.
4. WHILE the Reduced_Motion_Preference is set, THE Line_Mask_Reveal SHALL render each bound heading fully visible immediately without masking motion.
5. THE Motion_System SHALL apply the Line_Mask_Reveal to the Hero_Section headline and to the section headings, reusing the single shared reveal pattern.
6. WHILE the pointer is over an interactive element or a Project_Row and the Custom_Cursor is enabled, THE Custom_Cursor SHALL enter the Cursor_Hover_State by changing its size or appearance and MAY display a short label.
7. WHEN the pointer leaves the interactive element or Project_Row, THE Custom_Cursor SHALL return to its default appearance.
8. WHILE the pointer is a coarse or touch pointer or the Reduced_Motion_Preference is set, THE Custom_Cursor SHALL remain disabled and the native cursor SHALL be used.
9. IF the Line_Mask_Reveal, Heavy_Inertia configuration, or Cursor_Hover_State fails to initialize, THEN THE Site SHALL present the affected headings, scrolling, and cursor in their final readable state with native behavior, without producing an error that prevents content from displaying.
