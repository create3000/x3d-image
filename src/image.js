"use strict";

const
   X3D      = require ("x_ite"),
   pkg      = require ("../package.json"),
   electron = require ("electron"),
   yargs    = require ("yargs"),
   path     = require ("path"),
   url      = require ("url"),
   fs       = require ("fs"),
   DEBUG    = false;

// Redirect console messages.

process .exit  = (code = 0) => { throw code };
console .log   = (... messages) => electron .ipcRenderer .send ("log",   messages);
console .warn  = (... messages) => electron .ipcRenderer .send ("warn",  messages);
console .error = (... messages) => electron .ipcRenderer .send ("error", messages);

electron .ipcRenderer .on ("main", async (event, argv) => main (argv));

async function main (argv)
{
   try
   {
      await generate (argv);

      process .exit ();
   }
   catch (error)
   {
      if (typeof error === "number")
      {
         electron .ipcRenderer .send ("exit", error);
      }
      else
      {
         console .error (error .message || error);
         electron .ipcRenderer .send ("exit", 1);
      }
   }
}

async function generate (argv)
{
   const args = yargs (argv .slice (2))
   .scriptName ("x3d-image")
   .usage ("$0 [options] -i input-file -o output-file [-i input-file -o output-file ...]")
   .wrap (yargs () .terminalWidth ())
   .command ("Render image files from X3D")
   .version (pkg .version)
   .alias ("v", "version")
   .fail ((msg, error, yargs) =>
   {
      console .error (msg);
      process .exit (1);
   })
   .option ("view-all",
   {
      type: "boolean",
      alias: "a",
      description: "Modify the current view so that all objects fit in view volume.",
      array: true,
      default: [false],
   })
   .option ("background",
   {
      type: "string",
      alias: "b",
      description: `Set background to specified color. Color can be any X3D RGBA color or any CSS color. Use PNG as output image format for transparent backgrounds.`,
      array: true,
      default: [ ],
      requiresArg: true,
   })
   .option ("colorSpace",
   {
      type: "string",
      alias: "c",
      description: `The color space in which color calculations take place.`,
      array: true,
      default: ["LINEAR_WHEN_PHYSICAL_MATERIAL"],
      choices: ["SRGB", "LINEAR_WHEN_PHYSICAL_MATERIAL", "LINEAR"],
      requiresArg: true,
   })
   .option ("delay",
   {
      type: "number",
      alias: "d",
      description: "Wait the specified number of seconds before generating the image.",
      array: true,
      default: [0],
      requiresArg: true,
   })
   .option ("extension",
   {
      type: "string",
      alias: "e",
      description: `Set output file extension(s), e.g. ".x3dv" or ".tidy.x3d". The output file will have the same basename as the input file.`,
      array: true,
      requiresArg: true,
      implies: "input",
      conflicts: "output",
   })
   .option ("logarithmic-depth-buffer",
   {
      type: "boolean",
      alias: "g",
      description: `Whether to use a logarithmic depth buffer. It may be necessary to use this if dealing with huge differences in scale in a single scene. It is automatically enabled if a GeoViewpoint is bound.`,
      array: true,
      default: [false],
   })
   .option ("input",
   {
      type: "string",
      alias: "i",
      description: "Set input file(s). If there are less input files than output files, the last input file is used for the remaining output files.",
      array: true,
      requiresArg: true,
      demandOption: true,
   })
   .option ("log",
   {
      type: "boolean",
      alias: "l",
      description: `Log output filenames to stdout.`,
      implies: "input",
   })
   .option ("tone-mapping",
   {
      type: "string",
      alias: "m",
      description: `Whether tone mapping should be applied.`,
      array: true,
      default: ["NONE"],
      choices: ["NONE", "ACES_NARKOWICZ", "ACES_HILL", "ACES_HILL_EXPOSURE_BOOST", "KHR_PBR_NEUTRAL"],
      requiresArg: true,
   })
   .option ("order-independent-transparency",
   {
      type: "boolean",
      alias: "n",
      description: `Whether to use order independent transparency rendering technique.`,
      array: true,
      default: [false],
   })
   .option ("output",
   {
      type: "string",
      alias: "o",
      description: "Set output file(s). This can be either a *.png or *.jpg file.",
      array: true,
      requiresArg: true,
      implies: "input",
   })
   .option ("quality",
   {
      type: "number",
      alias: "q",
      description: "A Number between 0 and 1 indicating the image quality to be used when creating images using file formats that support lossy compression (such as JPEG).",
      array: true,
      default: [1],
      requiresArg: true,
   })
   .option ("rotation",
   {
      type: "string",
      alias: "r",
      description: `Creates a parent group with the model as children and sets the specified X3D rotation value.`,
      array: true,
      default: [ ],
      requiresArg: true,
   })
   .option ("size",
   {
      type: "string",
      alias: "s",
      description: "Set image size in pixels.",
      array: true,
      default: ["1280x720"],
      requiresArg: true,
   })
   .option ("text-compression",
   {
      type: "string",
      alias: "t",
      description: `Controls how Text.length and Text.maxExtent are handled. Either by adjusting char spacing or by scaling text letters.`,
      array: true,
      default: ["CHAR_SPACING"],
      choices: ["CHAR_SPACING", "SCALING"],
      requiresArg: true,
   })
   .option ("environment-light",
   {
      type: "string",
      alias: "w",
      description: `Add an EnvironmentLight node to scene. Useful when rendering glTF files with PhysicalMaterial nodes.`,
      array: true,
      default: [ ],
      choices: ["CANNON", "HELIPAD", "FOOTPRINT"],
      requiresArg: true,
   })
   .option ("exposure",
   {
      type: "number",
      alias: "x",
      description: `The exposure of an image describes the amount of light that is captured.`,
      array: true,
      default: [1],
      requiresArg: true,
   })
   .check (args =>
   {
      if (!args .output && !args .extension)
         throw new Error ("Missing argument output or extension.");

      return true;
   })
   .example ([
      [
         "npx x3d-image -s 1600x900 -i file.x3d -o file.jpg",
         "Render a JPEG image from X3D with size 1600x900."
      ],
      [
         "npx x3d-image -s 1600x900 -i file1.x3d -o file1.png -i file2.x3d -o file2.png",
         "Render two PNG images from two X3D files."
      ],
      [
         "npx x3d-image -a -w CANNON -i file.gltf -e .png",
         "Render image of glTF file with view-all and environment light."
      ],
   ])
   .help ()
   .alias ("help", "h") .argv;

   const
      canvas  = document .getElementById ("browser"),
      browser = canvas .browser;

   browser .setBrowserOption ("PrimitiveQuality", "HIGH");
   browser .setBrowserOption ("TextureQuality",   "HIGH");
   browser .setBrowserOption ("Mute",             true);

   const argc = Math .max (args .input .length, args .output ?.length ?? args .extension ?.length);

   for (let i = 0; i < argc; ++ i)
   {
      // Create input filename.

      const input = new URL (arg (args .input, i), url .pathToFileURL (path .join (process .cwd (), "/")));

      // Create output filename.

      let output;

      if (args .output)
      {
         output = path .resolve (process .cwd (), arg (args .output, i));
      }
      else if (args .extension)
      {
         const
            filename  = url .fileURLToPath (input),
            extension = arg (args .extension, i);

         output = `${filename .slice (0, -path. extname (filename) .length)}${extension}`;
      }

      if (args .log)
         console .log (output);

      // Load scene.

      const
         mimeType = mimeTypeFromPath (output),
         size     = arg (args .size, i) .split ("x"),
         width    = parseInt (size [0]) || 1280,
         height   = parseInt (size [1]) || 720;

      browser .endUpdate ();

      await browser .resize (width, height);
      await browser .loadURL (new X3D .MFString (input)) .catch (Function .prototype);

      if (arg (args .background, i))
         await addBackground (browser, browser .currentScene, arg (args .background, i));

      if (arg (args ["environment-light"], i))
         await addEnvironmentLight (browser, browser .currentScene, arg (args ["environment-light"], i));

      if (arg (args .rotation, i))
         await addTransform (browser, browser .currentScene, arg (args .rotation, i));

      if (arg (args .colorSpace, i))
         browser .setBrowserOption ("ColorSpace", arg (args .colorSpace, i));

      if (arg (args .exposure, i))
         browser .setBrowserOption ("Exposure", arg (args .exposure, i));

      if (arg (args ["logarithmic-depth-buffer"], i))
         browser .setBrowserOption ("LogarithmicDepthBuffer", arg (args ["logarithmic-depth-buffer"], i));

      if (arg (args ["order-independent-transparency"], i))
         browser .setBrowserOption ("OrderIndependentTransparency", arg (args ["order-independent-transparency"], i));

      if (arg (args ["text-compression"], i))
         browser .setBrowserOption ("TextCompression", arg (args ["text-compression"], i));

      if (arg (args ["tone-mapping"], i))
         browser .setBrowserOption ("ToneMapping", arg (args ["tone-mapping"], i));

      if (arg (args ["view-all"], i))
         browser .viewAll (0);

      browser .beginUpdate ();

      if (arg (args .delay, i))
         await sleep (arg (args .delay, i) * 1000);

      await browser .nextFrame ();

      // Generate image.

      const blob = await generateImage (canvas, mimeType, arg (args .quality, i));

      fs .writeFileSync (output, new DataView (await blob .arrayBuffer ()));
   }

   browser .dispose ();
}

