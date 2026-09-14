# Requirements Document

## Introduction

This feature delivers a single-page marketing website for Qasim Events, a Qatar-based event activation company, intended as a 4-hour pitch demo. The site is a single route built with Next.js App Router, TypeScript, and Tailwind CSS, using anime.js v4 (ESM) for animation and Lenis for smooth scrolling. All content is static and hardcoded; there is no backend, CMS, or subpages. The page comprises exactly five sections (Hero, Trusted By marquee, Work grid, Numbers bar, Contact) with a consistent dark navy/black aesthetic and a single maroon accent. A single shared scroll-reveal animation pattern is reused across sections to prioritize consistency and correct rendering over animation variety. Event photographs are supplied later by the user as `img-000.png` through `img-012.png` in `public/work`.

## Glossary

- **Site**: The single-page Qasim Events website, encompassing all five sections on one route.
- **Scaffold_Process**: The project setup sequence that creates the Next.js application and installs dependencies (animejs, lenis, clsx).
- **Hero_Section**: The first section, presenting a full-bleed background image, animated headline, subheadline, and scroll cue.
- **Marquee_Section**: The "Trusted By" section, presenting an infinite horizontal auto-scroll of text wordmarks.
- **Work_Section**: The section presenting an asymmetric grid of 13 project cards backed by images `img-000.png` through `img-012.png`.
- **Numbers_Section**: The section presenting three statistic blocks with count-up animation.
- **Contact_Section**: The final section, presenting a closing line and two contact buttons.
- **Work_Card**: An individual cell in the Work_Section representing one project with title, venue, year, statistic, and image.
- **Scroll_Reveal_Function**: The single shared anime.js function that reveals elements when they scroll into view, reused across sections.
- **Count_Up_Animation**: The animation that increments a numeric value from a starting value to its target when a Numbers_Section block scrolls into view.
- **Smooth_Scroll**: The Lenis-driven smooth scrolling behavior applied to the Site.
- **Work_Image_Set**: The set of image files `img-000.png` through `img-012.png` located in `public/work`, referenced in project order.

## Requirements

### Requirement 1: Project Scaffold and Image Set

**User Story:** As a developer, I want the project scaffolded and dependencies installed, so that I can implement and run the Site immediately.

#### Acceptance Criteria

1. WHEN the Scaffold_Process is executed, THE Scaffold_Process SHALL create a Next.js application configured with the App Router, TypeScript, and Tailwind CSS.
2. WHEN the Next.js application has been created, THE Scaffold_Process SHALL install the animejs, lenis, and clsx packages as project dependencies.
3. IF the Scaffold_Process fails to create the Next.js application or install any of the packages animejs, lenis, or clsx, THEN THE Scaffold_Process SHALL halt and produce an error indication identifying the failed step, and SHALL NOT report the scaffold as complete.
4. THE Site SHALL reference exactly 13 images from the `public/work` directory using the sequential file names `img-000.png` through `img-012.png`.
5. WHEN a file in the Work_Image_Set is present in `public/work` with its expected name, THE Site SHALL display that image without requiring code changes.
6. IF a file in the Work_Image_Set is absent from `public/work` or does not match its expected name, THEN THE Site SHALL omit that image from display without producing an error that prevents the remaining images from displaying.

### Requirement 2: Hero Section

**User Story:** As a visitor, I want an impactful hero section, so that I immediately understand the brand and its energy.

#### Acceptance Criteria

1. WHEN the Hero_Section loads, THE Hero_Section SHALL display `img-000.png` as a full-bleed background image that covers 100% of the Hero_Section width and height without distorting the image aspect ratio.
2. IF `img-000.png` fails to load within 3 seconds, THEN THE Hero_Section SHALL display a solid background color fallback and retain all foreground content (headline, subheadline, scroll cue) as visible.
3. WHEN the Hero_Section loads, THE Hero_Section SHALL animate the headline as individual words using anime.js, with each word applying a fade from 0% to 100% opacity and a vertical translate from 20 pixels below to its final position, completing within 600 milliseconds per word and a stagger delay of 100 milliseconds between consecutive words.
4. THE Hero_Section SHALL display the subheadline on a single line with a maximum length of 120 characters and no text wrapping.
5. THE Hero_Section SHALL display a scroll cue anchored to the bottom edge of the section, remaining fully visible within the initial viewport when the Hero_Section loads.

### Requirement 3: Trusted By Marquee

**User Story:** As a visitor, I want to see the brands the company has worked with, so that I trust its track record.

#### Acceptance Criteria

