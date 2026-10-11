# Content ideas: Guides and Recipes

A backlog of Guide and Recipe ideas for lsl.dev, mined from the local wiki snapshot (`data/sources/wiki-English.xml` and `wiki-supplement-*.xml`). These are ideas, not drafts. No network requests were made to the wiki.

- **Recipe**: a short step-by-step how-to, such as making a door or a light switch.
- **Guide**: a long-form article or tutorial, such as link numbers or interpolation.
- **Wiki sources** are page titles from the snapshot, for authors to consult. The live page is `https://wiki.secondlife.com/wiki/<Title>`; don't link the `/wiki/` archive.
- **Status**: *Covered* means an lsl.dev page already exists. *Stub exists* means a recipe stub is waiting to be written. *Planned* means a feature page already has a `<Planned>` entry for it. *Partly covered* means a fundamentals or feature page touches on the topic. A blank status means the idea is new.

## 1. Summary

| | High | Medium | Low | Total |
|---|---|---|---|---|
| Recipes | 33 | 47 | 27 | 107 |
| Guides | 26 | 30 | 18 | 74 |
| **All** | 59 | 77 | 45 | **181** |

Status: 132 new, 4 recipe stubs, 34 planned on feature pages, 5 covered, 6 partly covered.

### Top 20 suggested next pages

The four recipe stubs come first, then the most common beginner and intermediate needs that don't have a page yet.

| # | Title | Type | Features | Status |
|---|---|---|---|---|
| 1 | Make a door | Recipe | movement, prims | Stub exists: [Make a door](../src/content/docs/recipes/door.mdx) |
| 2 | Light switch | Recipe | prims, input | Stub exists: [Light switch](../src/content/docs/recipes/light-switch.mdx) |
| 3 | Give an item on touch | Recipe | inventory, input | Stub exists: [Give an item on touch](../src/content/docs/recipes/give-item-on-touch.mdx) |
| 4 | Floating text label | Recipe | prims | Stub exists: [Floating text](../src/content/docs/recipes/floating-text.mdx) |
| 5 | Listen for chat commands | Recipe | communications | New |
| 6 | Simple dialog menu with a timeout | Recipe | dialog, communications | New |
| 7 | Reading a configuration notecard | Recipe | inventory, data-storage | Planned on [inventory](../src/content/docs/features/inventory.mdx): "Recipe: reading a configuration notecard" |
| 8 | Tip jar | Recipe | money | New |
| 9 | Single-item vendor | Recipe | money, inventory | New |
| 10 | Rez an object in front of you | Recipe | inventory, prims | New |
| 11 | Sit target and sit animation (pose ball) | Recipe | avatar, animesh | New |
| 12 | Play an animation on the wearer | Recipe | avatar | New |
| 13 | Save settings in linkset data | Recipe | data-storage | New |
| 14 | Repeating timer and countdown | Recipe | time, events | New |
| 15 | Link messages between scripts | Recipe | communications, linkset | New |
| 16 | Listeners and channels | Guide | communications | Planned on [communications](../src/content/docs/features/communications.mdx): "Guide: listeners and channels" |
| 17 | Vectors and rotations | Guide | math | New |
| 18 | Script memory | Guide | script | Partly covered: [fundamentals/memory](../src/content/docs/fundamentals/memory.mdx) |
| 19 | Permissions explained (runtime and inventory) | Guide | avatar, inventory | New |
| 20 | Choosing where to store data | Guide | data-storage | Planned on [data-storage](../src/content/docs/features/data-storage.mdx): "Guide: choosing where to store data" |

## 2. Recipes by feature area

Each idea appears once, under its first feature area; the Features column lists all of its areas. Within each group, ideas are sorted by priority.

### animesh

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Animesh: play and switch object animations | medium | Start, stop and swap the animations on an animesh object. | animesh | llStartObjectAnimation; llGetObjectAnimationNames; Animesh User Guide |  |

### avatar

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Get an avatar's name or display name from a key | high | Look up a name from a key, both directly and through the dataserver. | avatar | llRequestDisplayName; llKey2Name; llRequestAgentData; Display Names to Key |  |
| Play an animation on the wearer | high | Request PERMISSION_TRIGGER_ANIMATION, then start and stop an animation from an attachment. | avatar | llStartAnimation; Run time permissions; Be happy |  |
| Sit target and sit animation (pose ball) | high | A chair or pose ball that seats the avatar and plays an animation. | avatar, animesh | llSitTarget; llStartAnimation; AO Overriding Pose Ball; Avatar Position Adjustement to Avatar Height When Sitting |  |
| Teleport pad or sit teleporter | high | Move an avatar to a destination when they sit, or with llTeleportAgent. | avatar, movement | llSitTarget; llSetLinkPrimitiveParamsFast; llTeleportAgent |  |
| Visitor greeter | high | Greet each new visitor once, naming them with an agent link. | avatar, viewer-uris | llSensorRepeat; llGetAgentList; Viewer URI Name Space | Planned on [viewer-uris](../src/content/docs/features/viewer-uris.mdx): "Recipe: a greeter that names visitors with agent links" |
| Access list and blacklist | medium | Allow or deny avatars by name. | avatar, land | Blacklist and Remote Kill; llAddToLandBanList; llEjectFromLand |  |
| Avatar radar HUD | medium | List nearby avatars and their distances in floating text. | avatar, dialog | Avatar Radar (NewAge); 3D Radar; llGetAgentList; llGetObjectDetails |  |
| Find the sitting avatar and unsit them | medium | Use changed(CHANGED_LINK) to see who sat down, and unsit people your rules don't allow. | avatar, linkset | llAvatarOnSitTarget; llAvatarOnLinkSitTarget; llUnSit; CHANGED LINK |  |
| Override walk and stand animations | medium | A minimal animation overrider (AO) built on llSetAnimationOverride. | avatar | llSetAnimationOverride; llGetAnimationOverride; CatAnimationOverride |  |
| Visitor counter and logger | medium | Count unique visitors per day and store the results. | avatar, land, data-storage | llGetAgentList; Avatar Radar (NewAge); llLinksetDataWrite |  |
| Wear an object with a temporary attach | medium | Demo attachments that use an experience. | avatar, experience | llAttachToAvatarTemp; llRequestExperiencePermissions |  |
| Check whether an avatar is online | low | An online-status indicator. | avatar | DATA ONLINE; llRequestAgentData |  |
| Invite to group | low | Post a group-join link for visitors. | avatar, viewer-uris | Group invitation; Group Inviter with AdminBot |  |

