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

process .exit  = (code)  => electron .ipcRenderer .send ("exit", code);
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
      console .error (error .message || error);
      process .exit (1);
   }
}

async function generate (argv)
{
   const args = yargs (argv .slice (2))
   .scriptName ("x3d-image")
   .usage ("$0 [options] -i input-file -o output-file [-i input-file -o output-file ...]")
   .wrap (yargs .terminalWidth ())
   .command ("Render image files from X3D")
   .version (pkg .version)
   .alias ("v", "version")
   .fail ((msg, error, yargs) =>
   {
      console .error (msg);
      process .exit (1);
   })
   .option ("input",
   {
      type: "string",
      alias: "i",
      description: "Set input file(s). If there are less input files than output files, the last input file is used for the remaining output files.",
      array: true,
      default: [ ],
      implies: "output",
   })
   .option ("output",
   {
      type: "string",
      alias: "o",
      description: "Set output file(s). This can be either a *.png or *.jpg file.",
      array: true,
      default: [ ],
      implies: "input",
   })
   .option ("size",
   {
      type: "string",
      alias: "s",
      description: "Set image size in pixels.",
      array: true,
      default: ["1280x720"],
   })
   .option ("quality",
   {
      type: "number",
      alias: "q",
      description: "A Number between 0 and 1 indicating the image quality to be used when creating images using file formats that support lossy compression (such as JPEG).",
      array: true,
      default: [1],
   })
   .option ("delay",
   {
      type: "number",
      alias: "d",
      description: "Wait the specified number of seconds before generating the image.",
      array: true,
      default: [0],
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
      type: "boolean",
      alias: "b",
      description: `Set background to transparent. Use PNG as output image format.`,
      array: true,
      default: [false],
   })
   .option ("environment-light",
   {
      type: "string",
      alias: "e",
      description: `Add an EnvironmentLight node to scene, default is "CANNON". Useful when rendering glTF files with PhysicalMaterial nodes.`,
      choices: ["CANNON", "HELIPAD", "FOOTPRINT"],
      array: true,
      default: [ ],
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
         "npx x3d-image -a -e CANNON -i file.gltf -o file.png",
         "Render image of glTF file with view-all end environment light."
      ],
   ])
   .help ()
   .alias ("help", "h") .argv;

   if (args .version)
      return;

   if (args .help)
      return;

   const
      canvas  = document .getElementById ("browser"),
      browser = canvas .browser;

   browser .setBrowserOption ("Mute",             true);
   browser .setBrowserOption ("PrimitiveQuality", "HIGH");
   browser .setBrowserOption ("TextureQuality",   "HIGH");

   if (!args .input .length)
      console .warn ("No input files specified.");

   for (const i of args .output .keys ())
   {
      const
         size   = arg (args .size, i) .split ("x"),
         width  = parseInt (size [0]) || 1280,
         height = parseInt (size [1]) || 720;

      await browser .resize (width, height);

      const
         input    = new URL (arg (args .input, i), url .pathToFileURL (path .join (process .cwd (), "/"))),
         output   = path .resolve (process .cwd (), args .output [i]),
         mimeType = mimeTypeFromPath (output);

      await browser .loadURL (new X3D .MFString (input)) .catch (Function .prototype);

      if (arg (args .background, i))
         await addBackground (browser, browser .currentScene);

      if (arg (args ["environment-light"], i))
         await addEnvironmentLight (browser, browser .currentScene, arg (args ["environment-light"], i));

      if (arg (args ["view-all"], i))
      {
         browser .viewAll (0);
         await browser .nextFrame ();
      }

      if (arg (args .delay, i))
         await sleep (arg (args .delay, i) * 1000);

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

const EnvironmentLights = new Map ([
   ["CANNON",    "cannon-exterior:2"],
   ["HELIPAD",   "helipad:1"],
   ["FOOTPRINT", "footprint-court:1"],
]);

let background = null;

async function addBackground (browser, scene)
{
   browser .endUpdate ();

   if (!background)
   {
      scene .addComponent (browser .getComponent ("EnvironmentalEffects"));

      await browser .loadComponents (scene);

      background = scene .createNode ("Background");

      background .transparency = 1;
   }

   scene .addRootNode (background);

   background .set_bind = true;

   await browser .nextFrame ();

   browser .beginUpdate ();
}

let environmentLight = null;

async function addEnvironmentLight (browser, scene, name)
{
   browser .endUpdate ();

   if (!environmentLight)
   {
      scene .addComponent (browser .getComponent ("CubeMapTexturing"));

      await browser .loadComponents (scene);

      environmentLight = scene .createNode ("EnvironmentLight");

      const
         diffuseTexture    = scene .createNode ("ImageCubeMapTexture"),
         specularTexture   = scene .createNode ("ImageCubeMapTexture"),
         textureProperties = scene .createNode ("TextureProperties");

      textureProperties .generateMipMaps     = true;
      textureProperties .minificationFilter  = "NICEST";
      textureProperties .magnificationFilter = "NICEST";

      diffuseTexture  .textureProperties = textureProperties;
      specularTexture .textureProperties = textureProperties;

      environmentLight .intensity       = 1;
      environmentLight .color           = new X3D .SFColor (1, 1, 1);
      environmentLight .diffuseTexture  = diffuseTexture;
      environmentLight .specularTexture = specularTexture;
   }

   const [image, intensity] = (EnvironmentLights .get (name)
      ?? EnvironmentLights .get ("CANNON")) .split (":");

   environmentLight .intensity = parseFloat (intensity);

   const
      fileURL     = new URL (`images/${image}`, url .pathToFileURL (path .join (__dirname, "/"))),
      diffuseURL  = new X3D .MFString (`${fileURL}-diffuse.avif`,  `${fileURL}-diffuse.jpg`),
      specularURL = new X3D .MFString (`${fileURL}-specular.avif`, `${fileURL}-specular.jpg`);

   if (!environmentLight .diffuseTexture .url .equals (diffuseURL))
      environmentLight .diffuseTexture .url = diffuseURL;

   if (!environmentLight .specularTexture .url .equals (specularURL))
      environmentLight .specularTexture .url = specularURL;

   scene .addRootNode (environmentLight);

   await Promise .all ([
      browser .nextFrame (),
      environmentLight .diffuseTexture  .getValue () .requestImmediateLoad (),
      environmentLight .specularTexture .getValue () .requestImmediateLoad (),
   ]);

   browser .beginUpdate ();
}