function arg (arg, i)
{
   return arg [i] ?? arg .at (-1);
}

async function generateImage (canvas, mimeType, quality)
{
   return new Promise ((resolve, reject) =>
   {
      canvas .toBlob (blob => resolve (blob), mimeType, quality);
   });
}

const sleep = delay => new Promise (resolve => setTimeout (resolve, delay));

function mimeTypeFromPath (filename)
{
   switch (path .extname (filename) .toLowerCase ())
   {
      case ".jpg":
      case ".jpeg":
         return "image/jpeg";
      default:
         return "image/png";
   }
}

async function addTransform (browser, scene, rotation)
{
   scene .updateComponent (browser .getComponent ("Grouping"));

   await browser .loadComponents (scene);

   const transform = scene .createNode ("Transform");

   const r = new X3D .SFRotation ();

   r .setName ("rotation");
   r .fromString (rotation, scene);

   transform .children = scene .rootNodes;
   transform .rotation = r;

   scene .rootNodes = new X3D .MFNode (transform);
}

let background = null;

async function addBackground (browser, scene, color)
{
   if (!background)
   {
      scene .updateComponent (browser .getComponent ("EnvironmentalEffects"));

      await browser .loadComponents (scene);

      background = scene .createNode ("Background");

      background .transparency = 1;
   }

   const c = new X3D .SFColorRGBA ();

   c .setName ("background");
   c .fromString (color, scene);

   background .set_bind     = true;
   background .skyColor     = [c .r, c .g, c .b];
   background .transparency = 1 - c .a;

   scene .addRootNode (background);
}