### camera

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Camera position on sit | medium | Set a fixed camera view for anyone sitting on the object. | camera | llSetCameraEyeOffset; llSetCameraAtOffset; Camera following prim |  |
| Scripted follow camera | low | A custom follow camera built with llSetCameraParams. | camera | FollowCam; llSetCameraParams; Camera Sync |  |

### combat

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Damage-dealing projectile | medium | A Combat2 bullet that carries a damage amount and type. | combat | On damage; REZ DAMAGE; Damage Types; llRezObjectWithParams |  |
| Health and death handling | medium | Adjust incoming damage in on_damage and respond in on_death. | combat | On damage; On death; Final damage; Combat Log |  |
| Simple gun with bullets | medium | A mouselook weapon that rezzes a projectile on each click. | combat, input, inventory | Gun and Holster; Bullet; llRezObjectWithParams |  |

### communications

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Fetch data from a web API | high | Make a GET request to a JSON API and parse the response. | communications, data-transmission | llHTTPRequest; Http response; Json usage in LSL |  |
| Link messages between scripts | high | Coordinate the scripts in one linkset with llMessageLinked. | communications, linkset | Link message; llMessageLinked |  |
| Listen for chat commands | high | Listen on a channel for the owner's commands and parse them. | communications | llListen; Listen; llListenControl |  |
| Region-wide messaging between objects | high | Send commands between objects in the same region on a private channel. | communications | llRegionSay; llRegionSayTo |  |
| Send a private message to one avatar or object | high | When to use llOwnerSay, llRegionSayTo or llInstantMessage. | communications | llRegionSayTo; llInstantMessage; llOwnerSay |  |
| Receive HTTP requests (object URL) | medium | Get a URL, handle http_request, and request a new URL after a region change. | communications | llRequestURL; llRequestSecureURL; Http request; HTTP Server URL Registration |  |
| Relay chat further than 100 m | low | Pass messages on over longer distances without creating loops. | communications | Chat Relay; llRegionSay |  |
| Send email from an object | low | Email the owner a status report. | communications | Email; llEmail; Email-to-IM |  |

### data-storage

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Save settings in linkset data | high | Keep settings across resets with linkset data. | data-storage | Linkset data; llLinksetDataWrite; llLinksetDataFindKeys |  |
| Store settings in the object description | low | Use the description field as a tiny persistent store. | data-storage, prims | PRIM DESC; llSetObjectDesc |  |

### data-transmission

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Parse a comma-separated command | high | Split a command into fields and typecast each one. | data-transmission | llParseString2List; llCSV2List; llDumpList2String |  |
| Build and read JSON | medium | Build nested JSON and read values from it safely. | data-transmission | Json usage in LSL; llList2Json; llJsonGetValue; llJsonSetValue |  |
| Capitalise, trim and replace in strings | medium | Helpers for common string cleanup. | data-transmission | llStringTrim; llReplaceSubString; User:Peter Stindberg/strCapitalize |  |
| Format a float with fixed decimals | medium | Display a float with a fixed number of decimals, such as "3.14". | data-transmission, math | Format Decimal; Float2String; Fixed Precision |  |
| Sort a strided list (table) | medium | Treat a list as rows of a table and sort it by one column. | data-transmission | llListSortStrided; llListFindStrided; llList2ListStrided |  |
| Check whether a string is a valid key | low | Check UUIDs that come from chat or notecards. | data-transmission | User:Peter Stindberg/is uuid; NULL KEY |  |

### dialog

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Multi-page dialog menu | high | Split more than 12 buttons across pages with Next and Back buttons. | dialog | llDialog; Dialog Menus; DialogPlus | Planned on [dialog](../src/content/docs/features/dialog.mdx): "Recipe: multi-page dialog menu" |
| Simple dialog menu with a timeout | high | Open a menu on touch, listen on a random channel, and remove the listener after a timeout. | dialog, communications | llDialog; llListenRemove; Dialog Menus |  |
| Text box input | medium | Ask the user for free text and read the reply. | dialog | llTextBox |  |

### effects

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Particle effect presets | high | Ready-to-paste presets: sparkles, smoke, fire, rain, bubbles. | effects | llParticleSystem | Planned on [effects](../src/content/docs/features/effects.mdx): "Recipe: particle effect presets" |
| Particle beam between two objects | medium | A beam or leash from one object to an avatar or another prim. | effects | llParticleSystem; PSYS_SRC_TARGET_KEY |  |

### environments

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Set a personal environment (sky preset) | low | Change a visitor's sky while they are in an area. | environments, experience | llSetAgentEnvironment; llReplaceAgentEnvironment |  |

### events

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Reset on owner change | high | Reset or re-initialise when the object is sold or given away. | events, script | CHANGED OWNER; Changed; On rez |  |
| Collision-triggered action (trap, bumper) | medium | React when an avatar walks into a volume. | events, physics | Collision start; llVolumeDetect; Land collision start |  |
| Detect region restart and region change | medium | Request new URLs and re-initialise after a restart. | events | CHANGED REGION START; CHANGED REGION; CHANGED TELEPORT |  |
| Scan for nearby objects with a sensor | medium | Find named objects or avatars nearby, and handle no_sensor. | events, avatar | llSensor; llSensorRepeat; Sensor; No sensor |  |

### experience

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Experience teleporter | medium | Teleport an avatar without a permission dialog, using an experience. | experience, avatar | llRequestExperiencePermissions; llTeleportAgent; Experience permissions |  |
| Key-value store with experience KVP | medium | Keep data that persists across regions in the experience key-value store. | experience, data-storage | llUpdateKeyValue; llReadKeyValue; Experience Tools |  |

### input

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Owner-only and group-only touch | high | Limit who can use an object. | input, avatar | llDetectedKey; llSameGroup; llDetectedGroup |  |
| Take controls for a vehicle or weapon | high | Capture the arrow keys and mouselook clicks. | input | llTakeControls; Control; Run time permissions |  |
| Buttons on one prim with touch positions | medium | A grid of buttons on one face, chosen by where the face was touched. | input, textures | llDetectedTouchST; LSL Touch Position; Button Click Detector | Planned on [input/touch](../src/content/docs/features/input/touch.mdx): "Recipe: buttons on one prim with touch positions" |
| Detect a long press versus a tap | low | Time touch_start to touch_end to tell a click from a hold. | input | Touch; Touch end; llGetTime |  |
| Double-tap a movement key | low | Detect a double tap on an arrow key without a timer. | input | Double Tap Detection; Control |  |
| Gamepad-controlled object | low | Read gamepad sticks and buttons with game_control. | input | Game control; llGetGameControlMode; PERMISSION GAME CONTROL |  |

