#!/usr/bin/env node
"use strict";

const { systemSync } = require ("shell-tools");

systemSync (`npx . -d 1 -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/test.jpg`);
systemSync (`npx . -b -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/background.png`);
systemSync (`npx . -a -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/view-all.png`);
systemSync (`npx . -s 1600x900 -i "${__dirname}/../tests/IndexedFaceSet/IndexedFaceSet.x3d" -o "${__dirname}/../tests/abs.png"`);
systemSync (`npx . -d 1 -s 1600x900 -i https://create3000.github.io/media/examples/Geometry3D/IndexedFaceSet/IndexedFaceSet.x3d -o tests/https.jpg`);
systemSync (`npx . tests/IndexedFaceSet/IndexedFaceSet.x3d tests/test.no.jpg`);
systemSync (` npx . -a -e HELIPAD -i https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/master/Models/ClearCoatCarPaint/glTF/ClearCoatCarPaint.gltf -o tests/env-light.png`);
