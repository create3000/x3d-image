# x3d-image

[![NPM Version](https://img.shields.io/npm/v/x3d-image)](https://www.npmjs.com/package/x3d-image)
[![NPM Downloads](https://img.shields.io/npm/dm/x3d-image)](https://npmtrends.com/x3d-image)
[![DeepScan grade](https://deepscan.io/api/teams/23540/projects/26816/branches/855449/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=23540&pid=26816&bid=855449)

Render image files from X3D.

## Synopsis

You can run *x3d-image* without installing it using **npx**:

**npx x3d-image** \[options\] -i input-file -o output-file [-i input-file -o output-file ...]

## Overview

*x3d-image* is a command-line tool that renders image files from X3D (Extensible 3D) and other 3D file formats. It allows users to convert 3D scenes into 2D images, supporting various input formats such as X3D (XML, JSON, Classic VRML), VRML, glTF, OBJ, STL, PLY, and SVG. The output can be in PNG or JPEG formats.

Key Features:

* Run *x3d-image* with `npx x3d-image ...` directly from npm without installing it.
* Flexible Input and Output: Accepts multiple input files, either from local paths or URLs, and produces corresponding image outputs.
* Customizable Image Dimensions: Allows specification of image size with the -s WIDTHxHEIGHT option; the default size is 1280x720 pixels.
* Adjustable Quality Settings: For lossy formats like JPEG, users can set the desired quality level using the -q option, with values ranging between 0 and 1.
* Rendering Delay: Provides an option to delay rendering by a specified number of seconds using the -d option.
* View Adjustment: The -a option modifies the current view to ensure all objects fit within the view volume.
* Environmental Lighting: Users can add an EnvironmentLight node to the scene with the -e option, choosing from presets like "CANNON", "HELIPAD", or "FOOTPRINT" which is particularly useful when rendering glTF files with PhysicalMaterial nodes.

## Options

**x3d-image** interprets the following options when it is invoked:

### -i *file(s)* ...

Set input file(s). This can be either a local file path or a URL. If there are less input files than output files, the last input file is used for the remaining output files.

### -o *file(s)* ...

Set output file(s). This can be either a PNG or JPEG file.

### -s WIDTHxHEIGHT

Set image size in pixels, default is '1280x720'.

### -q *quality*

A Number between 0 and 1 indicating the image quality to be used when creating images using file formats that support lossy compression (such as JPEG).

### -d *delay*

Wait the specified number of seconds before generating the image.

### -a

Modify the current view so that all objects fit in view volume.

### -b *color*

Set background to specified color. Color can be any X3D RGBA color or any CSS color. Use PNG as output image format for transparent backgrounds.

### -e *[**CANNON**, HELIPAD, FOOTPRINT]*

Add an EnvironmentLight node to scene. Useful when rendering glTF files with PhysicalMaterial nodes.

### -r rotation

Creates a parent group with the model as children and sets the specified X3D rotation value.

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

Render a JPEG image from X3D with size 1600x900.

```sh
$ npx x3d-image -s 1600x900 -i file.x3d -o file.jpg
```

Render two PNG images from two X3D files.

```sh
$ npx x3d-image -s 1600x900 -i file1.x3d -o file1.png -i file2.x3d -o file2.png
```

Render image of glTF file with view-all end environment light.

```sh
$ npx x3d-image -a -e CANNON -i file.gltf -o file.png
```

## See Also

x3d-image is based on [X_ITE](https://create3000.github.io/x_ite/), so check it out.