### inventory

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| A simple giver (folder of items) | high | Give every item of one type as a single folder. | inventory | llGiveInventoryList; llGetInventoryNumber | Planned on [inventory](../src/content/docs/features/inventory.mdx): "Recipe: a simple giver" |
| Give an item on touch | high | Give whoever touches the object a notecard, landmark or object from its inventory. | inventory, input | llGiveInventory; Touch start | Stub exists: [Give an item on touch](../src/content/docs/recipes/give-item-on-touch.mdx) |
| Reading a configuration notecard | high | Read key=value settings from a notecard and reload them on CHANGED_INVENTORY. | inventory, data-storage | llGetNotecardLine; llGetNotecardLineSync; Dataserver API; AdvancedNotecardReader | Planned on [inventory](../src/content/docs/features/inventory.mdx): "Recipe: reading a configuration notecard" |
| Rez an object in front of you | high | Rez an object with an offset and rotation, and pass it a start parameter. | inventory, prims | llRezObjectWithParams; llRezAtRoot; Object rez; On rez |  |
| Accept dropped inventory (dropbox) | medium | A mailbox that accepts dropped items and tells the owner. | inventory | llAllowInventoryDrop; CHANGED ALLOWED DROP |  |
| Read a notecard line by line (sync and async) | medium | Loop over a notecard with the sync API, falling back to the dataserver event. | inventory, data-storage | llGetNotecardLineSync; llGetNumberOfNotecardLines; Dataserver |  |
| Talk to an object you just rezzed | medium | Use object_rez and the start parameter to set up a private channel. | inventory, communications | Object rez; llRezObjectWithParams; On rez |  |

### land

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Security orb (eject from parcel) | medium | Warn visitors who aren't on the list, then eject them from your parcel. | land, avatar | llEjectFromLand; llOverMyLand; llTeleportAgentHome |  |
| Check if an object is over your land | low | Behave differently when the object is on land you own. | land | llOverMyLand; llGetParcelDetails |  |
| Prim and land impact counter | low | Report how much of the parcel each owner uses. | land | llGetParcelPrimCount; llGetParcelPrimOwners |  |

### math

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Point an object at a target | high | Turn an object to face a position or an avatar. | math, movement | llRotBetween; llLookAt; llRotLookAt; Angle Between Two Vectors |  |
| Shuffle a list and pick random items | medium | Pick random items without repeats. | math, data-transmission | llListRandomize; llFrand |  |
| Convert colours between RGB, HSV and hex | low | Helpers for converting between colour spaces. | math, prims | Color conversion scripts; Color space conversions; ColorConvert; Color-to-Vector Tool |  |
| Numeric integration for custom physics | low | Euler and Verlet steps for scripted motion. | math, physics | llSetKeyframedMotion; llGetEnergy | Planned on [math](../src/content/docs/features/math.mdx): "Recipe: numeric integration for custom physics" |
| Perlin noise maps | low | Smooth noise for terrain or effects. | math | llFrand | Planned on [math](../src/content/docs/features/math.mdx): "Recipe: Perlin noise maps" |
| Projectile trajectories | low | Aim a projectile so gravity brings it onto the target. | math, combat | llApplyImpulse; Bullet | Planned on [math](../src/content/docs/features/math.mdx): "Recipe: projectile trajectories" |
| Simple inverse kinematics with trigonometry | low | Two-bone inverse kinematics for arms and legs. | math | llRotBetween; Angle Between Two Vectors | Planned on [math](../src/content/docs/features/math.mdx): "Recipe: simple inverse kinematics with trigonometry" |

### money

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Single-item vendor | high | Sell one item: check the amount, deliver it, and refund wrong payments. | money, inventory | Money; llSetPayPrice; llGiveInventory |  |
| Tip jar | high | Accept tips, thank each tipper and show a running total. | money | Money; llGiveMoney; llSetPayPrice |  |
| Rental box and rent timer | medium | Collect rent and track the paid-until date. | money, time, land | CatRental; llGetUnixTime |  |
| Split payments between partners | medium | Send a share of each sale to another avatar. | money | llGiveMoney; llTransferLindenDollars; PERMISSION DEBIT |  |
| Vendor with refunds | medium | Refund overpayments and log transaction_result. | money | llTransferLindenDollars; Transaction result | Planned on [money](../src/content/docs/features/money.mdx): "Recipe: vendor with refunds" |
| Pay-what-you-want vendor | low | Give a bonus item to buyers who pay more than the average. | money | Beat The Average Vendor |  |

### movement

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Basic car vehicle | high | A starter car: sit, take controls, drive the motor and steer. | movement, physics, input | VEHICLE TYPE CAR; llSetVehicleType; llTakeControls |  |
| Door or platform with keyframed motion | high | A smooth sliding door or lift using llSetKeyframedMotion in ping-pong mode. | movement | llSetKeyframedMotion | Planned on [movement](../src/content/docs/features/movement.mdx): "Recipe: door or platform with keyframed motion" |
| Make a door | high | A door that swings open on its hinge when touched and closes again. | movement, prims | DoorHax; llSetPrimitiveParams; llSetLocalRot | Stub exists: [Make a door](../src/content/docs/recipes/door.mdx) |
| Rotating object | high | Spin a sign or wheel on the client with llTargetOmega. | movement, physics | llTargetOmega; PRIM OMEGA |  |
| Boat and hover vehicle presets | medium | Ready-made sets of vehicle parameters. | movement, physics | VEHICLE TYPE BOAT; VEHICLE TYPE AIRPLANE; VEHICLE TYPE BALLOON; VEHICLE FLAG HOVER WATER ONLY |  |
| Follow the owner | medium | A physical pet or orb that follows its owner around. | movement, physics | AvatarFollower; Follower script; llMoveToTarget |  |

### pathfinding

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Follow a static path with keyframed motion | medium | An object that patrols along a precomputed path. | pathfinding, movement | llSetKeyframedMotion; llGetStaticPath | Planned on [pathfinding](../src/content/docs/features/pathfinding.mdx): "Recipe: following a static path with keyframed motion" |
| Patrol between waypoints | medium | A character that patrols a route. | pathfinding | llPatrolPoints; PATROL PAUSE AT WAYPOINTS |  |
| Wandering pathfinding character | medium | A pet that wanders an area and handles path_update. | pathfinding | llCreateCharacter; llWanderWithinArea; Path update |  |
| A* search over a grid | low | Find paths on a grid in pure LSL. | pathfinding, math | llGetStaticPath | Planned on [pathfinding](../src/content/docs/features/pathfinding.mdx): "Recipe: A\* search over a grid" |

