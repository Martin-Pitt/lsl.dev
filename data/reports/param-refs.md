# Parameter references in generated pages

Written by `scripts/generate-mdx.py` for the pages it created in its last run. Parameter names of a
page's own signature are bold. *normalised*: the wiki already marked the name (code, bold or italic).
*marked*: a bare occurrence of a distinctive name, or a common word in clear context ("the X parameter").
*ambiguous*: a common word left unformatted; check these by hand.

Totals: 169 marked, 1002 normalised, 802 ambiguous (left unformatted), on 373 pages.

Common words (marked only in clear context): `accept`, `action`, `active`, `add`, `address`, `agent`, `alpha`, `amount`, `angle`, `at`, `avatar`, `axes`, `axis`, `base`, `body`, `category`, `changes`, `channel`, `checked`, `color`, `command`, `controls`, `count`, `damage`, `damage_type`, `data`, `delay`, `description`, `destination`, `detect`, `distance`, `edge`, `environment`, `error`, `face`, `first`, `flags`, `force`, `friction`, `group`, `handle`, `header`, `height`, `id`, `index`, `instance`, `item`, `items`, `k`, `left`, `length`, `level`, `limit`, `line`, `link`, `mask`, `material`, `message`, `method`, `mode`, `mouselook`, `name`, `number`, `object`, `objects`, `offset`, `operation`, `options`, `owner`, `parameters`, `parent`, `pass`, `perm`, `permissions`, `point`, `position`, `prim`, `query`, `queue`, `radius`, `range`, `rate`, `reason`, `region`, `rules`, `running`, `script`, `size`, `sound`, `source`, `start`, `status`, `success`, `target`, `test`, `text`, `texture`, `time`, `type`, `u`, `up`, `url`, `username`, `uuid`, `value`, `values`, `velocity`, `volume`, `water`, `x`, `y`

## events/attach

- ambiguous `avatar`: When the object is attached to an avatar
- ambiguous `avatar`: When the avatar wearing the object logs in
- ambiguous `avatar`: <s>When the avatar wearing the object logs out</s>
- ambiguous `avatar`: When the avatar wearing the object teleports
- ambiguous `avatar`: to detect when the avatar teleports
- ambiguous `avatar`: When the avatar wearing the object moves from one region to anoth
- ambiguous `avatar`: to detect when the avatar changes region
- ambiguous `avatar`: ach event. The variable id will be the key of the avatar the scripted object is attached to otherwise it w

## events/changed

- ambiguous `changes`: Multiple changes can be represented in a single event, so use
- ambiguous `changes`: Various changes to the
- ambiguous `changes`: For the same action to be called for multiple changes we can use the following syntax:

## events/control

- normalised: `id`

## events/dataserver

- normalised: `queryid`
- ambiguous `data`: Triggered when task receives asynchronous data
- ambiguous `data`: o maintain variables (or a list) with keys of all data server events you are waiting for, then use

## events/email

- normalised: `address`, `subject`
- ambiguous `address`: The prim's email address is its key with "@lsl.secondlife.com" appended,
- ambiguous `time`: the email(...) event handler can take quite some time, and emails arriving prior to said registry proce

## events/game_control

- normalised: `axes`
- ambiguous `axes`: read the axes list from the end, use negative indexes to access
- ambiguous `axes`: it, or assume it's length, the list may gain new axes over time

## events/http_request

- normalised: `body`
- ambiguous `method`: is not sent with the request unless the method is set to
- ambiguous `body`: if the returned body is
- ambiguous `method`: etrying again. If all your requestors follow some method like this, eventually they'll get through.
- ambiguous `method`: the method will be either
- ambiguous `method`: If the method is
- ambiguous `body`: The body will contain the full url, minus the trailing for

## events/http_response

- normalised: `status`
- ambiguous `body`: The media type of the entity body.

## events/link_message

- normalised: `id`, `sender_num`, `str`

## events/linkset_data

- normalised: `value`

## events/listen

- ambiguous `channel`: Chat channel reserved for script debugging and error messages,
- ambiguous `channel`: Chat channel that broadcasts to all nearby users. This channel
- ambiguous `channel`: channel that broadcasts to all nearby users. This channel is sometimes referred to as: open chat, local cha
- ambiguous `channel`: er the listen event by chatting on an alternative channel such as '/5 hello'.

## events/money

- normalised: `amount`, `id`

## events/on_rez

- normalised: `start_param`

## events/path_update

- ambiguous `type`: ) type may never occur as a new goal may be chosen when

## events/run_time_permissions

- normalised: `perm`

## events/sensor

- normalised: `num_detected`

## events/touch

- normalised: `num_detected`

## events/touch_end

- normalised: `num_detected`

## events/touch_start

- normalised: `num_detected`

## events/transaction_result

- normalised: `data`
- ambiguous `data`: Triggered when task receives asynchronous data
- ambiguous `data`: Error Tag (Returned from data)

## functions/llAbs

- normalised: `val`

## functions/llAcos

- normalised: `val`

## functions/llAddToLandBanList

- normalised: `avatar`, `hours`

## functions/llAddToLandPassList

- normalised: `avatar`, `hours`

## functions/llAdjustSoundVolume

- normalised: `volume`

## functions/llAgentInExperience

- normalised: `agent`

## functions/llAllowInventoryDrop

- ambiguous `add`: llows for all users without modify permissions to add inventory items to a prim.

## functions/llApplyImpulse

- normalised: `momentum`
- marked `momentum`: Sets an initial momentum on the object applied to the center of Mass . Mom
- marked `momentum`: available energy. For heavy objects , the cap of momentum will be momentum = 20000 . ( and not 20 as told p
- marked `momentum`: . For heavy objects , the cap of momentum will be momentum = 20000 . ( and not 20 as told previously ). For
- marked `momentum`: will be capped to 202 meters/second ( and so the momentum will reflect this cap )

## functions/llAsin

- normalised: `val`

## functions/llAtan2

- normalised: `x`, `y`

## functions/llAttachToAvatar

- normalised: `attach_point`

## functions/llAttachToAvatarTemp

- normalised: `attach_point`

## functions/llAvatarOnLinkSitTarget

- ambiguous `link`: The root link number changes from zero to one when someone sits
- ambiguous `link`: is always true. Nobody ever sits on link number 0
- ambiguous `link`: full, the sit target of the prim with the lowest link number will be used.

## functions/llAxisAngle2Rot

- normalised: `angle`, `axis`
- ambiguous `angle`: need to be between the value 0<angle<

## functions/llBase64ToInteger

- normalised: `str`

## functions/llBase64ToString

- normalised: `str`

## functions/llBreakLink

- normalised: `link`
- ambiguous `link`: This function silently fails if the link number refers to a seated avatar. Use

## functions/llCSV2List

- normalised: `src`

## functions/llCastRay

- normalised: `options`
- ambiguous `options`: e return of successful raycast, using the default options:

## functions/llCeil

- normalised: `val`

## functions/llChar

- normalised: `val`

## functions/llClearLinkMedia

- normalised: `face`, `link`

## functions/llClearPrimMedia

- normalised: `face`

## functions/llCollisionFilter

- normalised: `accept`, `id`, `name`
- ambiguous `accept`: , only accept collisions with objects

## functions/llCollisionSound

- normalised: `impact_sound`, `impact_volume`

## functions/llComputeHash

- normalised: `algorithm`, `message`

## functions/llCos

- normalised: `theta`

## functions/llCreateCharacter

- ambiguous `options`: ately the size of the linkset, adjustable via the options list. The linkset must use the land impact accoun

## functions/llCreateKeyValue

- normalised: `k`, `v`

## functions/llCreateLink

- normalised: `parent`, `target`
- ambiguous `parent`: ) are inserted into the parent object's link set starting at link number 2. For
- ambiguous `parent`: number 2. For example, if the link order for the parent object is A1, A2, A3 and the link order of the ch
- ambiguous `parent`: If the the parent object and

## functions/llDamage

- ambiguous `damage`: This function delivers damage to tasks and agent in the same region.
- ambiguous `damage`: function triggers a damage event on the targeted task. If any scripts in the
- ambiguous `target`: event on the targeted task. If any scripts in the target process the
- ambiguous `damage`: event, they will be fired before the damage is applied or distributed.
- ambiguous `damage`: System damage generated by impact with terrain or a prim.
- ambiguous `damage`: Generic or legacy damage.
- ambiguous `damage`: nes for their own combat systems or repurpose the damage type fields.
- ambiguous `damage`: for the community to recognise and re-use custom damage types here is a table
- ambiguous `damage`: Negative damage to heal a wound, damaged limb, first aid, etc. In
- ambiguous `damage`: or generic healing of biological nature. Positive damage would be medical malpractice
- ambiguous `damage`: Negative damage from repairing an object or something mechanical,
- ambiguous `damage`: or wrench on a vehicle/robot/mech, etc. Positive damage can be due to mistakes, low skill or sabotage. In
- ambiguous `damage`: water pressure. More of a constant type of force damage — can be nullified/reduced via diving suit
- ambiguous `damage`: Special damage to indicate combatant chose to redeploy. You can
- ambiguous `damage`: eds, such as starvation and dehydration. Negative damage used to heal through recovery by food and water
- ambiguous `damage`: Triggering the damage throttle will shout an error to the debug channel
- ambiguous `damage`: containing the script and the prim receiving the damage must both be in damage enable parcels.
- ambiguous `damage`: and the prim receiving the damage must both be in damage enable parcels.
- ambiguous `damage`: Targeting a seated avatar will redirect damage to the object the avatar is sitting on.
- ambiguous `damage`: event will NOT be triggered if the source of the damage is either:
- ambiguous `damage`: The damage throttle is skipped if:

## functions/llDeleteKeyValue

- normalised: `k`

## functions/llDeleteSubList

- normalised: `src`

## functions/llDeleteSubString

- normalised: `src`

## functions/llDetectedDamage

- normalised: `number`

## functions/llDetectedGrab

- normalised: `number`

## functions/llDetectedGroup

- normalised: `number`

## functions/llDetectedKey

- normalised: `number`

## functions/llDetectedName

- normalised: `item`
- ambiguous `item`: If the item detected is an avatar then the

## functions/llDetectedOwner

- normalised: `number`

## functions/llDetectedPos

- ambiguous `number`: if number is not valid sensed object.
- ambiguous `number`: object number.

## functions/llDetectedRezzer

- normalised: `number`

## functions/llDetectedRot

- normalised: `number`

## functions/llDetectedTouchFace

- ambiguous `index`: that is the index of the face the avatar clicked on.

## functions/llDetectedType

- normalised: `number`

## functions/llDetectedVel

- normalised: `number`

## functions/llDialog

