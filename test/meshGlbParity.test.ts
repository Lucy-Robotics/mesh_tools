/*
 * Copyright 2025-2026 Lucy Robotics Team
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { after, before, test } from 'node:test';
import * as THREE from 'three';
import { boxTriangles, tempDir, writeFixtures } from './meshFixtures.ts';
import { meshes, readGlb, triangleCount } from './readGlb.ts';

const { meshObject } = await import('../src/meshObject.ts');
const { provideDomForLoaders } = await import('../src/nodeDom.ts');
const { meshToGlbs } = await import('../src/meshToGlb.ts');

type Phong = THREE.MeshPhongMaterial;

// Same placement as urdf-loader: the root's own transform is dropped.
function placedByUrdfLoader<T extends THREE.Object3D>(object: T): T {
    object.position.set(0, 0, 0);
    object.quaternion.identity();
    object.updateMatrixWorld(true);
    return object;
}

let dir: string;
let files: Record<'dae' | 'stl' | 'obj', string>;
before(async () => { await provideDomForLoaders(); dir = await tempDir(); files = await writeFixtures(dir, boxTriangles()); });
after(() => fs.rm(dir, { recursive: true, force: true }));

for (const kind of ['dae', 'stl', 'obj'] as const) {
    test(`a ${kind} mesh keeps its geometry, material and root-mesh flag in the full-quality GLB`, async () => {
        const original = placedByUrdfLoader(await meshObject(files[kind]));
        const restored = placedByUrdfLoader(await readGlb((await meshToGlbs(files[kind])).get('full')!));

        assert.equal(triangleCount(restored), triangleCount(original));
        const [a, b] = [original, restored].map((o) => new THREE.Box3().setFromObject(o));
        const tolerance = a.getSize(new THREE.Vector3()).length() * 1e-4;
        assert.ok(a.min.distanceTo(b.min) < tolerance && a.max.distanceTo(b.max) < tolerance, `bounding box ${b.min.toArray()} ${b.max.toArray()}`);

        const [source] = meshes(original).map((m) => m.material as Phong);
        const [exported] = meshes(restored);
        const { userData } = exported.material as THREE.Material;
        const stored = userData.three;
        assert.equal(stored.type, source.type);
        assert.equal(stored.color, source.color.getHex());
        assert.equal(stored.shininess, source.shininess);
        assert.equal(userData.rootMesh, original instanceof THREE.Mesh);
    });
}
