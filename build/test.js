#!/usr/bin/env node
"use strict";

const { systemSync } = require ("shell-tools");

systemSync (`npx . -d 1 -s 1600x900 -c SRGB -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/test.jpg`);
systemSync (`npx . -b transparent -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/background.png`);
systemSync (`npx . -a -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/view-all.png`);
systemSync (`npx . -a -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -e .png`);
systemSync (`npx . -s 1600x900 -i "${__dirname}/../tests/IndexedFaceSet/IndexedFaceSet.x3d" -o "${__dirname}/../tests/abs.png"`);
systemSync (`npx . -d 1 -s 1600x900 -i https://create3000.github.io/media/examples/Geometry3D/IndexedFaceSet/IndexedFaceSet.x3d -o tests/https.jpg`);
systemSync (`npx . tests/IndexedFaceSet/IndexedFaceSet.x3d tests/test.no.jpg`);
systemSync (` npx . -a -w HELIPAD -i https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/master/Models/ClearCoatCarPaint/glTF/ClearCoatCarPaint.gltf -o tests/env-light.png`);
systemSync (`npx . -a -w CANNON -b white -r "0.509086470924499 -0.842639596032569 -0.175469303069548 0.42682311202636" -c LINEAR -x 1.5 -m KHR_PBR_NEUTRAL -i https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/master/Models/BoomBox/glTF/BoomBox.gltf -o tests/boombox.png`);
systemSync (`npx . -n -g -i https://create3000.github.io/media/examples/Rendering/OrderIndependentTransparency/OrderIndependentTransparency.x3d -o tests/oit.png`);