- normalised: `buttons`, `channel`
- marked `buttons`: to expect that the response may not be one of the buttons.
- marked `buttons`: if the user click the special "Mute" or "Ignore" buttons, respectively.
- marked `buttons`: (released in 2012) the viewer treated the buttons with values of "Mute" and "Ignore" as being equiv
- marked `buttons`: gnore" as being equivalent to the dialogs special buttons "Mute" and "Ignore". This was changed as a result
- marked `buttons`: there are more than 12 buttons.
- ambiguous `channel`: havior, but generally you'd want to use a private channel instead.
- marked `buttons`: . You simply get one page with a max of 12 buttons, that's it. If you want a different dialog menu l
- marked `buttons`: erent dialog menu layout (other info and/or other buttons), you'll have to build that functionality into yo
- ambiguous `channel`: It is a good idea to use a very negative channel (if never more negative than the most negative 32
- ambiguous `channel`: t all of your scripted objects have a unique chat channel with this small function:
- ambiguous `channel`: function uses public information to generate the channel number it should by no means considered secret.
- ambiguous `channel`: This next version returns a channel number between -1073741823 (0xBFFFFFFF) and -2147
- marked `buttons`: : Too many lines will hide some of the buttons or all of them outside the window though
- ambiguous `channel`: definition IS said, up to 24 chars, into the chat channel even though fewer characters may be displayed in

## functions/llDumpList2String

- normalised: `separator`, `src`

## functions/llEdgeOfWorld

- normalised: `dir`, `pos`

## functions/llEjectFromLand

- normalised: `avatar`

## functions/llEmail

- normalised: `address`, `subject`
- ambiguous `address`: The entire message (including the address, subject and other miscellaneous fields) can't be
- marked `subject`: The entire message (including the address, subject and other miscellaneous fields) can't be longer t
- marked `subject`: The 4096-byte size limit includes the subject line and automatically added text. The practical
- marked `subject`: characters are present in the subject. However, non-ASCII characters in the message bod
- ambiguous `address`: e sending email to a prim within Second Life, its address is
- ambiguous `address`: ", then its email address is "
- ambiguous `address`: string — address — Who sent the message
- marked `subject`: string — subject — Subject of the message

## functions/llEscapeURL

- normalised: `url`

## functions/llEvade

- normalised: `target`

## functions/llExecCharacterCmd

- ambiguous `command`: Send a command to the pathing system.

## functions/llFabs

- normalised: `val`

## functions/llFindNotecardTextSync

- marked `pattern`: urns a list of lines and columns where the search pattern is found in the notecard.
- marked `pattern`: a cached notecard for lines containing the given pattern. If the notecard is not in the cache, returns a l
- marked `pattern`: , otherwise a list of matches of the pattern in the notecard. If no matches are found, or the

## functions/llFleeFrom

- normalised: `distance`, `position`
- ambiguous `position`: The position vector can be set outside the current region by u

## functions/llFloor

- normalised: `val`

## functions/llForceMouselook

- ambiguous `mouselook`: The user may exit mouselook mode at any time.

## functions/llFrand

- normalised: `mag`

## functions/llGetAgentInfo

- normalised: `id`

## functions/llGetAgentLanguage

- normalised: `avatar`
- ambiguous `avatar`: esults this function returning 'american' for the avatar.

## functions/llGetAgentList

- normalised: `scope`
- marked `scope`: in the region limited to the area(s) specified by scope

## functions/llGetAgentSize

- normalised: `avatar`
- ambiguous `avatar`: is not in the region or if it is not an avatar.
- ambiguous `avatar`: eturned vector is an estimate calculated from the avatar's current shape including shoes. x is a constant
- ambiguous `avatar`: , z is the approximate total height of all avatar's bones, with an arbitrary amount added or subtra
- ambiguous `avatar`: s function to determine the rendered height of an avatar with any degree of confidence.
- ambiguous `avatar`: e Server 13.11.19.284082, the return value is the avatar's reported
- ambiguous `avatar`: y been redefined with major physics upgrades.) An avatar's bounding box changes when an avatar sits, while
- ambiguous `avatar`: grades.) An avatar's bounding box changes when an avatar sits, while
- ambiguous `avatar`: if an avatar is in the same region.
- ambiguous `avatar`: if a UUID known to be in the region is an avatar.
- ambiguous `avatar`: is 1.9. This will be the z value if an avatar's shape has
- ambiguous `avatar`: possible but extremely rare to see a fully loaded avatar with this exact size, so:

## functions/llGetAlpha

- normalised: `face`

## functions/llGetAnimation

- ambiguous `avatar`: about the running animations, but may not reflect avatar state as accurately as
- ambiguous `avatar`: of the currently playing locomotion animation for avatar
- ambiguous `avatar`: his function can return an empty string while the avatar is logging out.

## functions/llGetAnimationList

- normalised: `avatar`
- ambiguous `avatar`: the list returned may not accurately reflect the avatar's state. Use
- ambiguous `avatar`: — Gets the avatar info
- ambiguous `avatar`: — Get the avatar's base animation state
- ambiguous `avatar`: — Start an animation on an avatar
- ambiguous `avatar`: — Stop an animation playing on an avatar

## functions/llGetAnimationOverride

- normalised: `anim_state`

## functions/llGetAttachedList

- normalised: `avatar`
- ambiguous `avatar`: If avatar is a child agent, ["NOT ON REGION"] is returned.
- ambiguous `avatar`: If avatar is not a main agent and not a child agent or not
- ambiguous `avatar`: When an avatar first arrives in a region, there is a brief perio

## functions/llGetAttachedListFiltered

- normalised: `avatar`
- ambiguous `avatar`: If avatar is a child agent, ["NOT ON REGION"] is returned.
- ambiguous `avatar`: If avatar is not a main agent and not a child agent or not
- ambiguous `avatar`: Returns a list of attachments on the avatar.
- ambiguous `options`: options which will limit the returned attachments to only
- ambiguous `avatar`: The avatar must have accepted the experience
- ambiguous `avatar`: avatar center/root
- ambiguous `avatar`: When an avatar first arrives in a region, there is a brief perio

## functions/llGetBoundingBox