### physics

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Raycast to find what the avatar is looking at | medium | Find what lies along the avatar's view with llCastRay. | physics, camera | llCastRay; llGetCameraRot; Aim Detection |  |
| Make an object physical and drop it | low | Turn physics on and throw the object. | physics | STATUS PHYSICS; llSetStatus; llApplyImpulse |  |
| Push or launch an avatar (bounce pad) | low | A jump pad that respects push restrictions. | physics, avatar | llPushObject; llApplyImpulse; PARCEL FLAG RESTRICT PUSHOBJECT |  |

### prims

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Floating text label | high | Show coloured hover text above a prim, with line breaks, and clear it again. | prims | llSetText; PRIM TEXT | Stub exists: [Floating text](../src/content/docs/recipes/floating-text.mdx) |
| Light switch | high | Touch to toggle a lamp's point light, fullbright and glow. | prims, input | PRIM POINT LIGHT; PRIM FULLBRIGHT; PRIM GLOW | Stub exists: [Light switch](../src/content/docs/recipes/light-switch.mdx) |
| Colour changer and colour cycle | medium | Set a prim's colour, or cycle it smoothly. | prims | Color Cycle; Color and Scripting; PRIM COLOR |  |
| Hide and show part of a linkset | medium | Toggle visibility of one link or of the whole object. | prims, linkset | llSetLinkAlpha; Best Neighbor Ad Hiding Script |  |
| Temporary rezzed objects that clean up | medium | Props that are temp-on-rez or that delete themselves. | prims, inventory | PRIM TEMP ON REZ; llDie |  |

### script

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Idle scripts when nobody is near | low | Switch effects off when nobody is around to see them. | script, avatar | 1st necessity of SL; llSetScriptState |  |
| Self-deleting setup script | low | A script that configures its object and then deletes itself. | script, inventory | llRemoveInventory; llGetScriptName; AutoHUD constructor |  |

### sound

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Looping ambient sound with on/off | medium | A touch-toggled ambient loop, kept in sync across prims. | sound | llLoopSound; llStopSound; llLoopSoundMaster |  |
| Trigger a random sound from a list | medium | Play a random sound from a list of keys or from inventory. | sound | llTriggerSound; llFrand | Planned on [sound](../src/content/docs/features/sound.mdx): "Recipe: trigger a random sound from a list of keys" |
| Sound triggered by an animation | low | Play a sound while a particular animation is running. | sound, avatar | Animation triggered sound loop; llGetAnimation |  |

### textures

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Change texture on touch (cycle textures) | high | Step through the textures in inventory each time the object is touched. | textures, inventory | Bobbyb's texture changer; llSetTexture; llGetInventoryName |  |
| Shared media screen: set a URL | medium | Show a web page on a face. | textures | llSetPrimMediaParams; llClearPrimMedia; How to Align a Shared Media Texture from Linden Script |  |
| Texture animation: scrolling and flipbook | medium | Scroll a water texture, or play a sprite-sheet flipbook. | textures, effects | llSetTextureAnim; llSetLinkTextureAnim |  |
| Set a PBR material override | low | Change the tint or emissive colour of a PBR face. | textures | PRIM GLTF BASE COLOR; PRIM GLTF EMISSIVE; llSetLinkGLTFOverrides |  |

### time

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Repeating timer and countdown | high | Run code every N seconds, or stop after a countdown. | time, events | llSetTimerEvent; Timer |  |
| Show SL time and a digital clock | medium | Show Second Life time (SLT) in floating text. | time | llGetWallclock; llGetTimestamp; Clock; Binary Clock v1.1 |  |
| Day of the week and days since a date | low | Helpers for date arithmetic. | time | Day of the Week; Days Since; llGetUnixTime; GetTimestampOffset |  |

### viewer-uris

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Landmark giver that posts teleport links | medium | Give a landmark and post a clickable SLurl. | viewer-uris, inventory | Viewer URI Name Space; BuildSlurl (NewAge) | Planned on [viewer-uris](../src/content/docs/features/viewer-uris.mdx): "Recipe: a landmark giver that posts teleport links" |

## 3. Guides by feature area

Each idea appears once, under its first feature area; the Features column lists all of its areas. Within each group, ideas are sorted by priority.

### animesh

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Animesh | medium | Animesh objects, their limits, and scripting them. | animesh | Animesh User Guide; llStartObjectAnimation |  |

### avatar

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Animations and permissions for attachments and furniture | high | Animation priorities, permissions, and how they interact with an AO. | avatar, animesh | llStartAnimation; Animation Priority; Animation Upload Priority; Animation Durations |  |
| Permissions explained (runtime and inventory) | high | How runtime permissions differ from next-owner permissions. | avatar, inventory | Run time permissions; llGetPermissions; MASK OWNER; llGetInventoryPermMask |  |
| Attachments: attach, detach and temp attach | medium | Attachment points, the attach event, and temporary attachments. | avatar | Attach; Attachment; llAttachToAvatarTemp; ATTACH HUD CENTER 1 |  |
| Detecting avatars: sensors vs agent lists | medium | Strengths and weaknesses of each way to find avatars. | avatar, events | llSensor; llGetAgentList; llGetObjectDetails; Ghost Detector |  |
| Names, display names and avatar data | medium | Legacy names, display names, and avatar data lookups. | avatar | llRequestDisplayName; llRequestAgentData; Describe Chatter |  |
| Uploading animations for scripted use | low | Which upload settings matter when a script plays the animation. | avatar | BVH Frame Rate; Animation Upload Ease In and Ease Out; Animation Upload Loop Controls; Animating Breathing and Other Subtle Motion |  |

### camera

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Camera control | medium | Camera parameters, camera permissions, and cinematic cameras. | camera | llSetCameraParams; CAMERA FOCUS; FollowCam; CameraSynch2 |  |

### combat

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Combat2 for weapon makers | medium | How damage flows, the combat log, and fair-play rules. | combat | Combat Log; Damage Types; On damage; COMBAT CHANNEL | Partly covered: [features/combat and sub-pages](../src/content/docs/features/combat.mdx) |

