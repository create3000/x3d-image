# x3d-image

[![NPM Version](https://img.shields.io/npm/v/x3d-image)](https://www.npmjs.com/package/x3d-image)
[![Build Size](https://badgen.net/bundlephobia/minzip/x3d-image)](#)
[![NPM Downloads](https://img.shields.io/npm/dw/x3d-image)](https://npmtrends.com/x3d-image)

Render image files from X3D.

## Synopsis

You can run *x3d-image* without installing it using **npx**:

**npx x3d-image** \[options\]

## Options

**x3d-image** interprets the following options when it is invoked:

### -i *file*

Set input file.

### -o *file*

Set output file.

### -s WIDTHxHEIGHT

Set image size in pixels, default is '1280x720'.

### -q *quality*

A Number between 0 and 1 indicating the image quality to be used when creating images using file formats that support lossy compression (such as JPEG).

### -d *delay*

Wait the specified number of seconds before generating the image.

### -a

Modify the current view so that all objects fit in view volume.

### -v

Show version.

### -h

Show help.

## Supported Input File Types

| Encoding         | File Extension | MIME Type       |
|------------------|----------------|-----------------|
| X3D XML          | .x3d, .x3dz    | model/x3d+xml   |
| X3D JSON         | .x3dj, .x3djz  | model/x3d+json  |
| X3D Classic VRML | .x3dv, .x3dvz  | model/x3d+vrml  |
| VRML             | .wrl, .wrz     | model/vrml      |
| glTF             | .gltf, .glb    | model/gltf+json |
| Wavefront OBJ    | .obj           | model/obj       |
| STL              | .stl           | model/stl       |
| PLY              | .ply           | model/ply       |
| SVG Document     | .svg, .svgz    | image/svg+xml   |

## Supported Output File Types

| Encoding | File Extension | MIME Type  |
|----------|----------------|------------|
| PNG      | .png           | image/png  |
| JPEG     | .jpg, .jpeg    | image/jpeg |

## Examples

Render an JPEG image from X3D with size 1600x900.

```sh
$ npx x3d-image -s 1600x900 -i file.x3d -o file.jpg
```

## See Also

x3d-image is based on [X_ITE](https://create3000.github.io/x_ite/), so check it out.
