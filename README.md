# mesh_tools

Converts robot meshes (DAE, STL, OBJ) into the compressed GLBs the [Lucy control panel](https://github.com/Lucy-Robotics/lucy_control_panel) loads.

Each mesh gets `<mesh>.full.glb`, `<mesh>.balanced.glb` and `<mesh>.light.glb` beside it.

## In a robot repo's CI

```yaml
- uses: Lucy-Robotics/mesh_tools@master
  with:
    commit: true
```

## Locally

```bash
npm ci
node src/cli.ts <robot repo>
```

From a Lucy workspace: `pixi run robot-glb <robot repo in src/>`.