### communications

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Communication between scripts and objects | high | When to use link messages, chat, region say, HTTP or linkset data. | communications, linkset | Link message; llRegionSayTo; Chat Relay |  |
| HTTP requests from LSL | high | Methods, headers, body limits, throttles and errors. | communications, data-transmission | llHTTPRequest; Http response; HTTP BODY MAXLENGTH; HTTP VERBOSE THROTTLE |  |
| Listeners and channels | high | Channels, filters, listener limits, lag and security. | communications | llListen; Listen; llListenControl; Authenticated Chat | Planned on [communications](../src/content/docs/features/communications.mdx): "Guide: listeners and channels" |
| An object as a web server | medium | Serving HTTP and HTML from an object, and keeping its URL. | communications | llRequestURL; HTTP Server URL Registration; LSL-Shared Media Communication | Planned on [communications](../src/content/docs/features/communications.mdx): "Guide: an object as a web server" |
| Securing messages between objects | medium | Shared secrets, hashing and RSA signatures. | communications, data-transmission | Authenticated Chat; llSignRSA; llVerifyRSA; Basic Encryption Modules; llXorBase64 |  |

### data-storage

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Choosing where to store data | high | Notecards, linkset data, experience KVP, descriptions and external servers compared. | data-storage | Linkset data; llUpdateKeyValue; PRIM DESC; Dataserver API | Planned on [data-storage](../src/content/docs/features/data-storage.mdx): "Guide: choosing where to store data" |
| Linkset data in depth | high | Keys, pattern searches, protected pairs, limits and the linkset_data event. | data-storage | Linkset data; llLinksetDataFindKeys; llLinksetDataDelete |  |

### data-transmission

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| JSON in LSL | high | Building, querying and editing JSON, and the JSON_INVALID pitfalls. | data-transmission | Json usage in LSL; JSON ARRAY; JSON OBJECT; llJsonValueType | Planned on [data-transmission](../src/content/docs/features/data-transmission.mdx): "Guide: sending nested data as JSON" |
| List handling and strided lists | high | Using lists as arrays, tables and maps, and what each costs. | data-transmission | llListSortStrided; llList2ListSlice; 2D Pseudo-Array; Associative Array Emulator |  |
| Parsing strings and typecasting fields | high | Splitting input into fields, and the pitfalls of type conversion. | data-transmission | llParseString2List; llList2Float; Float2String | Planned on [data-transmission](../src/content/docs/features/data-transmission.mdx): "Guide: parsing strings and typecasting fields" |
| String handling | medium | Indexing, searching, replacing and Unicode. | data-transmission | llSubStringIndex; llGetSubString; User:Rhet0rica Resident/glob match |  |
| Encryption and hashing (history and current options) | low | Which approaches still make sense in LSL. | data-transmission | ARCFOUR Strong Encryption Implementation; Basic Encryption Modules; 32bit Hash; llSHA256String |  |

### dialog

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Building a prim HUD | high | HUD layout, attachment points and touch handling. | dialog, input | AutoHUD constructor; llWorldPosToHUD; ATTACH HUD CENTER 1 | Planned on [dialog](../src/content/docs/features/dialog.mdx): "Guide: building a prim HUD" |
| Dialog menus in depth | high | Channels, button order, menu trees and cleanup. | dialog | Dialog Menus; DialogPlus; llDialog; Dialog Message |  |

### effects

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Particles in depth | medium | Every PSYS parameter, plus performance and tricks. | effects | llParticleSystem; AbcText |  |
| Technical mesh with texture animation | low | Animated UV tricks on purpose-built mesh. | effects, textures | llSetTextureAnim | Planned on [effects](../src/content/docs/features/effects.mdx): "Guide: technical mesh with texture animation" |

### environments

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Changing and replacing an environment | low | Scripting region and parcel environments. | environments | LSL Constants/llSetEnvironment; LSL Constants/llGetEnvironment | Planned on [environments](../src/content/docs/features/environments.mdx): "Guide: changing and replacing an environment" |

### events

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| States and events in depth | high | The event queue, state changes, and what survives a state switch. | events, script | State entry; State exit; Event Order; Getting started with LSL | Partly covered: [fundamentals/states-and-events](../src/content/docs/fundamentals/states-and-events.mdx) |
| Collisions and volume detect | medium | Collision events, collision filters and phantom detection volumes. | events, physics | Collision start; Collision end; llVolumeDetect; llCollisionFilter |  |
| Event order cheat sheet | medium | Which events fire, and in what order, on rez, attach, login and sit. | events | Event Order; On rez; Attach; Changed |  |
| Switching event handlers with states | medium | Using states to turn event handlers on and off. | events | State entry; State exit | Planned on [events](../src/content/docs/features/events.mdx): "Guide: switching event handlers with states" |

### experience

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Creating an experience and compiling scripts to it | medium | Setting up an experience and handling its permissions. | experience | Experience Tools; Experience permissions; Experience permissions denied | Planned on [experience](../src/content/docs/features/experience.mdx): "Guide: creating an experience and compiling scripts to it" |

### input

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Capturing controls for a vehicle or weapon | high | Control masks, passing controls on, and mouselook. | input | llTakeControls; Control; CONTROL ML LBUTTON | Planned on [input](../src/content/docs/features/input.mdx): "Guide: capturing controls for a vehicle or weapon" |
| Touch events in depth | medium | The touch lifecycle, detected data, and passing touches to the root. | input | Touch start; Touch; Touch end; LSL Touch Position; User:XylaAodha Resident/PassTouchTestPage |  |

### inventory

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Rezzing objects | high | Rez parameters, start parameters, rez limits, and parent-child communication. | inventory, prims | llRezObjectWithParams; LSL Constants/llRezObjectWithParams; Object rez; On rez |  |
| Giving and taking inventory | medium | Givers, inventory drops, permissions and inventory change events. | inventory | llGiveInventory; llGiveInventoryList; llAllowInventoryDrop; CHANGED INVENTORY |  |
| Working with notecards | medium | Async and sync reads, caching and config formats. | inventory, data-storage | Dataserver API; AdvancedNotecardReader; llGetNotecardLineSync |  |

### land

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Parcel and region scripting rights | medium | Where scripts are allowed to run, and estate tools. | land | PARCEL FLAG ALLOW SCRIPTS; Auto Return; ERR PARCEL PERMISSIONS | Planned on [land](../src/content/docs/features/land.mdx): "Guide: parcel and region scripting rights" |

### linkset

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Working with link numbers | high | How links are numbered and how to find a link by name. | linkset | LINK ROOT; llGetLinkKey; PRIM LINK TARGET | Covered: [Link numbers](../src/content/docs/guides/link-numbers.mdx) |