1. THE Marquee_Section SHALL display the text wordmarks "Qatari Diar", "Lusail", "Qatar Tourism", "Qatar Foundation", "LULU", "Lagoona Mall", and "Doha Festival City".
2. THE Marquee_Section SHALL render each wordmark as styled text without image or logo files.
3. THE Marquee_Section SHALL render all 7 wordmarks in the specified order, separated by a fixed visual gap between adjacent wordmarks.
4. WHEN the Marquee_Section is loaded, THE Marquee_Section SHALL animate the wordmarks as a continuous horizontal auto-scroll using an anime.js loop that translates the wordmarks along the horizontal axis at a constant speed with no pause between iterations.
5. WHEN the auto-scroll reaches the end of the wordmark sequence, THE Marquee_Section SHALL loop back seamlessly so that no blank gap larger than the fixed inter-wordmark gap appears in the visible area.
6. IF anime.js fails to load or initialize, THEN THE Marquee_Section SHALL display all 7 wordmarks as static styled text remaining fully visible and readable.

### Requirement 4: Work Grid

**User Story:** As a visitor, I want to browse the company's past work, so that I can evaluate the scope and scale of its activations.

#### Acceptance Criteria

1. THE Work_Section SHALL display exactly 13 Work_Card items arranged in an asymmetric grid in which some cells span two grid units.
2. THE Work_Section SHALL map the Work_Card items sequentially to `img-000.png` through `img-012.png` in the order the project data is defined.
3. THE Work_Section SHALL display each Work_Card using the exact title, venue, year, and statistic values from the provided project data.
4. WHEN a Work_Card's top edge scrolls to within the bottom 90% of the viewport height, THE Scroll_Reveal_Function SHALL reveal that Work_Card using a clip-path inset animation transitioning from fully covered to fully visible over a duration between 400 and 800 milliseconds.
5. WHEN the Scroll_Reveal_Function reveals Work_Card items in the same viewport pass, THE Scroll_Reveal_Function SHALL delay each successive Work_Card by 80 to 150 milliseconds multiplied by its zero-based card index.
6. WHILE a visitor hovers over a Work_Card, THE Work_Card SHALL scale its image to 1.05 and slide its venue and statistic overlay from fully hidden to fully visible over a transition duration between 200 and 400 milliseconds.
7. THE Work_Section SHALL use a single reusable anime.js reveal function for every Work_Card.
8. IF a Work_Card image fails to load, THEN THE Work_Section SHALL render that Work_Card with a placeholder background and retain the title, venue, year, and statistic values without breaking the grid layout.

### Requirement 5: Numbers Bar

**User Story:** As a visitor, I want to see key performance numbers, so that I can quickly grasp the company's impact.

#### Acceptance Criteria

1. THE Numbers_Section SHALL display three statistic blocks with the values "13+ Activations", "3.75M+ Visitors at peak event", and "3 FIFA World Cup 2022 activations".
2. WHEN a Numbers_Section statistic block becomes at least 50% visible in the viewport, THE Count_Up_Animation SHALL increment that block's displayed numeric value from 0 to its target value over a duration between 1 and 3 seconds.
3. WHEN the Count_Up_Animation reaches a block's target value, THE Count_Up_Animation SHALL stop and THE Numbers_Section SHALL display the block's exact target value without further changes.
4. IF a statistic block that has already completed its Count_Up_Animation scrolls out of and back into view, THEN THE Count_Up_Animation SHALL NOT restart and THE Numbers_Section SHALL continue displaying the target value.
5. THE Numbers_Section SHALL display only visitor and activation counts and SHALL exclude any revenue or profit figures.

### Requirement 6: Contact Section

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

### Requirement 7: Visual System and Behavior

**User Story:** As a visitor, I want a cohesive, premium visual experience, so that the brand feels confident and trustworthy.

#### Acceptance Criteria

1. THE Site SHALL apply a single dark navy or black base color across all sections, with a single maroon accent color occupying no more than 10 percent of the visible surface area per viewport.
2. THE Site SHALL render body text at a minimum of 16 pixels and headings at a minimum of 32 pixels in a sans-serif typeface, with a minimum spacing of 24 pixels between content blocks.
3. THE Site SHALL exclude box-shadow on content containers and SHALL apply a maximum border-radius of 0 pixels to content containers.
4. WHEN the page loads, THE Site SHALL apply Lenis-driven Smooth_Scroll to the page.
5. WHEN a section using scroll-triggered reveals enters the viewport, THE Site SHALL reveal it using the single shared Scroll_Reveal_Function pattern reused across all such sections.
6. THE Site SHALL present all five sections in the order Hero_Section, Marquee_Section, Work_Section, Numbers_Section, Contact_Section on a single route.