const EnvironmentLights = new Map ([
   ["CANNON",    "cannon-exterior:2"],
   ["HELIPAD",   "helipad:1"],
   ["FOOTPRINT", "footprint-court:1"],
]);

let environmentLight = null;

async function addEnvironmentLight (browser, scene, name)
{
   if (!environmentLight)
   {
      scene .updateComponent (browser .getComponent ("CubeMapTexturing"));

      await browser .loadComponents (scene);

      environmentLight = scene .createNode ("EnvironmentLight");

      const specularTexture = scene .createNode ("ImageCubeMapTexture")

      environmentLight .global          = true;
      environmentLight .intensity       = 1;
      environmentLight .color           = new X3D .SFColor (1, 1, 1);
      environmentLight .specularTexture = specularTexture;
   }

   const [image, intensity] = (EnvironmentLights .get (name)
      ?? EnvironmentLights .get ("CANNON")) .split (":");

   environmentLight .intensity = parseFloat (intensity);

   const
      fileURL     = new URL (`images/${image}`, url .pathToFileURL (path .join (__dirname, "/"))),
      specularURL = new X3D .MFString (`${fileURL}.avif`, `${fileURL}.jpg`);

   if (!environmentLight .specularTexture .url .equals (specularURL))
      environmentLight .specularTexture .url = specularURL;

   scene .addRootNode (environmentLight);

   await environmentLight .specularTexture .getValue () .requestImmediateLoad ();
}
