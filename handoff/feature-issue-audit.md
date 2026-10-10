# Feature pages vs. GitHub issues #10–#33: audit

Sources: the slua.dev feature issues (https://github.com/Martin-Pitt/slua.dev/issues/10 and sub-issues #11–#33), `src/data/feature-clusters.json`, `src/pages/features/[id].astro`, and the slua.dev pages in `slua.dev/src/content/docs/features/` (read-only; most are stubs, so their notes were used as extra asks where they add detail). SLua names are translated to LSL: `ll.StartObjectAnimation` is llStartObjectAnimation, `ll.RezWithParams` is llRezObjectWithParams, `ll.GetStaticPath` is llGetStaticPath, and SLua `LLEvents` subscribe/unsubscribe maps to LSL state handlers plus removing an event's source.

Status: **met** / **partial** / **missing**, before this change, then after. "Section" means a section of `/features/<id>/`. A **Planned** entry is a labelled guide, recipe or sub-page that hasn't been written yet. It shows up in a section's "See also" row in grey italics with no link (new `planned` link kind in `FeatureLink`, the template and `test_links_resolve`). "Script library" links point to the local wiki archive's Cat* example-script listings.

## #10 Features (layout, applies to all pages)

| Ask | Before | After | Evidence |
|---|---|---|---|
| Portal or dashboard made of lists and links | met | met | Each section shows an API grid, constant groups and a See also row (`[id].astro`) |
| Minimal, easy-to-read paragraphs | met | met | At most 3 intro paragraphs and 2 paragraphs per section, enforced by `test_sections_are_short` |
| Heading structure | met | met | One h2 per section, a section TOC, footer h2s |
| Wide page layout | met | met | `--sl-content-width: 84rem` on feature pages |
| Two-column layout like Combat2 | met | met | `column-count: 2` at 72rem and wider |
| Concepts at a high level, as a mental model | met | met | The intro on each page |
| Sub-pages for depth | partial | met | Before: only wiki-archive links. After: Planned guide/recipe/sub-page entries on 19 pages |

## #11 Animesh: 2 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Explain Animesh concepts | met | met | Intro: rigged mesh with own skeleton, Animated Mesh option, no permission needed |
| Link APIs such as llStartObjectAnimation | met | met | Play animations section: llStartObjectAnimation, llStopObjectAnimation, llGetObjectAnimationNames |

## #12 Avatars: 2 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| High-level scripting concepts | met | met | Intro: request permission, then run_time_permissions; sections for identity, permissions, attachments, sitting, animations, teleport (matches the slua.dev stub headings) |
| Link the relevant APIs | met | met | 7 sections with API grids and constant groups |

## #13 Camera: 6 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Camera concepts | met | met | Intro: one camera per avatar, controlled by the viewer |
| Sit target | met | met | Sit camera section: llSitTarget, llSetCameraEyeOffset, llSetCameraAtOffset, llSetLinkCamera |
| Camera params | met | met | Scripted camera section: llSetCameraParams, CameraParam group |
| Attachments | partial | met | Intro now says PERMISSION_CONTROL_CAMERA is "automatically granted for attached or sat-on objects" (definition text) |
| Sitting objects | met | met | Sit camera section, plus the same auto-grant sentence |
| List the relevant APIs | met | met | 4 sections |

## #14 Combat: 3 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| A dashboard like Combat2 | met | met | 6 sections; links to Category:LSL Combat2, Combat Log, Damage Types |
| Generalised as the current standard | met | met | Intro: "Combat (originally Combat2) is the standard way…" |
| Explain concepts, link all APIs | met | met | on_damage/llAdjustDamage/final_damage flow, health, combat log, REZ_DAMAGE |

## #15 Communications: 3 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| High-level rewrite, not longform | met | met | 8 short sections (the slua.dev draft is longform) |
| Link the relevant APIs | met | met | Chat, link messages, LSD, HTTP, HTTP-in, email, viewer |
| Longer articles as sub-pages | missing | met | Planned: "Guide: listeners and channels", "Guide: an object as a web server" (the slua.dev stub notes ask for a "web server" framing) |

## #16 Data Storage: 3 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Concepts for large scripts and bulk data | met | met | Intro rule of thumb comparing size, lifetime and audience |
| Link the relevant APIs | met | met | Memory, LSD, experience KVP, notecards, object properties, HTTP |
| Sub-pages for longform | missing | met | Planned: "Guide: choosing where to store data" |

## #17 Data Transmission: 5 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Typed values (numbers, UUIDs, vectors…) | met | met | Intro and Lists section: llList2* functions, typecasts; Keys section |
| Tables and nested structures | met | met | LSL has no tables; JSON section covers nested objects and arrays |
| Sending to scripts, services, storage | met | met | Intro: chat, link messages, LSD, notecards, HTTP |
| Link the relevant APIs | met | met | 7 sections |
| Sub-pages for longform | missing | met | Planned: "Guide: sending nested data as JSON", "Guide: parsing strings and typecasting fields" (the slua.dev "Parsing Strings" stub) |

## #18 Dialog: 5 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Concepts | met | met | Intro: a dialog is a listener plus a prompt |
| Simple at first, complex later | met | met | Intro: multi-page menus, several users, timeouts |
| Link the relevant APIs | met | met | llDialog, llTextBox, listen handling, touch, other prompts |
| Guides/recipes for different dialog types | partial | met | Had Dialog Menus and DialogPlus. Added Script library: dialogs (CatDialogs) and Planned "Recipe: multi-page dialog menu" |
| Prim HUD as an alternative | partial | met | Was in the intro text only. Added Script library: HUDs (CatHUD) and Planned "Guide: building a prim HUD" |

## #19 Effects: 6 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Particle systems | met | met | Section with 4 constant groups |
| Hover text | met | met | Section: llSetText, PRIM_TEXT |
| Texture animations | met | met | Section: llSetTextureAnim, TextureAnimMode |
| Link the relevant APIs | met | met | 5 sections |
| Guides/recipes for effects | missing | met | Script library: particles (CatParticles); Planned "Recipe: particle effect presets" |
| Technical mesh from Blender plus texture animation | met | met | Intro paragraph 2; Planned "Guide: technical mesh with texture animation" added for depth |

## #20 Environments: 3 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| EEP concepts | met | met | Intro names the Environmental Enhancement Project |
| Link the relevant APIs | met | met | Read, parcel/region, per-avatar, weather sections |
| Guides on controlling or replacing environments | missing | met | Wiki "llSetEnvironment parameters"; Planned "Guide: changing and replacing an environment" |

## #21 Events: 3 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Concepts | met | met | Intro: event driven, queue, short handlers |
| Link the relevant APIs | met | met | States, timers, changed, detection, sensors, script health |
| Guide on subscribing/unsubscribing (SLua LLEvents) | missing | met | Translated to LSL. New States paragraph: no runtime subscription; change state or use llListenRemove, llSensorRemove, llSetTimerEvent(0.0). Planned "Guide: switching event handlers with states" |

## #22 Experience: 3 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Concepts | met | met | Intro: accept once, compile with the experience selected |
| Link the relevant APIs | met | met | Permissions, details, KVP, abilities |
| Guides/resources on creating and scripting experiences | partial | met | Had Category:Experience Tools. Added Planned "Guide: creating an experience and compiling scripts to it". Knowledge Base not linked (remote) |

## #23 Input: 3 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Engine-style overview of input | met | met | Touch, click actions, keyboard/mouse, gamepad (with the slua.dev viewer-support caveat) |
| Link the relevant APIs | met | met | 5 sections |
| Guides/recipes | missing | met | Script library: touch detection; Planned "Recipe: buttons on one prim with touch positions", "Guide: capturing controls for a vehicle or weapon" |

## #24 Parcels & Regions: 4 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| How land is owned and divided | met | met | Intro: estates, regions, parcels, each with an owner and settings |
| Scripting perspective | met | met | Intro paragraph 2: object must be owned by the land owner, group or estate manager |
| Link the relevant APIs | met | met | Moderation, parcels, regions, estates |
| Guides/recipes | missing | met | Script library: region and parcel; Planned "Guide: parcel and region scripting rights" |

## #25 Linksets: 3 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Concepts | met | met | Intro: root, link numbers, seated avatars, Link variants |
| Link the relevant APIs | met | met | 5 sections |
| Guides/recipes | missing | met | Script library: rezzers; Planned "Recipe: finding prims by name" |

## #26 Math: 7 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| What math is possible in SL | met | met | Intro and sections (basic, trig, vectors, quaternions, random, interpolation; matches the slua.dev outline) |
| Link the relevant APIs | met | met | 6 sections |
| Guides/recipes | missing | met | 4 Planned recipes below |
| Perlin noise maps | partial | met | Mentioned in intro; Planned "Recipe: Perlin noise maps" |
| Projectile trajectories | partial | met | Planned "Recipe: projectile trajectories" |
| Physics integration/simulation | partial | met | Planned "Recipe: numeric integration for custom physics" |
| Simple IK via trigonometry | partial | met | Planned "Recipe: simple inverse kinematics with trigonometry" |

## #27 Money: 3 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Concepts | met | met | Intro: receiving needs no permission; PERMISSION_DEBIT to pay out |
| Link the relevant APIs | met | met | Receiving, paying out, vendors |
| Guides/recipes | missing | met | Script library: money; Planned "Recipe: vendor with refunds" |

## #28 Movement: 5 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Non-physical movement | met | met | Section |
| Physical movement | met | met | Section, plus vehicles |
| Keyframed (dynamic) motion | met | met | Section with 4 constant groups |
| Link the relevant APIs | met | met | 6 sections |
| Guides/recipes | missing | met | Script library: vehicles; Planned "Recipe: door or platform with keyframed motion", "Guide: tuning a vehicle" |

## #29 Pathfinding: 5 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Concepts | met | met | Intro: navmesh, two approaches |
| Link the relevant APIs | met | met | 5 sections |
| Guides/recipes | missing | met | Planned "Recipe: following a static path with keyframed motion", "Recipe: A* search over a grid" (A* and grid ideas from the slua.dev notes) |
| Character capsules are limiting | met | met | Intro: "a physics capsule the region steers… limited in movement and physics" |
| Light use through llGetStaticPath | met | met | "Static paths (recommended)" is the first section |

## #30 Physics: 5 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Concepts | met | met | Intro |
| Overlap with movement is fine | met | met | Forces section links Movement; both pages list impulses |
| Physics materials and settings | met | met | Mass, shape and materials section: llSetPhysicsMaterial, PhysicsMaterialPreset |
| Link the relevant APIs | met | met | 6 sections |
| Guides/recipes | missing | met | Script library: physics; Planned "Guide: physics materials" |

## #31 Prims: 4 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Setting prim params | met | met | Primitive params section: PRIM_LINK_TARGET, PrimParam groups |
| Which properties prims have | met | met | Intro list; shape, faces, light, inventory, permissions sections |
| Link the relevant APIs | met | met | 8 sections |
| Guides/recipes | missing | met | Script library: prims; Planned "Guide: primitive params rule lists" |

## #32 Sound: 7 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Concepts | met | met | Intro: attached vs triggered sounds, volume range |
| Playing, looping, triggering APIs | met | met | llPlaySound, llLoopSound, llTriggerSound(Limited), Link variants |
| Every other aspect (volume, radius, preload, sync, parcel music) | met | met | 4 sections |
| Collision sounds | met | met | llCollisionSound |
| REZ_SOUND and REZ_SOUND_COLLIDE through llRezObjectWithParams | met | met | Collision sounds section items and text |
| Recipe: random sound from a list of keys | missing | met | Planned "Recipe: trigger a random sound from a list of keys" |
| Guide: start-loop-end systems | partial | met | Concept was already in the Queueing section; Planned "Guide: start-loop-end sounds for engines and weapons" |

## #33 Textures & Materials: 10 asks
| Ask | Before | After | Evidence |
|---|---|---|---|
| Textures | met | met | Section |
| PBR materials | met | met | Section: llSetRenderMaterial, PRIM_GLTF_*, GLTFOverride |
| Colors/alpha | met | met | Section with AlphaMode |
| Texture animations, linking to Effects | met | met | Section links Effects |
| Blinn-Phong | met | met | Section: PRIM_NORMAL, PRIM_SPECULAR, PRIM_BUMP_SHINY |
| PBR vs Blinn-Phong offsets/scaling/rotation | met | met | Intro paragraph 2 |
| Everything on a face | met | met | Also reflection probes and prim media |
| Link the relevant APIs prominently | met | met | API grids in each section |
| Don't blow up the article | met | met | 7 short sections |
| Sub-pages for details | missing | met | Planned "Guide: Blinn-Phong and PBR offsets, repeats and rotation", "Guide: PBR materials and glTF overrides" |

## Summary

| Issue | Asks | Met before | Met after |
|---|---|---|---|
| #10 Layout | 7 | 6 | 7 |
| #11 Animesh | 2 | 2 | 2 |
| #12 Avatars | 2 | 2 | 2 |
| #13 Camera | 6 | 5 | 6 |
| #14 Combat | 3 | 3 | 3 |
| #15 Communications | 3 | 2 | 3 |
| #16 Data Storage | 3 | 2 | 3 |
| #17 Data Transmission | 5 | 4 | 5 |
| #18 Dialog | 5 | 3 | 5 |
| #19 Effects | 6 | 5 | 6 |
| #20 Environments | 3 | 2 | 3 |
| #21 Events | 3 | 2 | 3 |
| #22 Experience | 3 | 2 | 3 |
| #23 Input | 3 | 2 | 3 |
| #24 Parcels & Regions | 4 | 3 | 4 |
| #25 Linksets | 3 | 2 | 3 |
| #26 Math | 7 | 2 | 7 |
| #27 Money | 3 | 2 | 3 |
| #28 Movement | 5 | 4 | 5 |
| #29 Pathfinding | 5 | 4 | 5 |
| #30 Physics | 5 | 4 | 5 |
| #31 Prims | 4 | 3 | 4 |
| #32 Sound | 7 | 5 | 7 |
| #33 Textures & Materials | 10 | 9 | 10 |
| **Total** | **107** | **80** | **107** |

Still open: none of the Planned guides and recipes is written yet. Each one is a candidate sub-page. The Experience Knowledge Base isn't linked because external links were out of scope.

Verification: `npm run test:data` (38 OK), `npm run check` (0 errors), `npm run build` (4090 pages), `npm run test:links` (0 broken local destinations, 0 remote assets).
