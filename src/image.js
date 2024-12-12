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
   .usage ("$0 [options] input-file output-file [input-file output-file ...]")
   .wrap (yargs .terminalWidth ())
   .command ("Render image files from X3D")
   .version (pkg .version)
   .alias ("v", "version")
   .example ([
      [
         "npx x3d-image -s 1600x900 file.x3d file.jpg",
         "Render an JPEG image from X3D with size 1600x900."
      ],
      [
         "npx x3d-image -s 1600x900 file1.x3d file1.png file2.x3d file2.png",
         "Render an two PNG image from two X3D files."
      ],
   ])
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
      description: "Set output file(s). To output it to stdout use only the extension, e.g. '.x3dv'.",
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
   .help ()
   .alias ("help", "h") .argv;

   if (args .version)
      return;

   if (args .help)
      return;

   if (args .input .length === 0 && args .output .length === 0)
   {
      if (args ._ .length % 2 === 0)
      {
         for (let i = 0; i < args ._ .length; i += 2)
         {
            args .input  .push (args ._ [i + 0]);
            args .output .push (args ._ [i + 1]);
         }
      }
   }
   const
      canvas   = document .getElementById ("browser"),
      Browser  = canvas .browser;

   Browser .setBrowserOption ("PrimitiveQuality", "HIGH");
   Browser .setBrowserOption ("TextureQuality",   "HIGH");

   for (const i of args .output .keys ())
   {
      const
         input    = new URL (args .input [i] ?? args .input .at (-1), url .pathToFileURL (path .join (process .cwd (), "/"))),
         output   = path .resolve (process .cwd (), args .output [i]),
         mimeType = mimeTypeFromPath (output);

      await Browser .loadURL (new X3D .MFString (input));

      const
         size   = (args .size [i] ?? args .size .at (-1)) .split ("x"),
         width  = parseInt (size [0]) || 1280,
         height = parseInt (size [1]) || 720;

      await Browser .resize (width, height);

      if (args ["view-all"] [i] ?? args ["view-all"] .at (-1))
      {
         Browser .viewAll (0);
         await Browser .nextFrame ();
      }

      if (args .delay [i] ?? args .delay .at (-1))
         await sleep ((args .delay [i] ?? args .delay .at (-1)) * 1000);

      const blob = await generateImage (canvas, mimeType, args .quality [i] ?? args .quality .at (-1));

      fs .writeFileSync (output, new DataView (await blob .arrayBuffer ()));
   }

   Browser .dispose ();
}

async function generateImage (canvas, mimeType, quality)
{
   return new Promise ((resolve, reject) =>
   {
      canvas .toBlob (blob => resolve (blob), mimeType, quality);
   });
}

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

const sleep = delay => new Promise (resolve => setTimeout (resolve, delay));
