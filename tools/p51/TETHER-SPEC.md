# Tether redesign (mock-up agreed with Eric, 2026-11-07) — source: /home/claude/mock/tether2.js
- Engines as now (14-sided, stripe bands); plain dark intakes (no glow rings).
- Exhaust: open 6-sided nozzle; dark rim inset from the nozzle's exit edge, inner edge at 0.775 of the exit radius
  (halfway between thin 0.85 and thick 0.7); amber glow recessed inside; glow/rim aligned to the nozzle's sides.
- Fins: swept bevelled dorsal fin on each engine with lit leading edge; swept outboard canard with amber tip light; both grow with handling.
- Pod: 8-sided faceted teardrop (lathe), canopy = whole top and upper-side facets between two rings of the pod (front ring at 0.375 of its length ahead of centre, back ring at 0.125), so its front and back edges are square and it stops short of the yellow-black band; flush, thin bright frame; no nose ring;
  no spine; tail fin whose root follows the pod surface (flush); low swept armour sponsons (shield); plain cyan side light; (no tail light).
- Ammo: no ammo tubes. Purple bars on the angled upper panels either side of spine/fin, rear half, 8 a side, starting just
  behind the yellow-black band (cz+0.15, gap 0.044), thin (0.028), laid in the panel, width following the taper.
  Bar length = ammo stat (0.3 .. 1 of panel width), sitting against the spine; bars dim from the back as ammo is spent.
- Cheap pass: faceted two-tone shading, livery texture (seams, number, hazard band), edge lines (skip on Low).
- Build: merge parts per material (~6 draw calls). Then apply the same approach to the other frames.
- Control surfaces (replace the old brake flaps): the engines' dorsal fins and the pod's tail fin end in a straight hinge
  line with a rudder behind it that swings with the steering (about 0.5 rad at full lock); each canard ends in a hinge
  line with an airbrake flap that kicks up with the brake (about 1 rad at full brake). The pod has no tail light.
- Brake light: a thin strip on each canard flap's trailing edge, dark when cruising, glowing red-orange in proportion to the brake (in the game it joins the glowing parts and only its colour changes).
