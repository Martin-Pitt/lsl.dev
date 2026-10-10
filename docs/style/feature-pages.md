# Feature page style — modelled on Category:LSL Combat2

Source: `data/derived/wiki-source/category-lsl-combat2-1973b561.txt` (local snapshot; the user's own page).
Do not fetch the live wiki.

## What makes it good

1. **Short framing intro in plain prose.** Three or four sentences: what the feature is, what it is
   *not* ("not meant to be a complete combat system on its own but to provide the tools"), context
   in the wider ecosystem, and the goal. Links woven in where a reader may want to branch
   ("See [[Combat]] for more").

2. **Rich linked text, Wikipedia-style.** Links sit *inside* natural sentences on the meaningful
   phrase, not as bare API names:
   - "Can apply damage [directly](llDamage)"
   - "Damage can have a [damage type](Damage Types) associated to it"
   - "If a script has a [damage event](on_damage) this will be called first before
     [final damage](final_damage) is applied"
   - "Scripts may [modify the actual amount of damage](llAdjustDamage) in a damage event if the region allows it"
   - "[Objects have a health property](PRIM_HEALTH)"
   - "Sensors can scan for [damageable](DAMAGEABLE) objects"
   - "in a [combat-specific public channel](COMBAT_CHANNEL)", "by a [specific ID](COMBAT_LOG_ID)"
   The concept list *is* the navigation: each bullet explains a concept and links to the API that
   implements it. Nested bullets carry caveats and constraints (e.g. scripts must manage object
   health themselves; region may restrict).

3. **Two-column dashboard above the fold** (50/50, top-aligned boxes with h2 headers):
   - Left: "Introduced are new concepts" — the rich-linked concept list (nested, including an
     ordered sub-list of options).
   - Right: "New Functions and Events" — a compact signature table (return type | linked name with
     typed params), no descriptions; then small boxes for sub-topics ("[[Combat Log]]",
     "[[Damage Types]]") each with a heading that links to the sub-page and ONE sentence.

4. **Full-width "Scripting Details" box**: the same signatures again, now each with a one-sentence
   description, which itself contains links (e.g. llDamage → link to the Damage Types section;
   llGetStartString → mentions REZ_PARAM_STRING and links llRezObjectWithParams).

5. **"Additional" box — related existing APIs grouped by host function**, with the relevant
   constants/options nested under it and an em-dash explanation:
   - llListen → COMBAT_CHANNEL, COMBAT_LOG_ID, may write if region allows
   - llSensor — filter by DAMAGEABLE (explains what counts)
   - llGetObjectDetails → OBJECT_HEALTH, OBJECT_DAMAGE, OBJECT_DAMAGE_TYPE
   - llRezObjectWithParams → REZ_DAMAGE, REZ_DAMAGE_TYPE, REZ_PARAM_STRING
   - llSetLinkPrimitiveParamsFast → PRIM_DAMAGE
   - llGetEnv → the string keys with meaning
   - llSetLinkSitFlags → SIT_FLAG_NO_COLLIDE, SIT_FLAG_NO_DAMAGE
   This is how constants are surfaced: in context, under the function that uses them, not as an
   unexplained group dump.

6. **Then normal sections**: an embedded reference table (Damage Types), Related (announcements,
   feedback), Known Issues (with links), Wishlist. `__NOTOC__` — no table of contents clutter.

## Translate to lsl.dev MDX

- Prose and concept bullets are plain Markdown with inline links on meaningful phrases:
  `Can apply damage [directly](/functions/llDamage/)`. An inline-LSL component may be used where
  the link text is code, but default to natural-language anchor text.
- `<Columns>` for the 50/50 top section; a `<Box title="…" href="…">` for the bordered h2 boxes.
- `<Signatures names={[...]} />` for the compact table (typed signature, linked name, no desc) and
  `<Signatures names={[...]} descriptions />` for Scripting Details (descriptions from definitions,
  overridable inline by a human).
- "Additional"-style nested lists are hand-written Markdown: host function link — explanation,
  nested constants with a dash explanation.
- Keep facts consistent with definitions/wiki; when copying wiki sentences keep wording exact.
- Every feature page should read like this: framing intro → concepts with woven links → APIs at a
  glance → details → related APIs/constants in context → reference tables / related / known issues.
  The Combat page should essentially be this wiki page adapted (with attribution to the wiki page).