### math

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Vectors and rotations | high | Quaternions, local and global frames, and common mistakes. | math | llRot2Euler; llRotBetween; Angle Between Two Vectors; ZERO ROTATION |  |
| Bitwise flags and bit fields | medium | Masks, flags, and packing values into integers. | math | Bit field; Boolean; LSL Operators |  |
| Constraining rotations (and turret) | medium | Clamping rotations, with a turret sub-page. | math, movement | llRotBetween; llRot2Euler | Covered: [Constraining rotations](../src/content/docs/guides/constraining-rotations/index.mdx) |
| Interpolation and easing | medium | Lerp, slerp and easing curves. | math, movement | llSetKeyframedMotion | Covered: [Interpolation](../src/content/docs/guides/interpolation.mdx) |
| Number formatting and bases | low | Hex, other bases, and fixed-precision output. | math, data-transmission | BaseN; Base2Dec; Efficient Hex; BinaryDecimalConverter |  |
| Random numbers | low | llFrand quirks, integers in a range, and seeding. | math | llFrand; llListRandomize; GenerateKey |  |

### money

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Money and transactions | high | The money event, debit permission, and safe refunds. | money | Money; llTransferLindenDollars; Transaction result; PERMISSION DEBIT |  |

### movement

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Moving objects: non-physical, physical and keyframed | high | How to choose a way to move an object. | movement, physics | llSetKeyframedMotion; llMoveToTarget; llSetRegionPos; At target; Moving start |  |
| Tuning a vehicle | high | Motors, deflection, vertical attraction and banking. | movement, physics | VEHICLE LINEAR MOTOR DIRECTION; VEHICLE ANGULAR DEFLECTION EFFICIENCY; VEHICLE HOVER HEIGHT | Planned on [movement](../src/content/docs/features/movement.mdx): "Guide: tuning a vehicle" |
| Targets: at_target and at_rot_target | low | Using targets to know when a movement has arrived. | movement, events | At target; Not at target; At rot target |  |

### pathfinding

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Pathfinding characters | medium | The navmesh, characters, and path_update failures. | pathfinding | llCreateCharacter; CHARACTER TYPE; OPT WALKABLE; Path update |  |

### physics

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Raycasting | medium | llCastRay options, filters, errors and use cases. | physics | llCastRay; RC REJECT TYPES; RCERR SIM PERF LOW |  |
| Physics materials | low | Friction, restitution, density and physics shapes. | physics | PRIM MATERIAL; PRIM PHYSICS SHAPE TYPE | Planned on [physics](../src/content/docs/features/physics.mdx): "Guide: physics materials" |

### prims

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Primitive params rule lists | high | Building and reading rule lists efficiently. | prims | llSetPrimitiveParams; llGetPrimitiveParams; PRIM LINK TARGET | Planned on [prims](../src/content/docs/features/prims.mdx): "Guide: primitive params rule lists" |
| Faces and sides | medium | How face numbers map onto prims and mesh. | prims, textures | Face; Talk:Face; ALL SIDES |  |

### script

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Debugging scripts | high | Debug output, script errors, and common runtime errors. | script | DEBUG CHANNEL; llOwnerSay; LSL Test Harness | Partly covered: [fundamentals/errors](../src/content/docs/fundamentals/errors.mdx) |
| Learn LSL | high | A first-steps tutorial, starting from Hello Avatar. | script | Getting started with LSL; A Basic LSL Tutorial; Getting Ready to Learn LSL; Hello Avatar | Covered: [Learn LSL](../src/content/docs/guides/learn-lsl.mdx) |
| Script efficiency and lag | high | Measuring script time, expensive patterns, and functions that sleep. | script | LSL Delay; Efficiency Tester; Code Racer; LSL Constants vs Globals; OBJECT SCRIPT TIME |  |
| Script memory | high | Mono memory: measuring it and avoiding stack-heap collisions. | script | LSL Script Memory; llScriptProfiler; llGetUsedMemory; OBJECT SCRIPT MEMORY | Partly covered: [fundamentals/memory](../src/content/docs/fundamentals/memory.mdx) |
| Function delays and working around them | medium | Which functions sleep the script, and multi-script workarounds. | script | LSL Delay; AntiDelay Node |  |
| Limits explained | medium | Chat, HTTP, listener, memory and inventory limits in one place. | script | Limits |  |
| Benchmarking and testing scripts | low | Racing two implementations against each other, and unit-testing LSL. | script | Code Racer; Efficiency Tester; LSL Test Harness; Test Harness Test Units; Code Sizer |  |
| History: removed and deprecated features | low | XML-RPC, remote script loading and LSO-era tricks, kept as history notes. | script | llRemoteLoadScriptPin; REMOTE DATA CHANNEL; Remote data |  |
| Mini games in LSL | low | Game loops, game state and fair randomness, drawn from the wiki examples. | script | CatGames; Brainf\*\*\* Interpreter; Chatbot |  |
| Operators and precedence gotchas | low | Evaluation order and the quirks of string addition. | script | LSL Operators; LSL Addition | Partly covered: [fundamentals/operators](../src/content/docs/fundamentals/operators.mdx) |
| Region and object statistics | low | Measuring region health from a script. | script, land | SIM STAT SCRIPT MS; OBJECT SCRIPT TIME; llGetEnv |  |
| Writing a library of user-defined functions | low | Writing and naming reusable helper functions. | script | User:Nexii Malthus; Format Decimal |  |

### sound

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Sound in depth | low | Sync, queueing, radius and preloading. | sound | llLoopSoundMaster; llTriggerSoundLimited; Client sounds |  |
| Start-loop-end sounds for engines and weapons | low | Engine sounds that start, loop and stop without gaps. | sound | llPlaySound; llLoopSound; Client sounds | Planned on [sound](../src/content/docs/features/sound.mdx): "Guide: start-loop-end sounds for engines and weapons" |

### textures

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Texture coordinates | high | The maths of UV and ST coordinates on faces. | textures | llDetectedTouchST; llDetectedTouchUV; Face | Covered: [Texture coordinates](../src/content/docs/guides/texture-coordinates.mdx) |
| Blinn-Phong and PBR offsets, repeats and rotation | medium | Texture transforms in both material systems. | textures | PRIM TEXTURE; PRIM NORMAL; PRIM SPECULAR; PRIM GLTF BASE COLOR | Planned on [textures](../src/content/docs/features/textures.mdx): "Guide: Blinn-Phong and PBR offsets, repeats and rotation" |
| PBR materials and glTF overrides | medium | Applying materials and overrides from a script. | textures | PRIM RENDER MATERIAL; PRIM GLTF METALLIC ROUGHNESS; PRIM GLTF NORMAL | Planned on [textures](../src/content/docs/features/textures.mdx): "Guide: PBR materials and glTF overrides" |
| Shared media and LSL | low | Media on a prim, and two-way communication with the page. | textures, communications | LSL-Shared Media Communication; PRIM MEDIA WHITELIST; llSetPrimMediaParams |  |

