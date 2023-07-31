# x3d-image

Generate image files from X3D.

## Synopsis

You can run *x3d-image* without installing it using **npx**:

**npx x3d-image** \[options\]

## Options

**x3d-image** interprets the following options when it is invoked:

### -i *file*

Set input file.

### -o *file*

Set output file.

### -s 'WIDTHxHEIGHT'

Set image size in pixels, default is '1280x720'.

### -q *quality*

A Number between 0 and 1 indicating the image quality to be used when creating images using file formats that support lossy compression (such as JPEG).

### -d *delay*

Wait the specified number of seconds before generating the image.

## Supported Output File Types

| Description | File Extension | MIME Type  |
|-------------|----------------|------------|
| PNG         | .png           | image/png  |
| JPEG        | .jpg, .jpeg    | image/jpeg |

## Examples

Generate an JPEG image from X3D.

```sh
$ npx x3d-image -s '1600x900' -i file.x3d -o file.jpg
```
