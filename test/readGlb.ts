/*
 * Copyright 2025-2026 Lucy Robotics Team
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

/** Plain read-back of a converter GLB, with no panel-side post-processing. */
export async function readGlb(glb: Uint8Array): Promise<THREE.Object3D> {
    const buffer = glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength) as ArrayBuffer;
    return (await loader.parseAsync(buffer, '')).scene;
}

export function meshes(object: THREE.Object3D): THREE.Mesh[] {
    const found: THREE.Mesh[] = [];
    object.traverse((c) => { if (c instanceof THREE.Mesh) found.push(c); });
    return found;
}

export function triangleCount(object: THREE.Object3D): number {
    return meshes(object).reduce((sum, m) => sum + (m.geometry.index ?? m.geometry.getAttribute('position')).count / 3, 0);
}