### time

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Time and dates | medium | Unix time, SLT offsets and date maths. | time | llGetUnixTime; llGetTimestamp; GetTimestampOffset; Day of the Week |  |
| Timers and multiple timers | medium | One timer driving several schedules. | time, events | llSetTimerEvent; Timer; llSensorRepeat | Partly covered: [fundamentals/timers](../src/content/docs/fundamentals/timers.mdx) |

### viewer-uris

| Title | Pri | Description | Features | Wiki sources | Status |
|---|---|---|---|---|---|
| Viewer URIs and SLurls | low | Clickable links in chat and in text. | viewer-uris | Viewer URI Name Space; BuildSlurl (NewAge) |  |

## 4. Appendix: wiki pages mined

The snapshot has 2,271 pages; about 930 of them are not `ll*` function pages or templates. All of those were scanned by title, and the tutorial, example and concept pages among them were read. API pages were ranked by the size of their Examples and helpers sections. The largest were llAllowInventoryDrop, llFrand, llSetKeyframedMotion, llSetPrimitiveParams, llListSortStrided, llJsonSetValue, llDialog, llLinksetDataFindKeys, llApplyImpulse and llTeleportAgent.

Pages that were reviewed but not used (niche, joke or obsolete): Assembly Programming Language, BigNum, ContinentDetector, College of Scripting Music and Science, Greeting Card, Google Charts (an external service that has since been discontinued), and the Beta/* release pages. Brainf\*\*\* Interpreter is cited only under games. Requested LSL Articles lists just three wishes: booleans, llList2Float number notation, and the wording of llSay.

Pages cited as sources, with the number of ideas that cite each (374 pages, 534 citations):

On rez (5), llRezObjectWithParams (5), llSetKeyframedMotion (5), llFrand (4), llGetAgentList (4), llRotBetween (4), Angle Between Two Vectors (3), Control (3), Dataserver API (3), Dialog Menus (3), Json usage in LSL (3), Linkset data (3), Money (3), Object rez (3), On damage (3), Run time permissions (3), Viewer URI Name Space (3), llApplyImpulse (3), llDialog (3), llGetNotecardLineSync (3), llGetUnixTime (3), llGiveInventory (3), llParticleSystem (3), llRegionSayTo (3), llRequestAgentData (3), llSensorRepeat (3), llStartAnimation (3), llTakeControls (3), llTransferLindenDollars (3), ATTACH HUD CENTER 1 (2), AdvancedNotecardReader (2), Animesh User Guide (2), At target (2), Attach (2), Authenticated Chat (2), AutoHUD constructor (2), Avatar Radar (NewAge) (2), Basic Encryption Modules (2), BuildSlurl (NewAge) (2), Bullet (2), Changed (2), Chat Relay (2), Client sounds (2), Code Racer (2), Collision start (2), Combat Log (2), Damage Types (2), Day of the Week (2), DialogPlus (2), Efficiency Tester (2), Event Order (2), Experience Tools (2), Experience permissions (2), Face (2), Float2String (2), FollowCam (2), Format Decimal (2), GetTimestampOffset (2), Getting started with LSL (2), HTTP Server URL Registration (2), Http response (2), LSL Delay (2), LSL Operators (2), LSL Test Harness (2), LSL Touch Position (2), LSL-Shared Media Communication (2), Link message (2), Listen (2), OBJECT SCRIPT TIME (2), PERMISSION DEBIT (2), PRIM DESC (2), PRIM GLTF BASE COLOR (2), PRIM LINK TARGET (2), Path update (2), State entry (2), State exit (2), Timer (2), Touch (2), Touch end (2), Touch start (2), Transaction result (2), llAllowInventoryDrop (2), llAttachToAvatarTemp (2), llCastRay (2), llCreateCharacter (2), llDetectedTouchST (2), llEjectFromLand (2), llGetObjectDetails (2), llGetStaticPath (2), llGetTimestamp (2), llGiveInventoryList (2), llGiveMoney (2), llHTTPRequest (2), llLinksetDataFindKeys (2), llLinksetDataWrite (2), llListRandomize (2), llListSortStrided (2), llListen (2), llListenControl (2), llLoopSound (2), llLoopSoundMaster (2), llMoveToTarget (2), llOverMyLand (2), llOwnerSay (2), llParseString2List (2), llRegionSay (2), llRequestDisplayName (2), llRequestExperiencePermissions (2), llRequestURL (2), llRot2Euler (2), llSensor (2), llSetCameraParams (2), llSetPayPrice (2), llSetPrimMediaParams (2), llSetPrimitiveParams (2), llSetTextureAnim (2), llSetTimerEvent (2), llSitTarget (2), llStartObjectAnimation (2), llTeleportAgent (2), llUpdateKeyValue (2), llVolumeDetect (2), 1st necessity of SL (1), 2D Pseudo-Array (1), 32bit Hash (1), 3D Radar (1), A Basic LSL Tutorial (1), ALL SIDES (1), AO Overriding Pose Ball (1), ARCFOUR Strong Encryption Implementation (1), AbcText (1), Aim Detection (1), Animating Breathing and Other Subtle Motion (1), Animation Durations (1), Animation Priority (1), Animation Upload Ease In and Ease Out (1), Animation Upload Loop Controls (1), Animation Upload Priority (1), Animation triggered sound loop (1), AntiDelay Node (1), Associative Array Emulator (1), At rot target (1), Attachment (1), Auto Return (1), Avatar Position Adjustement to Avatar Height When Sitting (1), AvatarFollower (1), BVH Frame Rate (1), Base2Dec (1), BaseN (1), Be happy (1), Beat The Average Vendor (1), Best Neighbor Ad Hiding Script (1), Binary Clock v1.1 (1), BinaryDecimalConverter (1), Bit field (1), Blacklist and Remote Kill (1), Bobbyb's texture changer (1), Boolean (1), Brainf\*\*\* Interpreter (1), Button Click Detector (1), CAMERA FOCUS (1), CHANGED ALLOWED DROP (1), CHANGED INVENTORY (1), CHANGED LINK (1), CHANGED OWNER (1), CHANGED REGION (1), CHANGED REGION START (1), CHANGED TELEPORT (1), CHARACTER TYPE (1), COMBAT CHANNEL (1), CONTROL ML LBUTTON (1), Camera Sync (1), Camera following prim (1), CameraSynch2 (1), CatAnimationOverride (1), CatGames (1), CatRental (1), Chatbot (1), Clock (1), Code Sizer (1), Collision end (1), Color Cycle (1), Color and Scripting (1), Color conversion scripts (1), Color space conversions (1), Color-to-Vector Tool (1), ColorConvert (1), DATA ONLINE (1), DEBUG CHANNEL (1), Dataserver (1), Days Since (1), Describe Chatter (1), Dialog Message (1), Display Names to Key (1), DoorHax (1), Double Tap Detection (1), ERR PARCEL PERMISSIONS (1), Efficient Hex (1), Email (1), Email-to-IM (1), Experience permissions denied (1), Final damage (1), Fixed Precision (1), Follower script (1), Game control (1), GenerateKey (1), Getting Ready to Learn LSL (1), Ghost Detector (1), Group Inviter with AdminBot (1), Group invitation (1), Gun and Holster (1), HTTP BODY MAXLENGTH (1), HTTP VERBOSE THROTTLE (1), Hello Avatar (1), How to Align a Shared Media Texture from Linden Script (1), Http request (1), JSON ARRAY (1), JSON OBJECT (1), LINK ROOT (1), LSL Addition (1), LSL Constants vs Globals (1), LSL Constants/llGetEnvironment (1), LSL Constants/llRezObjectWithParams (1), LSL Constants/llSetEnvironment (1), LSL Script Memory (1), Land collision start (1), Limits (1), MASK OWNER (1), Moving start (1), NULL KEY (1), No sensor (1), Not at target (1), OBJECT SCRIPT MEMORY (1), OPT WALKABLE (1), On death (1), PARCEL FLAG ALLOW SCRIPTS (1), PARCEL FLAG RESTRICT PUSHOBJECT (1), PATROL PAUSE AT WAYPOINTS (1), PERMISSION GAME CONTROL (1), PRIM COLOR (1), PRIM FULLBRIGHT (1), PRIM GLOW (1), PRIM GLTF EMISSIVE (1), PRIM GLTF METALLIC ROUGHNESS (1), PRIM GLTF NORMAL (1), PRIM MATERIAL (1), PRIM MEDIA WHITELIST (1), PRIM NORMAL (1), PRIM OMEGA (1), PRIM PHYSICS SHAPE TYPE (1), PRIM POINT LIGHT (1), PRIM RENDER MATERIAL (1), PRIM SPECULAR (1), PRIM TEMP ON REZ (1), PRIM TEXT (1), PRIM TEXTURE (1), PSYS_SRC_TARGET_KEY (1), RC REJECT TYPES (1), RCERR SIM PERF LOW (1), REMOTE DATA CHANNEL (1), REZ DAMAGE (1), Remote data (1), SIM STAT SCRIPT MS (1), STATUS PHYSICS (1), Sensor (1), Talk:Face (1), Test Harness Test Units (1), User:Nexii Malthus (1), User:Peter Stindberg/is uuid (1), User:Peter Stindberg/strCapitalize (1), User:Rhet0rica Resident/glob match (1), User:XylaAodha Resident/PassTouchTestPage (1), VEHICLE ANGULAR DEFLECTION EFFICIENCY (1), VEHICLE FLAG HOVER WATER ONLY (1), VEHICLE HOVER HEIGHT (1), VEHICLE LINEAR MOTOR DIRECTION (1), VEHICLE TYPE AIRPLANE (1), VEHICLE TYPE BALLOON (1), VEHICLE TYPE BOAT (1), VEHICLE TYPE CAR (1), ZERO ROTATION (1), llAddToLandBanList (1), llAvatarOnLinkSitTarget (1), llAvatarOnSitTarget (1), llCSV2List (1), llClearPrimMedia (1), llCollisionFilter (1), llDetectedGroup (1), llDetectedKey (1), llDetectedTouchUV (1), llDie (1), llDumpList2String (1), llEmail (1), llGetAnimation (1), llGetAnimationOverride (1), llGetCameraRot (1), llGetEnergy (1), llGetEnv (1), llGetGameControlMode (1), llGetInventoryName (1), llGetInventoryNumber (1), llGetInventoryPermMask (1), llGetLinkKey (1), llGetNotecardLine (1), llGetNumberOfNotecardLines (1), llGetObjectAnimationNames (1), llGetParcelDetails (1), llGetParcelPrimCount (1), llGetParcelPrimOwners (1), llGetPermissions (1), llGetPrimitiveParams (1), llGetScriptName (1), llGetSubString (1), llGetTime (1), llGetUsedMemory (1), llGetWallclock (1), llInstantMessage (1), llJsonGetValue (1), llJsonSetValue (1), llJsonValueType (1), llKey2Name (1), llLinksetDataDelete (1), llList2Float (1), llList2Json (1), llList2ListSlice (1), llList2ListStrided (1), llListFindStrided (1), llListenRemove (1), llLookAt (1), llMessageLinked (1), llPatrolPoints (1), llPlaySound (1), llPushObject (1), llReadKeyValue (1), llRemoteLoadScriptPin (1), llRemoveInventory (1), llReplaceAgentEnvironment (1), llReplaceSubString (1), llRequestSecureURL (1), llRezAtRoot (1), llRotLookAt (1), llSHA256String (1), llSameGroup (1), llScriptProfiler (1), llSetAgentEnvironment (1), llSetAnimationOverride (1), llSetCameraAtOffset (1), llSetCameraEyeOffset (1), llSetLinkAlpha (1), llSetLinkGLTFOverrides (1), llSetLinkPrimitiveParamsFast (1), llSetLinkTextureAnim (1), llSetLocalRot (1), llSetObjectDesc (1), llSetRegionPos (1), llSetScriptState (1), llSetStatus (1), llSetText (1), llSetTexture (1), llSetVehicleType (1), llSignRSA (1), llStopSound (1), llStringTrim (1), llSubStringIndex (1), llTargetOmega (1), llTeleportAgentHome (1), llTextBox (1), llTriggerSound (1), llTriggerSoundLimited (1), llUnSit (1), llVerifyRSA (1), llWanderWithinArea (1), llWorldPosToHUD (1), llXorBase64 (1)
