#!/usr/bin/env node
"use strict";

const { systemSync } = require ("shell-tools");

systemSync (`npx . -d 1 -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/test.jpg`);
systemSync (`npx . -a -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/view-all.png`);
systemSync (`npx . -d 1 -s 1600x900 -i https://create3000.github.io/media/examples/Geometry3D/IndexedFaceSet/IndexedFaceSet.x3d -o tests/https.jpg`);
