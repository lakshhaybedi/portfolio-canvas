import * as THREE from "three";

// Shared between CameraRig (camera framing) and ParticleSystem (globe
// placement) so the globe forms exactly where the camera is already
// looking — "centered on screen during morph and while scrolling" without
// either side needing to know about the other's internals.
export const HERO_CAMERA_BASE = { x: 0, y: 2.4, z: 6.5 };
// -6.5 (and then -3.0, -2.0) all left a gap at the bottom of the frame at
// first: steepening this angle raises the *theoretical* horizon, but the
// ground directly beneath/in front of a downward-tilted camera is only
// covered if the grid's nearest row is close enough to the camera to be
// inside the bottom of the frustum. That's handled by shapePresets.ts's
// nearZ (pulling the first row close to the camera) rather than by this
// angle, so tilt is free to be as steep as needed here.
//
// -2.0 (a ~15° tilt) was shallower than the camera's half-FOV (27.5° at
// fov=55) — which meant the ground plane's true vanishing point (where every
// receding line meets at a single point) landed *inside* the visible frame,
// about a quarter of the way down from the top. That point is exactly the
// "A" shape reported: the two outer edges of the grid read as its two
// strokes. Any tilt angle greater than the half-FOV makes it geometrically
// impossible for that point to be on-screen at all (the whole frustum ends
// up looking at ground below the true horizon). -8.0 gives a ~32° tilt,
// comfortably past the 27.5° threshold.
export const HERO_LOOK_AT = new THREE.Vector3(0, -8.0, -10);