- normalised: `object`
- ambiguous `object`: The physical representation of an object is made up of the shape of the prims and avatars
- ambiguous `object`: ch can contain the physical representation of the object and have its faces aligned to the object's local
- ambiguous `object`: n of the object and have its faces aligned to the object's local axes.
- ambiguous `object`: is a non-root prim, the bounding box of the object is returned. This also applies if
- ambiguous `object`: is an agent sitting on an object - the bounding box of the sat-upon object (includ
- ambiguous `object`: g on an object - the bounding box of the sat-upon object (including the agent's shape) is returned.
- ambiguous `object`: Avatars historically when they sit upon an object have been treated as part of the object, like a p
- ambiguous `object`: t upon an object have been treated as part of the object, like a prim, even being assigned a link number (
- ambiguous `object`: equesting the bounding box for a child prim of an object would return the bounding box for the entire obje
- ambiguous `object`: ject would return the bounding box for the entire object (unless it was an attachment, which point it woul
- ambiguous `object`: nt while seated returned the bounding box for the object sat upon. It got reported as a bug
- ambiguous `object`: ior was changed in 1.36. The bounding box for the object sat upon is unchanged by 1.36, the avatar still c
- ambiguous `object`: atar is requested it does not fall through to the object being sat upon.

## functions/llGetClosestNavPoint

- normalised: `point`
- ambiguous `point`: Used to get a point on the navmesh that is the closest point to
- ambiguous `point`: to get a point on the navmesh that is the closest point to
- ambiguous `point`: containing a single vector which is the closest point on the navmesh to the point provided or an empty
- ambiguous `point`: which is the closest point on the navmesh to the point provided or an empty list.
- ambiguous `point`: Limits how far out to search for a navigation point.
- ambiguous `point`: exists from your current location to the returned point.

## functions/llGetColor

- normalised: `face`

## functions/llGetDisplayName

- normalised: `id`

## functions/llGetEnv

- normalised: `name`

## functions/llGetEnvironment

- marked `params`: ibutes. Takes a list of attributes to retrieve in params and returns them in the order requested.

## functions/llGetExperienceDetails

- normalised: `experience_id`

## functions/llGetExperienceErrorMessage

- normalised: `error`
- ambiguous `error`: a text description of a particular Experience LSL error constant.
- ambiguous `error`: describing the error code passed or the string corresponding to
- ambiguous `error`: is not a valid error code.
- ambiguous `error`: no error
- ambiguous `error`: No error was detected.
- ambiguous `error`: unknown error
- ambiguous `error`: An unknown error not covered by any of the other predetermined err
- ambiguous `error`: ror not covered by any of the other predetermined error states.

## functions/llGetGameControlMode

- normalised: `id`

## functions/llGetGameControlModeAxes

- normalised: `id`

## functions/llGetGameControlModeButtons

- normalised: `id`

## functions/llGetHTTPHeader

- normalised: `header`, `request_id`
- ambiguous `header`: Returns an empty string if the header is not found, if the
- ambiguous `header`: header
- ambiguous `header`: header
- ambiguous `header`: The user-agent header as reported by the requester
- ambiguous `header`: The user-agent header sent by LSL Scripts. Contains Server version.
- ambiguous `header`: "Content-Type" is an example of a normal header name, in a CGI environment the name would be "HTT
- ambiguous `header`: ust be lower case (or it will match nothing). All header names are converted to lower case when they are r

## functions/llGetInventoryAcquireTime

- ambiguous `item`: with the timestamp that the item was added to the prim's inventory.
- ambiguous `item`: If there is no other item in the inventory, you get the timestamp from the
- ambiguous `item`: — Returns the inventory item's creator
- ambiguous `item`: — Returns the inventory item's name
- ambiguous `item`: — Tests to see if an inventory item exists and returns its type
- ambiguous `item`: — Returns the inventory item's permissions
- ambiguous `item`: — Returns the inventory item's

## functions/llGetInventoryCreator

- normalised: `item`
- ambiguous `item`: — Returns the time the item was added to the prim's inventory
- ambiguous `item`: — Returns the inventory item's name
- ambiguous `item`: — Tests to see if an inventory item exists and returns its type
- ambiguous `item`: — Returns the inventory item's permissions
- ambiguous `item`: — Returns the inventory item's

## functions/llGetInventoryDesc

- normalised: `item`
- ambiguous `item`: — Returns the time the item was added to the prim's inventory
- ambiguous `item`: — Returns the inventory item's name
- ambiguous `item`: — Tests to see if an inventory item exists and returns its type
- ambiguous `item`: — Returns the inventory item's permissions
- ambiguous `item`: — Returns the inventory item's

## functions/llGetInventoryKey

- ambiguous `item`: asset key is assigned to the edit. The inventory item used to open the asset for editing is updated wit
- ambiguous `item`: urned is that of the asset to which the inventory item points, it is not the UUID of the inventory item
- ambiguous `item`: item points, it is not the UUID of the inventory item itself. The assets themselves are immutable (they
- ambiguous `item`: — Returns the time the item was added to the prim's inventory
- ambiguous `item`: — Returns the inventory item's name
- ambiguous `item`: — Tests to see if an inventory item exists and returns its type
- ambiguous `item`: — Returns the inventory item's permissions
- ambiguous `item`: — Returns the inventory item's creator

## functions/llGetInventoryName

- normalised: `type`
- ambiguous `type`: turns an empty string if no item of the specified type is found in the prim's inventory (or there are le
- ambiguous `type`: items of the type).
- ambiguous `type`: Any inventory type.
- ambiguous `type`: — Returns the number of items of a specific type in inventory
- ambiguous `type`: o see if an inventory item exists and returns its type.

## functions/llGetInventoryNumber

- normalised: `type`
- ambiguous `type`: Any inventory type.
- ambiguous `type`: o see if an inventory item exists and returns its type.

## functions/llGetInventoryPermMask

- normalised: `item`
- ambiguous `group`: Active group permissions.
- ambiguous `item`: — Returns the time the item was added to the prim's inventory
- ambiguous `item`: — Returns the inventory item's name
- ambiguous `item`: — Tests to see if an inventory item exists and returns its type
- ambiguous `item`: — Returns the inventory item's
- ambiguous `item`: — Returns the inventory item's creator

## functions/llGetInventoryType

- ambiguous `item`: tion ideal for testing the existence of a certain item in
- ambiguous `item`: that is the type of the inventory item
- ambiguous `item`: — Returns the time the item was added to the prim's inventory
- ambiguous `item`: — Returns the inventory item's name
- ambiguous `item`: — Returns the inventory item's creator
- ambiguous `item`: — Returns the inventory item's permissions
- ambiguous `item`: — Returns the inventory item's

## functions/llGetLandOwnerAt

- normalised: `pos`

## functions/llGetLinkMedia

- normalised: `face`, `link`
- marked `params`: Get the media params for a particular
- ambiguous `face`: before a piece of media is active) for the chosen face. The default image is specified by Second Life's
- ambiguous `face`: Gets the current url displayed on the chosen face. Changing this URL causes navigation. 1024 charac
- ambiguous `face`: Gets the home url for the chosen face. 1024 characters max
- ambiguous `face`: n someone click on a playing, but unfocused media face:
- ambiguous `face`: : Does the same thing a focused media face does, and forwards the click to the web browser.

## functions/llGetLinkName

- normalised: `link`
- ambiguous `link`: in link set
- ambiguous `link`: — Gets the instance UUID of the link

## functions/llGetLinkNumberOfSides

- normalised: `link`

## functions/llGetLinkPrimitiveParams

- normalised: `link`
- ambiguous `link`: Passing 0 (zero) as the link number in the formal link parameter on a linked o
- marked `link`: Passing 0 (zero) as the link number in the formal link parameter on a linked object will return an empty

## functions/llGetLinkSitFlags

- ambiguous `link`: Returns the current flags on the link's sittarget.
- ambiguous `link`: Read-only flag to indicate whether the link has a sit target. Use

## functions/llGetListLength

- normalised: `src`

## functions/llGetNextEmail

- normalised: `address`, `subject`

## functions/llGetNotecardLine

- normalised: `line`, `name`
- ambiguous `line`: Requests the line
- ambiguous `line`: will be returned, regardless of the line requested.
- ambiguous `line`: If the requested line is longer than 1024 bytes (
- ambiguous `line`: of the line.
- ambiguous `line`: To check that the returned line has not been truncated, use the example snippet o

## functions/llGetNotecardLineSync

- normalised: `line`, `name`
- ambiguous `line`: unction returns a string containing the requested line from a notecard in prim inventory, without the ne
- ambiguous `line`: will be returned, regardless of the line requested.
- ambiguous `line`: If the requested line is longer than 1024 bytes (
- ambiguous `line`: of the line.
- ambiguous `line`: To check that the returned line has not been truncated, use the example snippet o
- ambiguous `line`: un out of free memory, even if you overwrite each line as you read it.

## functions/llGetNumberOfNotecardLines

- normalised: `name`

## functions/llGetObjectDetails

- normalised: `id`, `params`
- ambiguous `id`: Gets the id of the
- ambiguous `id`: is an avatar, returns the id of the
- ambiguous `id`: is sitting on and linked to (or the avatar's own id if the avatar is not sitting on an object within

## functions/llGetObjectMass

- normalised: `id`

## functions/llGetObjectPermMask

- ambiguous `group`: Active group permissions.

## functions/llGetObjectPrimCount

- normalised: `prim`
- ambiguous `prim`: is not a prim.
- ambiguous `prim`: The prim count for attachments are not returned

## functions/llGetOwnerKey

- normalised: `id`
- ambiguous `id`: if the id passed in is not a valid key

## functions/llGetParcelDetails

- normalised: `params`, `pos`

## functions/llGetParcelFlags

- normalised: `pos`

## functions/llGetParcelMaxPrims

- normalised: `pos`, `sim_wide`

## functions/llGetParcelPrimCount

- normalised: `category`, `pos`, `sim_wide`
- ambiguous `category`: sim owned by the specified parcel's owner of the category requested.
- ambiguous `category`: the return is the object land impact used of the category requested on the parcel specified.

## functions/llGetParcelPrimOwners

- normalised: `pos`

## functions/llGetPrimMediaParams

- marked `params`: Get the media params for a particular face on an object, given the des
- ambiguous `face`: Get the media params for a particular face on an object, given the desired list of names.
- ambiguous `face`: Returns an empty list if no media exists on the face.
- ambiguous `face`: before a piece of media is active) for the chosen face. The default image is specified by Second Life's
- ambiguous `face`: Gets the current url displayed on the chosen face. Changing this URL causes navigation. 1024 charac
- ambiguous `face`: Gets the home url for the chosen face. 1024 characters max
- ambiguous `face`: n someone click on a playing, but unfocused media face:
- ambiguous `face`: : Does the same thing a focused media face does, and forwards the click to the web browser.

## functions/llGetRenderMaterial

- normalised: `face`

## functions/llGetScriptState

- normalised: `script`
- ambiguous `script`: even if the script had encountered a

## functions/llGetStaticPath

- normalised: `radius`
- ambiguous `radius`: Set collision capsule radius.
- ambiguous `radius`: plus 0.1m, it will be set to twice the radius plus 0.1m.
- ambiguous `radius`: The character's turn radius when traveling at

## functions/llGetStatus

- normalised: `status`
- ambiguous `status`: attribute; all prims in an object share the same status.
- ambiguous `status`: — Sets the object status.

## functions/llGetSubString

- normalised: `src`

## functions/llGetTexture

- normalised: `face`

## functions/llGetTextureOffset

- normalised: `face`

## functions/llGetTextureRot

- normalised: `face`

## functions/llGetTextureScale

- normalised: `face`
- ambiguous `face`: g mode the scale units are in texture repeats per face. In the planar texture mapping mode the scale uni
- ambiguous `face`: seems to return the scale of the *first* face, not an average or other function of all the face

## functions/llGetUsername

- normalised: `id`

## functions/llGetVisualParams

- normalised: `agentid`, `params`

## functions/llGiveAgentInventory

- normalised: `agent`, `folder`
- ambiguous `items`: items to
- ambiguous `items`: Places the inventory items in a newly created folder in the avatar's invento
- marked `folder`: Places the inventory items in a newly created folder in the avatar's inventory (even if there is a fol
- marked `folder`: der in the avatar's inventory (even if there is a folder by the same name, a new one is created).
- marked `folder`: s a root path that will be used as the parent for folder. If the root path does not exist it will be creat
- ambiguous `options`: A bad option was passed in the options list.
- ambiguous `agent`: Could not find the receiving agent in the current region.
- ambiguous `items`: The list of items was empty or contained only non-transferable item
- ambiguous `items`: tems was empty or contained only non-transferable items.
- ambiguous `items`: Any no-copy items in
- ambiguous `items`: Any no-transfer items in
- marked `folder`: . The destination folder will be named
- marked `folder`: and will be created under the main folder
- marked `folder`: be duplicated, however the destination folder

## functions/llGiveInventory

- ambiguous `target`: It is not put in the target's trash folder.
- ambiguous `item`: d slow enough that it takes ~45 minutes to send 1 item to each subscriber. A general safe way would be t

## functions/llGiveInventoryList

- normalised: `folder`, `target`
- ambiguous `items`: items to
- ambiguous `items`: Places the inventory items in a newly created folder in the avatars inventor
- marked `folder`: Places the inventory items in a newly created folder in the avatars inventory (even if there is a fold
- marked `folder`: lder in the avatars inventory (even if there is a folder by the same name, a new one is created).
- marked `folder`: create a folder.

## functions/llGiveMoney

- normalised: `amount`, `destination`

## functions/llGround

- normalised: `offset`

## functions/llGroundContour

- normalised: `offset`

## functions/llGroundNormal

- normalised: `offset`

## functions/llGroundRepel

- normalised: `height`
- ambiguous `water`: of ground or water level (which ever is higher).
- ambiguous `height`: A negative height value allows you to hover underwater, same as

## functions/llGroundSlope

- normalised: `offset`

## functions/llHMAC

- normalised: `algorithm`, `msg`
- marked `algorithm`: when using hash algorithm

## functions/llHTTPRequest

- ambiguous `body`: nds an HTTP request to the specified URL with the body of the request and parameters. When the response
- ambiguous `parameters`: he specified URL with the body of the request and parameters. When the response is received, a
- ambiguous `body`: x-www-form-urlencoded. This allows you to set the body to a properly escaped (
- ambiguous `body`: (UTF-8 encoded) byte length of the HTTP response body. The maximum that can be set depends upon which V
- ambiguous `parameters`: parameters can be passed to limit the number of mime types t
- ambiguous `parameters`: cified mime types may include character set and q parameters. This parameter may be specified multiple times.
- ambiguous `parameters`: parameters. If the value of the header is not in the list of
- ambiguous `body`: will return 415 as a result code and the body will be "Unsupported or unknown Content-Type."
- ambiguous `body`: The media type of the entity body.
- ambiguous `body`: The response body is limited to 2048 bytes by default, see
- ambiguous `body`: The request body size (e.g., of POST and PUT requests) is limited
- ambiguous `body`: edirected to unless that was also included in the body.
- ambiguous `body`: in the body of the response. This has been confirmed as expec

## functions/llHTTPResponse

- normalised: `body`, `request_id`, `status`

## functions/llIntegerToBase64

- normalised: `number`

## functions/llIsFriend

- normalised: `agent_id`
- marked `agent_id`: If the agent_id does not specify an agent.

## functions/llIsLinkGLTFMaterial

- normalised: `face`
- ambiguous `link`: if link does not exist or refers to a multi-link target (
- ambiguous `face`: if face does not exist.

## functions/llJson2List

- normalised: `src`

## functions/llJsonGetValue

- normalised: `json`, `specifiers`
- marked `specifiers`: Gets the value indicated by specifiers from the
- marked `json`: , a string representing json and traversing as specified by

## functions/llJsonSetValue

- normalised: `json`, `specifiers`, `value`
- ambiguous `value`: with the value indicated by the
- ambiguous `value`: is the magic value
- ambiguous `value`: . If a value does not exist at
- ambiguous `value`: To delete an existing value at
- ambiguous `value`: is roughly 2.8x as fast in replacing a single value of a list than
- ambiguous `value`: is to replace a single value in a json.
- marked `json`: is to replace a single value in a json.
- marked `json`: :The length of the list/json are irrelevant here.
- ambiguous `value`: as the JSON value.

## functions/llJsonValueType

- normalised: `json`, `specifiers`

## functions/llKey2Name

- normalised: `id`

## functions/llLinear2sRGB

- ambiguous `color`: Transforms a color specified in linear RGB colorspace into the sRGB
- ambiguous `color`: me of this function is actually a misnomer as LSL color is actually in
- ambiguous `color`: Scripting for PBR-enabled viewers: If you enter color vectors manually, using the viewer's color picker
- ambiguous `color`: enter color vectors manually, using the viewer's color picker, enter them as sRGB values. The color pick
- ambiguous `color`: er's color picker, enter them as sRGB values. The color picker automatically converts them internally to
- ambiguous `color`: ed viewer will see them correctly. When you apply color vectors directly with a script, however, you must

## functions/llLinkParticleSystem

- normalised: `link`, `rules`

## functions/llLinkPlaySound

- normalised: `sound`, `volume`
- ambiguous `sound`: This is the default behavior. Plays the sound once, attached to the linked primitive.
- ambiguous `sound`: Loops the sound attached to the linked primitive.
- ambiguous `sound`: Triggers the sound at the location of the linked prim. The sound is
- ambiguous `sound`: the sound at the location of the linked prim. The sound is not attached and does not move with the prim.
- ambiguous `sound`: Synchronizes sound playback to the nearest sound master. Please see
- ambiguous `sound`: Synchronizes sound playback to the nearest sound master. Please see
- ambiguous `sound`: replaces any other sound (so that only one sound can be played at the same
- ambiguous `sound`: replaces any other sound (so that only one sound can be played at the same time from the same prim
- ambiguous `sound`: which always plays sound files till the end.
- ambiguous `sound`: If the object playing the sound is a
- ambiguous `sound`: , the sound is only heard by the user the HUD is attached to.
- ambiguous `sound`: To play a sound inworld from a HUD use
- ambiguous `sound`: If multiple sound emitters play the same exact sound within range o
- ambiguous `sound`: If multiple sound emitters play the same exact sound within range of the viewer at the same time, they
- ambiguous `sound`: This can be fixed by disabling the sound queue if only a single sound sample is to be play
- ambiguous `sound`: xed by disabling the sound queue if only a single sound sample is to be played.
- ambiguous `sound`: to stop a looped sound started in a link with
- ambiguous `link`: to stop a looped sound started in a link with
- ambiguous `link`: sufficiently. The throttle is per object, not per link or per script, so multiple links cannot be used t
- ambiguous `sound`: g error will be shown in debug channel: "Too many sound requests. Throttled until average falls."
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Preloads sound on viewers within range.
- ambiguous `volume`: — 3=Adjusts volume of
- ambiguous `sound`: sound.

## functions/llLinkSitTarget

- normalised: `link`, `offset`, `rot`
- ambiguous `offset`: . This offset is
- ambiguous `offset`: sion 0.8), but there is more to it than just this offset (opensim and SL remain incompatible). You can fin
- ambiguous `link`: full, the sit target of the prim with the lowest link number will be used.

## functions/llLinksetDataCountFound

- normalised: `pattern`
- marked `pattern`: r of keys in the linkset datastore that match the pattern supplied in the
- marked `pattern`: the keys in the datastore that match the supplied pattern.

## functions/llLinksetDataDelete

- normalised: `name`
- ambiguous `name`: name:value
- ambiguous `name`: name:value
- ambiguous `name`: name:value
- ambiguous `name`: name:value
- ambiguous `name`: name:value
- ambiguous `name`: The name supplied to
- ambiguous `name`: name:value
- ambiguous `name`: name:value

## functions/llLinksetDataDeleteFound

- normalised: `pass`, `pattern`
- ambiguous `pass`: te protected key-value pairs only if the matching pass phrase is passed in the
- ambiguous `pass`: s that could not be deleted due to a non-matching pass phrase.

## functions/llLinksetDataFindKeys

- normalised: `count`, `pattern`, `start`

## functions/llLinksetDataListKeys

- normalised: `count`, `start`

## functions/llLinksetDataRead

- normalised: `name`
- ambiguous `name`: name:value
- ambiguous `name`: name:value

## functions/llLinksetDataWrite

- normalised: `name`, `value`
- ambiguous `name`: name:value
- ambiguous `value`: name:value
- ambiguous `name`: name:value
- ambiguous `value`: name:value
- ambiguous `name`: name:value
- ambiguous `value`: name:value
- ambiguous `name`: name:value
- ambiguous `value`: name:value
- ambiguous `name`: The name supplied to
- ambiguous `name`: name:value
- ambiguous `value`: name:value
- ambiguous `name`: name:value
- ambiguous `value`: name:value
- ambiguous `value`: as not changed by the write operation because the value stored matches the value written.
- ambiguous `value`: te operation because the value stored matches the value written.
- ambiguous `value`: Rewriting an existing value to a
- ambiguous `name`: name:value
- ambiguous `value`: name:value
- ambiguous `name`: Writing an empty string to a nonexistent name in the datastore returns

## functions/llList2CSV

- normalised: `src`

## functions/llList2Float

- normalised: `index`, `src`

## functions/llList2Integer

- normalised: `index`, `src`

## functions/llList2Json

- normalised: `type`, `values`
- ambiguous `type`: If type is
- ambiguous `type`: If type is
- ambiguous `type`: If type is any other string then
- ambiguous `type`: rom the input list are inferred from the LSL data type
- ambiguous `values`: values for different situation (like different animation

## functions/llList2Key

- normalised: `index`, `src`

## functions/llList2List

- normalised: `src`

## functions/llList2ListSlice

- normalised: `slice_index`, `stride`
- marked `stride`: is negative it is counted from the end of its stride regardless of whether or not the stride exceeds t
- marked `stride`: nd of its stride regardless of whether or not the stride exceeds the end of the list. e.g: -1 is the last
- marked `stride`: end of the list. e.g: -1 is the last element in a stride.
- marked `slice_index`: of the slice_index'th element of every stride in
- marked `stride`: of the slice_index'th element of every stride in
- marked `slice_index`: -1 items. returns the slice_index element of the stride if its position is less tha
- marked `stride`: -1 items. returns the slice_index element of the stride if its position is less than list length.
- marked `stride`: If the list is not modulo the stride, elements up to the length of the list will be re
- marked `stride`: hing conditions. e.g. a list of 5 elements with a stride of 2 will return 3 elements for a 0,5 range on sl
- marked `slice_index`: or a 0,5 range on slice index 0 but only 2 if the slice_index is 1.

## functions/llList2ListStrided

- normalised: `stride`
- marked `stride`: u want every second (or third, etc.) item in each stride returned, rather than the first, use

## functions/llList2Rot

- normalised: `index`, `src`
- marked `src`: (src, index);
- ambiguous `index`: (src, index);

## functions/llList2String

- normalised: `index`, `src`

## functions/llList2Vector

- normalised: `index`, `src`
- marked `src`: (src, index);
- ambiguous `index`: (src, index);
- marked `src`: (src, index), or (string)
- ambiguous `index`: (src, index), or (string)
- marked `src`: (src, index), spaces are automatically added after the
- ambiguous `index`: (src, index), spaces are automatically added after the commas

## functions/llListFindList

- normalised: `src`, `test`

## functions/llListFindListNext

- normalised: `src`, `test`
- marked `instance`: which adds an instance parameter to select the nth match to test paramet
- marked `test`: an instance parameter to select the nth match to test parameter.
- ambiguous `test`: using a test of [ 'Resident' ] and an instance of 0, 1, 2, 3 w
- ambiguous `instance`: using a test of [ 'Resident' ] and an instance of 0, 1, 2, 3 would return indices of 0, 2, 4, an
- ambiguous `instance`: Selecting the 4th or greater instance will not be found and will return -1.
- ambiguous `instance`: Reverse indexing is also supported. Using an instance of -1, -2, -3, -4 would respectively return 6, 4,

## functions/llListFindStrided

- normalised: `src`, `stride`, `test`
- marked `stride`: matching range and stride conditions is not found in

## functions/llListInsertList

- normalised: `dest`, `src`, `start`
- ambiguous `start`: Tip! To insert something at the start of a list, you can just add the two lists (puttin

## functions/llListRandomize

- normalised: `src`
- marked `stride`: ize the position of every list element, specify a stride of 1. This is perhaps the setting most used.
- marked `stride`: If the stride is not a factor of the list length, the
- marked `stride`: iginal list are always kept together, because the stride of 2 was specified.

## functions/llListReplaceList

- normalised: `dest`, `src`

## functions/llListSort

- normalised: `src`, `stride`
- marked `ascending`: For ascending sort, each type is sorted individually and then f
- marked `ascending`: lly the wiki stated that non-zero values for the "ascending" parameter would produce an ascending sort. That
- marked `ascending`: es for the "ascending" parameter would produce an ascending sort. That was incorrect. For this function, the
- marked `ascending`: ) for an ascending sort.
- marked `ascending`: s are not sorted. An ascending sort will simply leave any rotations unchanged, a
- marked `stride`: When the stride is greater than 1, if the list length is not a mu
- marked `stride`: an 1, if the list length is not a multiple of the stride, the list will be returned unchanged.
- marked `stride`: Most times, you will want to set "integer stride" to 1 (0 also works) to tell it to sort each item
- marked `ascending`: Setting the parameter "integer ascending" to
- marked `ascending`: returns a sorted list that is in ascending order.
- marked `ascending`: Setting the parameter "integer ascending" to
- marked `stride`: — Sort a list by a specific stride index.

## functions/llListSortStrided

- normalised: `src`, `stride`, `stride_index`
- marked `stride_index`: with the added parameter of stride_index, adding the flexibility to sort by any item in th
- marked `stride`: adding the flexibility to sort by any item in the stride. These routines use the same underlying code and
- marked `ascending`: For ascending sort, each type is sorted individually and then f
- marked `ascending`: lly the wiki stated that non-zero values for the "ascending" parameter would produce an ascending sort. That
- marked `ascending`: es for the "ascending" parameter would produce an ascending sort. That was incorrect. For this function, the
- marked `ascending`: ) for an ascending sort.
- marked `ascending`: If a list containing only rotations is sorted in ascending order, it will be returned unchanged.
- marked `stride`: When the stride is greater than 1, if the list length is not a mu
- marked `stride`: an 1, if the list length is not a multiple of the stride, the list will be returned unchanged.
- marked `stride_index`: stride_index must be less than stride and greater than or equa
- marked `stride`: stride_index must be less than stride and greater than or equal to -stride, otherwise a
- marked `stride`: Most times, you will want to set "integer stride" to 1 (0 also works) to tell it to sort each item
- marked `ascending`: Setting the parameter "integer ascending" to
- marked `ascending`: returns a sorted list that is in ascending order.
- marked `ascending`: Setting the parameter "integer ascending" to

## functions/llListStatistics

- normalised: `operation`, `src`
- ambiguous `operation`: Given that this operation ignores any non-numbers in a list, it can be used

## functions/llListen

- normalised: `channel`, `id`, `msg`, `name`
- ambiguous `channel`: the chat bar directly just as any other non-zero channel. Formerly, the standard SL viewer could only send
- ambiguous `channel`: g to an out-of-range integer will be listening to channel -1 instead, or if the number has a minus sign in
- ambiguous `channel`: d, or if the number has a minus sign in front, to channel 1. A safe rule is to never use more than 9 digits
- ambiguous `channel`: e rule is to never use more than 9 digits. If the channel number comes from a conversion from float (for ex
- ambiguous `channel`: Avoid channel zero (

## functions/llListenControl

- normalised: `handle`
- ambiguous `active`: active or inactive

## functions/llListenRemove

- normalised: `handle`

## functions/llLoadURL

- normalised: `avatar`, `message`, `url`
- ambiguous `avatar`: This function silently fails for an avatar that has muted itself.

## functions/llLog

- normalised: `val`

## functions/llLog10

- normalised: `val`

## functions/llLookAt

- normalised: `target`
- marked `strength`: Low strength values paired with low damping can cause the obje
- marked `damping`: Low strength values paired with low damping can cause the object to wobble and never fully fa

## functions/llLoopSound

- normalised: `sound`, `volume`
- ambiguous `sound`: replaces any other sound (so that only one sound can be played at the same
- ambiguous `sound`: replaces any other sound (so that only one sound can be played at the same time from the same prim
- ambiguous `sound`: which always plays sound files till the end. An object can play 2 sounds w
- ambiguous `sound`: If a second call to loop the same sound at a different volume is made from within the sam
- ambiguous `volume`: second call to loop the same sound at a different volume is made from within the same script NO volume cha
- ambiguous `volume`: ent volume is made from within the same script NO volume change is made.
- ambiguous `volume`: set just previous to the second call for a new volume allows the volume change with no discernible paus
- ambiguous `volume`: us to the second call for a new volume allows the volume change with no discernible pause.
- ambiguous `sound`: When call made from HUD attachment sound is only heard by agent the task is attached to.
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Stops playing a looped sound.
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound

## functions/llLoopSoundMaster

- normalised: `sound`, `volume`
- ambiguous `sound`: prim - this means it's possible to queue a slave sound prior to starting a master, without having to use
- ambiguous `sound`: aster on and off. Note that the script requires a sound in inventory called MasterLoop, or you need to ch
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound

## functions/llLoopSoundSlave

- normalised: `sound`, `volume`
- ambiguous `sound`: As an object can only have a single active sound,
- ambiguous `sound`: sync master, otherwise it will remove the master sound, and no sound will be available to sync-to.
- ambiguous `sound`: otherwise it will remove the master sound, and no sound will be available to sync-to.
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound

## functions/llMD5String

- normalised: `nonce`, `src`

## functions/llManageEstateAccess

- normalised: `action`, `avatar`
- ambiguous `action`: if throttled, invalid action, invalid or null id or object owner is not allowe

## functions/llMapBeacon

- normalised: `pos`

## functions/llMapDestination

- normalised: `look_at`, `pos`, `simname`

## functions/llMessageLinked

- normalised: `id`, `link`, `num`, `str`
- ambiguous `link`: is an invalid link number then the function silently fails.

## functions/llMinEventDelay

- ambiguous `delay`: Minimum delay is maintained between state changes.

## functions/llModifyLand

- normalised: `action`, `brush`

## functions/llMoveToTarget

- normalised: `target`, `tau`

## functions/llName2Key

- ambiguous `name`: e region. If there is no agent with the specified name currently signed onto the region, this function r
- ambiguous `name`: the form "First[ Last]" or "first[.last]" (first name with an optional last name.) If the last name is
- ambiguous `name`: "first[.last]" (first name with an optional last name.) If the last name is omitted a last name of "Res
- ambiguous `name`: rst name with an optional last name.) If the last name is omitted a last name of "Resident" is assumed.
- ambiguous `name`: al last name.) If the last name is omitted a last name of "Resident" is assumed. Case is not considered
- ambiguous `name`: s not operate on historical names. For historical name lookup use

## functions/llNavigateTo

- normalised: `pos`

## functions/llOffsetTexture

- normalised: `face`, `u`, `v`

## functions/llOpenFloater

- marked `floater_name`: Known valid values for the floater_name parameter:

## functions/llOrd

- ambiguous `index`: he UTF-32 value of the character at the specified index. If index is outside the bounds of the string, th
- ambiguous `index`: value of the character at the specified index. If index is outside the bounds of the string, this functio

## functions/llOverMyLand

- normalised: `id`

## functions/llOwnerSay

- normalised: `msg`

## functions/llParcelMediaQuery

- normalised: `query`

## functions/llParseString2List

- normalised: `separators`, `spacers`, `src`
- marked `separators`: Only the first 8 separators and first 8 spacers supplied will be used. Any be
- marked `spacers`: Only the first 8 separators and first 8 spacers supplied will be used. Any beyond that will be ig
- marked `separators`: All separators and spacers must be strings. All other types will
- marked `spacers`: All separators and spacers must be strings. All other types will be ignored;
- marked `spacers`: Separators take precedent over spacers. The string is parsed from start to finish. Each
- marked `separators`: to finish. Each position is compared against the separators then spacers before moving onto the next position
- marked `spacers`: position is compared against the separators then spacers before moving onto the next position;
- marked `separators`: Duplicate separators and spacers have no ill effects;
- marked `spacers`: Duplicate separators and spacers have no ill effects;
- marked `spacers`: Examples of processing more than 8 spacers or separators:
- marked `separators`: Examples of processing more than 8 spacers or separators:
- marked `separators`: If you indicate some items as separators, it will split the string where it finds the indi
- marked `separators`: ill split the string where it finds the indicated separators, and strip out the separators.
- marked `separators`: finds the indicated separators, and strip out the separators.
- marked `spacers`: If instead you indicate some items as spacers, it will split the string where it finds the spac
- marked `spacers`: cers, it will split the string where it finds the spacers, but leave the spacers there, including them as s
- marked `spacers`: string where it finds the spacers, but leave the spacers there, including them as separate entries in the

## functions/llParseStringKeepNulls

- normalised: `separators`, `spacers`, `src`

## functions/llParticleSystem

- normalised: `rules`

## functions/llPassCollisions

- normalised: `pass`

## functions/llPassTouches

- normalised: `pass`

## functions/llPatrolPoints

- normalised: `patrolPoints`
- marked `patrolPoints`: object patrolling between the points specified in patrolPoints.

## functions/llPlaySound

- normalised: `sound`, `volume`
- ambiguous `sound`: replaces any other sound (so that only one sound can be played at the same
- ambiguous `sound`: replaces any other sound (so that only one sound can be played at the same time from the same prim
- ambiguous `sound`: which always plays sound files till the end.
- ambiguous `sound`: If the object playing the sound is a
- ambiguous `sound`: , the sound is only heard by the user the HUD is attached to.
- ambiguous `sound`: To play a sound inworld from a HUD use
- ambiguous `sound`: If multiple sound emitters play the same exact sound within range o
- ambiguous `sound`: If multiple sound emitters play the same exact sound within range of the viewer at the same time, they
- ambiguous `sound`: This can be fixed by disabling the sound queue if only a single sound sample is to be play
- ambiguous `sound`: xed by disabling the sound queue if only a single sound sample is to be played.
- ambiguous `sound`: g error will be shown in debug channel: "Too many sound requests. Throttled until average falls."
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound from a prim in the linkset, with flexible options
- ambiguous `sound`: — 3=Preloads sound on viewers in range.
- ambiguous `volume`: — 3=Adjusts volume of
- ambiguous `sound`: sound.

## functions/llPlaySoundSlave

- normalised: `sound`, `volume`
- ambiguous `sound`: As an object can only have a single active sound, this function should be called from a different
- ambiguous `sound`: sync master, otherwise it will remove the master sound, and no sound will be available to sync-to.
- ambiguous `sound`: otherwise it will remove the master sound, and no sound will be available to sync-to.
- ambiguous `sound`: prim - this means it's possible to queue a slave sound prior to starting a master, without having to use
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound
- ambiguous `sound`: — 3=Plays a sound

## functions/llPow

- normalised: `base`, `exponent`

## functions/llPreloadSound

- normalised: `sound`

## functions/llPursue

- normalised: `target`
- ambiguous `target`: Go to a position offset from the target.
- ambiguous `target`: . When enabled, the character will not pick a new target position while there is a something solid between
- ambiguous `target`: s a something solid between the character and the target object/agent.
- ambiguous `target`: ine whether the character attempts to predict the target's future location.
- ambiguous `target`: is called - it only affects target position updates after the target object/agent mo
- ambiguous `target`: it only affects target position updates after the target object/agent moves.

## functions/llPushObject

- normalised: `ang_impulse`, `impulse`, `target`

## functions/llReadKeyValue

- normalised: `k`

## functions/llRegionSay

- normalised: `channel`, `msg`
- ambiguous `channel`: on channel number
- ambiguous `channel`: channel 0, this is a design feature and not a bug.
- ambiguous `channel`: turns on a lamp), consider a very negative channel, e.g.,
- ambiguous `channel`: SIM, one idea is to make both scripts compute the channel based on the owner UUID. e.g. :-
- ambiguous `channel`: will wrap around and display on channel 0, with a range of 100m.

## functions/llRegionSayTo

- normalised: `channel`, `msg`, `target`
- ambiguous `channel`: on channel supplied in
- ambiguous `channel`: on channel
- ambiguous `channel`: throttle of 200 messages sent over 10 seconds on channel
- ambiguous `channel`: a per-sending-object throttle of 100 messages on channel zero over 300 seconds (5 minutes). This throttle
- ambiguous `channel`: Messages sent on channel zero via

## functions/llRemoteLoadScriptPin

- normalised: `pin`, `running`, `start_param`, `target`
- ambiguous `script`: Copy script
- ambiguous `script`: only lasts until the script is reset.
- ambiguous `script`: ser and modify permission has been granted to the script owner via
- ambiguous `script`: , the script owner must be connected to the sim for this funct
- ambiguous `script`: , the error "Task ~Prim~ trying to illegally load script onto task ~Other_Prim~!" is shouted on
- ambiguous `script`: is the script's parent (
- ambiguous `script`: If the object containing this script is deeded to a group, then script
- ambiguous `script`: containing this script is deeded to a group, then script
- ambiguous `script`: When the script is set to run (with
- ambiguous `running`: , the running checkbox or
- ambiguous `script`: Simple script used for setting the pin for a prim, so you can l
- marked `pin`: Simple script used for setting the pin for a prim, so you can later send scripts to it w
- marked `pin`: pin and transfer the script.
- ambiguous `script`: pin and transfer the script.
- ambiguous `script`: after the transfert the helper script in the rezzed prim deletes itself.
- ambiguous `running`: — Set a scripts running state
- ambiguous `script`: — Reset another script in the prim
- ambiguous `script`: In SL 1.25.4 this function will not copy/move any script into an attachment unless the script is full perm
- ambiguous `script`: opy/move any script into an attachment unless the script is full perm. (
- ambiguous `script`: SL 1.25.5 will allow this function to copy/move a script into an attachment so long as the target has matc
- ambiguous `target`: y/move a script into an attachment so long as the target has matching (or more restrictive) copy and trans

## functions/llRemoveFromLandBanList

- normalised: `avatar`

## functions/llRemoveFromLandPassList

- normalised: `avatar`

## functions/llRemoveInventory

- normalised: `item`

## functions/llRemoveVehicleFlags

- normalised: `flags`
- ambiguous `flags`: — Sets vehicle flags

## functions/llReplaceAgentEnvironment

- ambiguous `environment`: function overrides the current region and parcel environment seen by an agent. The new environment persists un
- ambiguous `environment`: and parcel environment seen by an agent. The new environment persists until the agent crosses to a new region
- marked `environment`: or empty string in the environment parameter for the particular agent, doing so will
- ambiguous `environment`: The agent has been instructed to change their environment.
- ambiguous `environment`: The environment inventory object could not be found.
- ambiguous `environment`: An environment set locally on the viewer will override any envir
- ambiguous `environment`: nment set locally on the viewer will override any environment set from this function.
- marked `environment`: If a UUID is passed as the environment parameter and that UUID does not specify an envir
- ambiguous `environment`: nment parameter and that UUID does not specify an environment setting, the viewer quietly ignores the instructi

## functions/llReplaceEnvironment

- ambiguous `environment`: function replaces the environment in a parcel or a region. Either for a single elev
- ambiguous `environment`: Either for a single elevation track or the entire environment. The owner of the script must have permission to
- ambiguous `environment`: er of the script must have permission to edit the environment on the destination parcel, or be an estate manage
- ambiguous `environment`: ction (see table below). However, issues with the environment assets may be reported in the debug chat.
- ambiguous `environment`: rcel or region will attempt to change the applied environment.
- ambiguous `environment`: The environment inventory object could not be found.
- ambiguous `environment`: The script does not have permission to change the environment at the selected location.
- ambiguous `environment`: An environment set locally on the viewer will override any envir
- ambiguous `environment`: nment set locally on the viewer will override any environment set from this function.
- ambiguous `environment`: will be preserved after the environment is replaced by this function. Call
- ambiguous `environment`: The environment specified by this function is applied asynchronou
- ambiguous `environment`: synchronously, as the simulator must download the environment asset before applying it. This means that
- ambiguous `environment`: will not immediately reflect the new environment's parameters, although the delay is typically qui
- marked `environment`: If a UUID is passed as the environment parameter and that UUID does not specify an envir
- ambiguous `environment`: nment parameter and that UUID does not specify an environment setting or one can not be constructed, the functi
- ambiguous `environment`: the group, or the script owner must have "Modify environment settings and day cycle" group ability

## functions/llReplaceSubString

- normalised: `count`, `pattern`, `replacement_pattern`, `src`

## functions/llRequestAgentData

- normalised: `data`, `id`
- ambiguous `data`: It's worth restating: if the requested data does not exist - or if the key given is not for a

## functions/llRequestDisplayName

- normalised: `id`

## functions/llRequestExperiencePermissions

- ambiguous `agent`: Asks the agent for permission to participate in the script's
- ambiguous `agent`: hough the script can only have permission for one agent at a time.

## functions/llRequestInventoryData

- ambiguous `item`: Requests data about the item
- ambiguous `item`: turns data for landmark items in inventory. Other item types are not supported.

## functions/llRequestPermissions

- normalised: `agent`, `permissions`
- ambiguous `agent`: take money from agent's account
- ambiguous `agent`: take agent's
- ambiguous `agent`: on agent
- ambiguous `agent`: from agent
- ambiguous `agent`: track the agent's
- ambiguous `agent`: control the agent's camera
- ambiguous `agent`: the agent
- ambiguous `agent`: on agent
- ambiguous `agent`: A dialog is presented to the agent to grant these permissions except when granted au
- ambiguous `permissions`: A dialog is presented to the agent to grant these permissions except when granted automatically as shown in the
- ambiguous `agent`: If object is attached to agent, "automatic" permissions are granted without noti
- ambiguous `permissions`: If object is attached to agent, "automatic" permissions are granted without notification upon request.
- ambiguous `permissions`: event. Granting permissions takes time, and you shouldn't assume it's complet
- ambiguous `permissions`: u-option "Stop Animating Me" will release certain permissions (
- ambiguous `permissions`: ), if the script which holds these permissions is in the same region as the agent, and the scrip
- ambiguous `agent`: ds these permissions is in the same region as the agent, and the script is not attached to the permission
- ambiguous `permissions`: To request two or more permissions at the same time, use the bitwise OR (|) operator
- ambiguous `permissions`: It is currently not possible to request no permissions at all (see Issues below); as a workaround
- ambiguous `permissions`: Scripts may hold permissions for only one agent at a time. To hold permissions
- ambiguous `agent`: Scripts may hold permissions for only one agent at a time. To hold permissions for multiple agent
- ambiguous `permissions`: permissions for only one agent at a time. To hold permissions for multiple agents you must use more than one sc
- ambiguous `permissions`: The result of granting permissions affects the return of
- ambiguous `permissions`: chever response is last is considered the granted permissions.
- ambiguous `agent`: The viewer limits permission requests from any agent to any other agent to 5 dialogs in 10 seconds.
- ambiguous `agent`: s permission requests from any agent to any other agent to 5 dialogs in 10 seconds.
- ambiguous `agent`: sion in one state, then changing state before the agent response, will cause
- ambiguous `agent`: to be fired in the new state once the agent responds.
- ambiguous `permissions`: Requesting only auto-granted permissions in one state, then immediately changing state, wi
- ambiguous `permissions`: To request two (or more) permissions at the same time, use the bitwise OR (|)
- ambiguous `agent`: When an agent grants a script non-automatic permissions they wi
- ambiguous `permissions`: When an agent grants a script non-automatic permissions they will receive a notification (in chat) of
- ambiguous `permissions`: A statement of what permissions were granted.
- ambiguous `permissions`: If the script that holds the permissions is in a child prim the
- ambiguous `permissions`: — Get the permissions granted
- ambiguous `permissions`: — Get the avatar who granted permissions.

## functions/llRequestSimulatorData

- normalised: `data`, `region`
- ambiguous `region`: region currently up and running
- ambiguous `region`: region currently down
- ambiguous `region`: region currently starting
- ambiguous `region`: region currently stopping
- ambiguous `region`: region has crashed
- ambiguous `region`: region status unknown or unknown region
- ambiguous `region`: region status unknown or unknown region
- ambiguous `region`: rating or region unknown
- ambiguous `region`: returns the region type).

## functions/llRequestUsername

- normalised: `id`

## functions/llResetAnimationOverride

- normalised: `anim_state`

## functions/llResetOtherScript

- ambiguous `script`: Resets script
- ambiguous `script`: On script reset...
- ambiguous `script`: If the script is not running, this call has no effect, even aft
- ambiguous `script`: running, this call has no effect, even after the script is set running again.
- ambiguous `script`: A script can reset itself with this function (not just oth

## functions/llReturnObjectsByID

- ambiguous `objects`: that is the number of objects successfully returned to their owners or an
- ambiguous `objects`: estate owner or manager, this function works for objects located on any parcel in the region. Otherwise, t
- ambiguous `objects`: l in the region. Otherwise, the script can return objects located over land owned by the owner of the scrip
- ambiguous `objects`: ate owner, and estate managers can not have their objects returned by this method, except when the object r

## functions/llReturnObjectsByOwner

- normalised: `owner`, `scope`
- ambiguous `owner`: may be granted by the owner. If the script is owned by a group, this permissi
- ambiguous `owner`: y an estate manager or over a parcel owned by the owner of the script.
- ambiguous `owner`: which are over parcels owned by the owner of the script.
- ambiguous `owner`: The script must be owned by the estate owner or an estate manager.
- ambiguous `owner`: Parcel owner, estate owner and estate managers can not have th
- ambiguous `owner`: Parcel owner, estate owner and estate managers can not have their objects re
- ambiguous `owner`: y other groups will be returned to their previous owner if the object is transferable. If not transferabl
- ambiguous `owner`: wned land you may want to explicitly code a group owner's key into the script as there is no way to deter
- ambiguous `owner`: there is no way to determine if a user is a group owner.

## functions/llRezAtRoot

- normalised: `rot`

## functions/llRezObject

- normalised: `pos`, `rot`, `vel`

## functions/llRot2Fwd

- normalised: `q`

## functions/llRot2Left

- normalised: `q`

## functions/llRot2Up

- normalised: `q`

## functions/llRotLookAt

- normalised: `damping`, `strength`, `target_direction`

## functions/llRotTarget

- normalised: `error`, `rot`

## functions/llRotTargetRemove

- normalised: `handle`

## functions/llRotateTexture

- normalised: `angle`, `face`

## functions/llRound

- normalised: `val`

## functions/llSHA1String

- normalised: `src`

## functions/llSHA256String

- normalised: `src`

## functions/llSameGroup

- normalised: `uuid`

## functions/llSay

- normalised: `channel`, `msg`
- ambiguous `channel`: on channel supplied in integer
- ambiguous `channel`: . Everyone can hear chat transmitted on this channel. All other channels are private channels (not sen
- ambiguous `channel`: a lamp), it is a good idea to use a very negative channel,
- ambiguous `channel`: Chat from objects caps at 1024 bytes, whether the channel is negative or not). Negative channels were popul
- ambiguous `channel`: on channel
- ambiguous `channel`: g to an out-of-range integer will be listening to channel 1 instead! (see also

## functions/llScaleByFactor

- normalised: `scaling_factor`

## functions/llScaleTexture

- normalised: `face`, `u`, `v`
- ambiguous `face`: g mode the scale units are in texture repeats per face. In the planar texture mapping mode the scale uni

## functions/llScriptDanger

- normalised: `pos`

## functions/llSensor

- normalised: `arc`, `id`, `name`, `radius`, `type`
- ambiguous `id`: it is treated as empty.<br id="NameFormat"/>Depending upon which AGENT* flag is
- marked `arc`: gent (but not if the avatar is outside the sensor arc, see
- ambiguous `name`: sensor detects all prims and agents with a given name within 15m of the sensor. (AGENT, PASSIVE and ACT
- ambiguous `name`: ut messages to the owner of each detected agents' name.
- ambiguous `id`: <div id="box">
- marked `arc`: File:sensor_pi_by_four.png|arc =
- marked `arc`: File:sensor_pi_by_two.png|arc =
- marked `arc`: File:sensor_pi.png|arc =

## functions/llSensorRepeat

- normalised: `arc`, `id`, `name`, `rate`, `type`
- ambiguous `id`: it is treated as empty.<br id="NameFormat"/>Depending upon which AGENT* flag is

## functions/llSetAgentEnvironment

- marked `params`: gent with an empty list. Passing an empty list in params will strip all environmental settings applied to

## functions/llSetAgentRot

- normalised: `flags`, `rot`
- ambiguous `flags`: a placeholder for future expansion. There are no flags defined at this time, pass a constant value of 0.

## functions/llSetAlpha

- normalised: `alpha`, `face`
- ambiguous `alpha`: In practical terms, "alpha" means "transparency" or "visibility".
- ambiguous `alpha`: . It will not affect any linked prims. To set the alpha state for those, use
- ambiguous `alpha`: — Gets the prim's alpha
- ambiguous `alpha`: — Sets link's alpha

## functions/llSetAnimationOverride

- normalised: `anim`, `anim_state`

## functions/llSetBuoyancy

- normalised: `buoyancy`
- marked `buoyancy`: Sets the buoyancy of the task or object. Requires
- marked `buoyancy`: Unlike some other characteristics, a buoyancy effect is cancelled if the script that set buoyan
- marked `buoyancy`: oyancy effect is cancelled if the script that set buoyancy is removed from the prim.
- marked `buoyancy`: function cannot be used to set relative levels of buoyancy in parts of a linked object, e.g. to simulate a h
- marked `buoyancy`: in any child prim appears to set the global buoyancy level for the object.
- marked `buoyancy`: When buoyancy is changed, the object briefly continues to be af
- marked `buoyancy`: to be affected by the last value. For example, if buoyancy was set it to 1.5 to raise an object, and whilst
- marked `buoyancy`: it to 1.5 to raise an object, and whilst moving, buoyancy is changed it to 0.0, the object continues to ris

## functions/llSetCameraAtOffset

- normalised: `offset`
- ambiguous `offset`: (which likely has a custom sit rotation and offset) or the
- ambiguous `offset`: will cancel any offset.

## functions/llSetCameraEyeOffset

- normalised: `offset`
- ambiguous `offset`: (which likely has a custom sit rotation and offset) or the
- ambiguous `offset`: will cancel any eye offset.

## functions/llSetClickAction

- ambiguous `action`: Sets the action performed when a prim is clicked upon (aka
- ambiguous `action`: s over the prim, its image changes to reflect the action.
- ambiguous `action`: Performs the default action: when the prim is touched, touch events are trigg
- ambiguous `action`: No click action. No touches detected or passed.
- ambiguous `action`: le this function works or attached objects (click action can be changed), the configured click action of a
- ambiguous `action`: lick action can be changed), the configured click action of an attachment is ignored by the viewer (with e
- ambiguous `action`: eption to the above rule is when the chosen click action is
- ambiguous `action`: set the click action after an avatar touches an object, but bear in mi

## functions/llSetColor

- normalised: `color`, `face`
- ambiguous `color`: LSL color representations
- ambiguous `color`: — Gets the prim's color
- ambiguous `color`: — Sets link's color

## functions/llSetContentType

- marked `content_type`: content_type

## functions/llSetDamage

- normalised: `damage`
- ambiguous `damage`: For an avatar to take damage when the object collides with an avatar...
- ambiguous `damage`: The avatar must be on the land where "Safe (no damage)" is disabled.
- ambiguous `damage`: ver does not need to be on or even partially over damage enabled land.
- ambiguous `damage`: se preconditions are met, the avatar receives the damage, and the object will
- ambiguous `damage`: If a damage enabled object hits a physics enabled object that
- ambiguous `damage`: d object that one or more avatars are sitting on, damage will be distributed to all seated avatars.
- ambiguous `damage`: — How damage works in Second Life

## functions/llSetForce

- ambiguous `force`: Applies force to the object (if the object is physical)
- ambiguous `force`: Continuous force.
- ambiguous `force`: ysical). Used on an attachment, it will apply the force to the avatar.
- ambiguous `force`: — Instantaneous force

## functions/llSetForceAndTorque

- ambiguous `force`: Sets the force and torque of object (if the script is physical)
- marked `torque`: Sets the force and torque of object (if the script is physical)

## functions/llSetHoverHeight

- normalised: `height`, `tau`
- ambiguous `water`: above the ground (or water) in
- ambiguous `height`: tween the object's initial position and the hover height was limited to 64 meters. Under SL Server 1.26.2
- ambiguous `height`: If the object tries to go above the height (like, walking up a prim ramp),

## functions/llSetInventoryPermMask

- normalised: `item`
- ambiguous `group`: Active group permissions.
- ambiguous `flags`: Combine with other mask flags, for instance

## functions/llSetKeyframedMotion

- normalised: `options`
- marked `keyframes`: . The object will be smoothly moved between those keyframes by the simulator.
- ambiguous `options`: is provided in the options list, it must be the only option in the list, and
- marked `keyframes`: specified in the same function call that sets the keyframes list.
- marked `keyframes`: yframe list provided. Just pass an empty list for keyframes list, and the
- ambiguous `options`: followed by the command in the options list.

## functions/llSetLinkAlpha

- normalised: `alpha`, `face`, `link`
- ambiguous `link`: If a prim exists in the link set at
- ambiguous `alpha`: — Gets the prim's alpha
- ambiguous `alpha`: — Sets the prim's alpha

## functions/llSetLinkCamera

- normalised: `at`, `eye`, `link`

## functions/llSetLinkColor

- normalised: `color`, `face`, `link`
- ambiguous `link`: If a prim exists in the link set at
- ambiguous `link`: Turn a link set green
- ambiguous `color`: LSL color representations
- ambiguous `color`: — Gets the prim's color
- ambiguous `color`: — Sets the prim's color

## functions/llSetLinkGLTFOverrides

- ambiguous `face`: texture on a face

## functions/llSetLinkMedia

- normalised: `face`, `link`, `params`
- ambiguous `face`: before a piece of media is active) for the chosen face. The default image is specified by Second Life's
- ambiguous `face`: Sets the current url displayed on the chosen face. Changing this URL causes navigation. 1024 charac
- ambiguous `face`: Sets the home url for the chosen face. 1024 characters max
- ambiguous `face`: n someone click on a playing, but unfocused media face:
- ambiguous `face`: : Does the same thing a focused media face does, and forwards the click to the web browser.
- marked `params`: If prim media is newly added to this object, params not specified take their default value.
- marked `params`: If prim media is already on this object, params not specified are unchanged.
- ambiguous `face`: visible. Re-scaling the prim without altering the face's

## functions/llSetLinkPrimitiveParamsFast

- normalised: `link`, `rules`
- ambiguous `rules`: The set rules table is shared by several functions and is not r
- ambiguous `link`: (integer link, float alpha, integer face); instead of
- ambiguous `link`: (integer link, [

## functions/llSetLinkRenderMaterial

- normalised: `face`, `link`, `material`
- ambiguous `link`: If a prim exists in the link set at
- ambiguous `face`: properties on the face, with the exceptions of repeats, offsets, and rot
- ambiguous `link`: Cover a link set in the material my_material
- ambiguous `material`: Cover a link set in the material my_material

## functions/llSetLinkSitFlags

- ambiguous `flags`: Sets flags on the link's sittarget.
- ambiguous `link`: Sets flags on the link's sittarget.
- ambiguous `flags`: Sets the sit flags for the sit target in the link. Sit flags only ap
- ambiguous `link`: Sets the sit flags for the sit target in the link. Sit flags only apply when a sit target is presen
- ambiguous `flags`: the sit flags for the sit target in the link. Sit flags only apply when a sit target is present in the li
- ambiguous `link`: gs only apply when a sit target is present in the link.
- ambiguous `link`: Read-only flag to indicate whether the link has a sit target. Use

## functions/llSetLinkTexture

- normalised: `face`, `link`, `texture`
- ambiguous `link`: If a prim exists in the link set at
- ambiguous `link`: Cover a link set in the texture "bark" (from the library)
- ambiguous `texture`: Cover a link set in the texture "bark" (from the library)

## functions/llSetLinkTextureAnim

- normalised: `length`, `rate`, `sizex`, `sizey`
- ambiguous `face`: Animate the texture on the specified face/faces of the specified prim/prims by setting the
- ambiguous `link`: except able to modify any prim in the link set.
- ambiguous `face`: , each frame is displayed in turn centered on the face.
- ambiguous `start`: Texture animation is on. This must be set to start the animation, cleared to stop it.
- ambiguous `rate`: s will not reset animation (a small difference in rate will suffice).
- ambiguous `mode`: mode.
- ambiguous `mode`: mode
- ambiguous `face`: While a texture animation is active on any face of a prim,

## functions/llSetMemoryLimit

- normalised: `limit`
- ambiguous `limit`: ;Mono:Sets the memory limit for the script.
- ambiguous `limit`: The memory limit can be set up to 64k.
- ambiguous `limit`: The memory limit can not be set lower than the memory currently in
- ambiguous `limit`: All new scripts start with a limit of 64k
- ambiguous `limit`: s function was introduced continue to use the 64k limit.
- ambiguous `limit`: A lower limit will effect the amount of memory reported in the
- ambiguous `limit`: The memory limit is not the amount of real memory actually used by
- ambiguous `limit`: emory actually used by the script, just the upper limit on it.
- ambiguous `limit`: ) is ignored and the memory limit is not changed

## functions/llSetObjectDesc

- ambiguous `description`: Sets the prims description
- ambiguous `description`: Changing the object description does not trigger a
- ambiguous `description`: Set this prim's description
- ambiguous `description`: Set the root prim's description
- ambiguous `description`: — Gets the prim description.

## functions/llSetObjectName

- normalised: `name`
- ambiguous `name`: Sets the prim's name according to the
- ambiguous `name`: a child prim in a linked set, it will change the name of the child prim and not the root prim.
- ambiguous `name`: The name is limited to 63 characters. Longer prim names ar
- ambiguous `name`: object is attached, the script cannot change the name of the object as it appears in the user's invento
- ambiguous `name`: Changes to the name of the root prim (with
- ambiguous `name`: ment is detached (to inventory, not dropped) this name change is discarded and the name in inventory is
- ambiguous `name`: ot dropped) this name change is discarded and the name in inventory is used instead.
- ambiguous `name`: o inventory, the inventory item will have the new name (not the old).
- ambiguous `name`: Changes to the object name do not trigger a
- ambiguous `name`: Set this prim's name
- ambiguous `name`: Set the root prim's name
- ambiguous `name`: Test if a string is valid as an object name
- ambiguous `name`: — Get the prims name
- ambiguous `name`: — Get a linked prims name

## functions/llSetObjectPermMask

- ambiguous `group`: Active group permissions.
- ambiguous `flags`: Combine with other mask flags, for instance

## functions/llSetParcelForSale

- marked `Options`: the parcel is put up for sale. Options is a list of options to set for the sale,
- marked `ForSale`: Setting ForSale to

## functions/llSetPayPrice

- normalised: `price`, `quick_pay_buttons`

## functions/llSetPhysicsMaterial

- normalised: `friction`, `restitution`

## functions/llSetPos

- normalised: `pos`

## functions/llSetPrimMediaParams

- normalised: `face`, `params`
- ambiguous `face`: before a piece of media is active) for the chosen face. The default image is specified by Second Life's
- ambiguous `face`: Sets the current url displayed on the chosen face. Changing this URL causes navigation. 1024 charac
- ambiguous `face`: Sets the home url for the chosen face. 1024 characters max
- ambiguous `face`: n someone click on a playing, but unfocused media face:
- ambiguous `face`: : Does the same thing a focused media face does, and forwards the click to the web browser.
- ambiguous `face`: Face needs to be a single face. If you want the media on multiple faces (e. g. o
- ambiguous `face`: o call the function multiple times with different face numbers. Bitwise AND for face numbers does not wo
- ambiguous `face`: imes with different face numbers. Bitwise AND for face numbers does not work.

## functions/llSetRegionPos

- normalised: `position`
- ambiguous `position`: is returned, the object does not change position. (Spec does not quite agree, if object tries to g
- ambiguous `position`: he object with the script will move the root prim position to the given location. The position is any positi
- ambiguous `position`: the root prim position to the given location. The position is any position within the region. If the positio
- ambiguous `position`: sition to the given location. The position is any position within the region. If the position is below groun
- ambiguous `position`: osition is any position within the region. If the position is below ground, it will be set to the ground lev
- ambiguous `position`: the object is successfully placed within 0.1 m of position.
- ambiguous `position`: the object can not move to position due to parcel/region restrictions (object entry r
- ambiguous `position`: if the position is a point more than 0.1 m below region ground le
- ambiguous `position`: — Returns the prim's local position if it is attached or non-root (otherwise it retur
- ambiguous `position`: ched or non-root (otherwise it returns the global position)
- ambiguous `position`: — Gets the root prims position
- ambiguous `position`: — Returns the prim's global position, even if it is attached or non-root
- ambiguous `position`: he object with the script will move the root prim position to the given location. The position is any positi
- ambiguous `position`: the root prim position to the given location. The position is any position within the region. If the positio
- ambiguous `position`: sition to the given location. The position is any position within the region. If the position is below groun
- ambiguous `position`: osition is any position within the region. If the position is below ground, it will be set to the ground lev
- ambiguous `position`: the object is successfully placed within 0.1 m of position.
- ambiguous `position`: :* Returns 0 and does not move the object if position is more than 10m off region or above 4096m.
- ambiguous `position`: not move the object if the object can not move to position due to object entry rules, prim limits, bans, etc

## functions/llSetRemoteScriptAccessPin

- marked `pin`: when it is passed the correct pin and the prim is set mod.
- marked `pin`: A prim has only one pin for remotely loading scripts.
- marked `pin`: By changing the pin, a script can deny other scripts the ability to l
- marked `pin`: There is no way to find out whether a script pin has been set by another script in the prim. If th
- marked `pin`: velopers, the safe approach is to assume a script pin has been set by an upstream creator.

## functions/llSetRenderMaterial

- normalised: `face`, `material`
- ambiguous `face`: properties on the face, with the exceptions of repeats, offsets, and rot

## functions/llSetRot

- normalised: `rot`

## functions/llSetScale

- normalised: `size`
- ambiguous `size`: Sets the size of the prim according to
- ambiguous `size`: This function only changes the size of the
- ambiguous `size`: art of a link set, rescaling will fail if the new size is too large or small to satisfy the
- ambiguous `size`: — Gets the prims size

## functions/llSetScriptState

- ambiguous `running`: Set the running state of the script
- ambiguous `script`: Set the running state of the script
- ambiguous `script`: Cannot be used to restart a script that has encountered a
- ambiguous `script`: Cannot be used to start a script that has been added via
- ambiguous `running`: , and which have the running state set
- ambiguous `script`: The script appears to stop when its time slice ends, not soo
- ambiguous `script`: o stop when its time slice ends, not sooner. If a script tries to stop itself then some LSL code following
- ambiguous `script`: call may be executed before the script stops.
- ambiguous `script`: If a script is paused by
- ambiguous `script`: a restart, or moved into a different region, the script's memory is reset.

## functions/llSetSitText

- normalised: `text`
- ambiguous `text`: Note that like particles, and the other set text functions, all
- ambiguous `text`: it. Although by setting the string to a space no text will be shown.
- ambiguous `text`: To remove custom text that you have placed there, set the text as an em
- ambiguous `text`: e custom text that you have placed there, set the text as an empty string like this: "".
- ambiguous `text`: Upon your having done so, the text that appears will revert to "Sit Here."

## functions/llSetSoundQueueing

- normalised: `queue`
- ambiguous `queue`: The sound queue is only 1 level deep - this means that beside the
- ambiguous `queue`: , there can only be 1 sound in reserve. The sound queue is first-come, first-serve.*
- ambiguous `queue`: Further to the above, the queue order is reversed when using
- ambiguous `queue`: ounds are queued, the volume of all sounds in the queue is set by the last item in the queue. If your app
- ambiguous `queue`: ounds in the queue is set by the last item in the queue. If your application requires the use of differin
- ambiguous `queue`: alongside the sound queue
- ambiguous `queue`: not have a delay, enabling or disabling the sound queue is not instant. It seems to take approx ~0.1 seco
- ambiguous `queue`: , the queue is only one level deep.

## functions/llSetSoundRadius

- normalised: `radius`
- ambiguous `radius`: e not heard until an observer's camera enters the radius, and immediately stop when leaving the radius. Vo
- ambiguous `radius`: the radius, and immediately stop when leaving the radius. Volume fading is still determined by the distanc
- ambiguous `radius`: l determined by the distance from camera, not the radius.
- ambiguous `radius`: only once, when the observer's camera enters the radius for the first time. This can happen significantly
- ambiguous `radius`: nning every time the observer's camera enters the radius.

## functions/llSetStatus

- normalised: `status`, `value`
- ambiguous `status`: Sets the object status attributes indicated in the
- ambiguous `status`: attribute; all prims in an object share the same status.
- ambiguous `status`: — Gets the object status.

## functions/llSetText

- normalised: `alpha`, `color`, `text`
- ambiguous `text`: An unbroken line of text of a great length may be broken automatically int
- ambiguous `text`: process times are ca. 5 seconds without floating text, 24 seconds with
- ambiguous `alpha`: is fully opaque (alpha), 0.0 would make it completely transparent (invis
- ambiguous `text`: out of inventory onto an object to erase its set text:
- ambiguous `text`: To actually display text on a prim, see
- ambiguous `text`: — Label an object with text and newlines to give away or sell

## functions/llSetTexture

- normalised: `face`, `texture`
- ambiguous `texture`: does not show texture information (like

## functions/llSetTextureAnim

- normalised: `length`, `rate`, `sizex`, `sizey`
- ambiguous `face`: Animate the texture on the specified face/faces by setting the texture scale and offset.
- ambiguous `face`: , each frame is displayed in turn centered on the face.
- ambiguous `start`: Texture animation is on. This must be set to start the animation, cleared to stop it.
- ambiguous `rate`: s will not reset animation (a small difference in rate will suffice).
- ambiguous `mode`: mode.
- ambiguous `mode`: mode.
- ambiguous `start`: he object time is out of bounds for the specified start/end, and attempting to replay it after it has sto
- ambiguous `face`: While a texture animation is active on any face of a prim,

## functions/llSetTimerEvent

- normalised: `sec`

## functions/llSetTorque

- marked `torque`: Sets the torque of object (if the script is physical)

## functions/llSetTouchText

- normalised: `text`
- ambiguous `text`: To make it appear as if there is no text, use some combination of whitespace characters fo
- ambiguous `text`: Note that like particles, and the other set text functions, all

## functions/llSetVehicleFlags

- normalised: `flags`
- ambiguous `flags`: Some vehicle flags may remain enabled after script reset. Use
- ambiguous `flags`: to disable any flags that would interfere with the correct functioning
- ambiguous `flags`: — Remove vehicle flags

## functions/llSetVehicleFloatParam

- normalised: `param`, `value`

## functions/llSetVehicleRotationParam

- normalised: `param`, `rot`

## functions/llSetVehicleType

- ambiguous `type`: Sets the vehicle type to one of the default types.

## functions/llSetVehicleVectorParam

- normalised: `param`, `vec`

## functions/llSetVelocity

- ambiguous `velocity`: Applies velocity to object
- ambiguous `velocity`: Instantaneous velocity not dependent on object energy or mass.

## functions/llShout

- normalised: `channel`, `msg`
- ambiguous `channel`: on channel supplied in integer
- ambiguous `channel`: instead of channel 0 and
- ambiguous `channel`: instead of channel +2,147,483,647.

## functions/llSignRSA

- normalised: `algorithm`, `msg`, `private_key`
- marked `algorithm`: when using hash algorithm

## functions/llSin

- normalised: `theta`

## functions/llSitOnLink

- marked `agent_id`: The avatar specified by agent_id is forced to sit on the sit target of the prim in
- marked `link`: it on the sit target of the prim indicated by the link parameter. If the specified link is already occup
- ambiguous `link`: indicated by the link parameter. If the specified link is already occupied, the simulator searches down
- ambiguous `link`: simulator searches down the chain of prims in the link set looking for an available sit target.
- marked `link`: s that indicate a single prim may be used for the link parameter. These are

## functions/llSitTarget

- normalised: `offset`, `rot`

## functions/llSleep

- normalised: `sec`

## functions/llSqrt

- normalised: `val`
- marked `val`: For imaginary results (val < 0.0), a

## functions/llStartAnimation

- normalised: `anim`

## functions/llStopAnimation

- normalised: `anim`

## functions/llStringLength

- normalised: `str`

## functions/llStringTrim

- normalised: `src`
- ambiguous `type`: e string -- for instance, a mistaken double-space type -- will not be corrected.

## functions/llSubStringIndex

- normalised: `pattern`, `source`
- marked `pattern`: pattern in source.
- ambiguous `source`: pattern in source.

## functions/llTakeControls

- normalised: `accept`, `controls`, `pass_on`
- ambiguous `controls`: ve. In this case, the complement of the specified controls do not generate events and do not perform their n
- ambiguous `controls`: , then the specified controls do not generate events but perform their normal f
- ambiguous `controls`: , then the specified controls generate events but do not perform their normal f
- ambiguous `controls`: , then the specified controls generate events and perform their normal function
- ambiguous `controls`: sit/are sitting on the object that has taken your controls using
- ambiguous `controls`: will never generate events; instead these controls will only perform their normal functions.
- ambiguous `controls`: if the undocumented controls 0x02000000 or 0x04000000 are taken with
- ambiguous `controls`: If a script has taken controls, it and other scripts in the same prim will not b

## functions/llTan

- normalised: `theta`

## functions/llTarget

- normalised: `position`, `range`
- ambiguous `position`: is to have the script know when it has reached a position.
- ambiguous `position`: The position always references the current region. If you set
- ambiguous `position`: The position can be set outside the region boundaries, but
- ambiguous `range`: can only happen if the range extends into the current region. The part of the
- ambiguous `range`: extends into the current region. The part of the range outside the current region will not activate
- ambiguous `position`: — Cancel a target position

## functions/llTargetOmega

- normalised: `axis`, `gain`, `spinrate`
- ambiguous `axis`: cal and the script attached to the root prim, the axis of rotation is given by the parameter
- ambiguous `axis`: parameter gives the direction of the axis of rotation. If the center of the object is not t
- ambiguous `axis`: al and the script is attached to a root prim, the axis of rotation is given by the parameter
- marked `gain`: Set the gain to zero to disable and remove the rotation behavi

## functions/llTargetRemove

- normalised: `handle`

## functions/llTargetedEmail

- normalised: `subject`, `target`
- marked `subject`: The entire message (including the address, subject and other miscellaneous fields) can't be longer t
- marked `target`: The target parameter selects which agent the email is sent t
- marked `subject`: The 4096 byte size limit includes the subject line and automatically added text. The practical
- marked `subject`: ive) when non-ascii characters are present in the subject. However, non-ascii characters in the message bod

## functions/llTeleportAgent

- normalised: `agent`, `landmark`, `look_at`, `position`
- ambiguous `position`: as a position within that region. Otherwise,
- marked `landmark`: Basic example with a landmark called
- marked `landmark`: Basic example without a landmark in the object's inventory, while facing the avata
- marked `landmark`: The script keeps track of the landmark's destination coordinate in the
- ambiguous `agent`: — Teleports an agent to a global position.
- ambiguous `position`: — Teleports an agent to a global position.

## functions/llTeleportAgentGlobalCoords

- normalised: `agent`, `global_coordinates`, `look_at`, `region_coordinates`

## functions/llTeleportAgentHome

- normalised: `avatar`

## functions/llTextBox

- normalised: `channel`

## functions/llToLower

- normalised: `src`

## functions/llToUpper

- normalised: `src`

## functions/llTransferLindenDollars

- normalised: `amount`, `destination`

## functions/llTransferOwnership

- normalised: `flags`
- ambiguous `agent`: e the object to derez itself into the destination agent's inventory, or make a copy of itself directly in
- ambiguous `agent`: y of the object and place it into the destination agent's inventory.
- ambiguous `options`: A bad option was passed in the options list.
- ambiguous `agent`: Could not find the receiving agent in the current region.
- ambiguous `agent`: must be an agent in the region.
- ambiguous `agent`: be removed from the object received by the target agent. If the transfer is of the object itself, these i
- ambiguous `agent`: l be present in the object received by the target agent and removed from the original.

## functions/llTriggerSound

- normalised: `sound`, `volume`
- ambiguous `sound`: If the object moves the sound does not move with it.
- ambiguous `sound`: to play a sound attached to the object.
- ambiguous `sound`: g error will be shown in debug channel: "Too many sound requests. Throttled until average falls."

## functions/llTriggerSoundLimited

- normalised: `bottom_south_west`, `sound`, `top_north_east`, `volume`
- ambiguous `sound`: If the object moves the sound does not move with it.
- ambiguous `sound`: to play a sound attached to the object.
- ambiguous `sound`: , the sound audibility is determined by
- ambiguous `sound`: : "Too many sound triggers."
- ambiguous `sound`: This will play a sound on collision, only to the person who collided wit

## functions/llUnSit

- normalised: `id`

## functions/llUnescapeURL

- normalised: `url`

## functions/llUpdateKeyValue

- normalised: `checked`, `k`, `original_value`, `v`

## functions/llVecDist

- normalised: `vec_a`, `vec_b`
- marked `vec_a`: ( vec_a - vec_b )
- marked `vec_b`: ( vec_a - vec_b )

## functions/llVecMag

- normalised: `vec`
- marked `vec`: vec*vec < 16.0 is over twice as fast as
- marked `vec`: vec*vec < 16.0 is over twice as fast as
- marked `vec`: vec*vec < (dist*dist) is about twice as fast as
- marked `vec`: vec*vec < (dist*dist) is about twice as fast as

## functions/llVecNorm

- normalised: `vec`
- marked `vec`: vec /
- marked `vec`: ( vec )
- marked `vec`: vec /

## functions/llVerifyRSA

- normalised: `algorithm`, `msg`, `public_key`, `signature`
- marked `algorithm`: when using hash algorithm
- marked `signature`: if the signature is verified, and

## functions/llVolumeDetect

- normalised: `detect`
- ambiguous `detect`: physical, it can only detect physical objects and avatars. If the object
- ambiguous `detect`: physical, it can detect its collisions with static and

## functions/llWanderWithin

- normalised: `dist`
- marked `origin`: ander area is a rough area based on the specified origin, to a specified scale on each axis. So, if

## functions/llWater

- normalised: `offset`

## functions/llWhisper

- normalised: `channel`, `msg`
- ambiguous `channel`: on channel supplied in integer
- ambiguous `channel`: instead of channel 0 and
- ambiguous `channel`: instead of channel +2,147,483,647.

## functions/llWind

- normalised: `offset`

## functions/llWorldPosToHUD

- normalised: `world_pos`

## functions/llXorBase64

- normalised: `str1`, `str2`

## functions/llsRGB2Linear

- ambiguous `color`: Transforms a color specified in the sRGB colorspace to the linear RG
- ambiguous `color`: me of this function is actually a misnomer as LSL color is actually in
- ambiguous `color`: Scripting for PBR-enabled viewers: If you enter color vectors manually, using the viewer's color picker
- ambiguous `color`: enter color vectors manually, using the viewer's color picker, enter them as sRGB values. The color pick
- ambiguous `color`: er's color picker, enter them as sRGB values. The color picker automatically converts them internally to
- ambiguous `color`: ed viewer will see them correctly. When you apply color vectors directly with a script, however, you must
