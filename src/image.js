"use strict"

const
   X3D      = require ("x_ite"),
   electron = require ("electron"),
   yargs    = require ("yargs"),
   path     = require ("path"),
   fs       = require ("fs"),
   DEBUG    = false

// Redirect console messages.

process .exit  = (code)  => electron .ipcRenderer .send ("exit", code)
console .log   = (... messages) => electron .ipcRenderer .send ("log",   messages)
console .warn  = (... messages) => electron .ipcRenderer .send ("warn",  messages)
console .error = (... messages) => electron .ipcRenderer .send ("error", messages)

electron .ipcRenderer .on ("main", async (event, argv) => main (argv))

async function main (argv)
{
   try
   {
      await generate (argv)

      process .exit ()
   }
   catch (error)
   {
      console .error (error .message || error)
      process .exit (1)
   }
}

async function generate (argv)
{
   const args = yargs (argv)
   .scriptName ("x3d-image")
   .usage ("$0 args")
   .command ("x3d-image", "Render image files from X3D")
   .fail ((msg, error, yargs) =>
   {
      console .error (msg)
      process .exit (1)
   })
   .option ("cwd",
   {
      type: "string",
   })
   .hide ("cwd")
   .option ("input",
   {
      type: "string",
      alias: "i",
      description: "Set input file.",
      demandOption: true,
   })
   .option ("output",
   {
      type: "string",
      alias: "o",
      description: "Set output file. To output it to stdout use only the extension, e.g. '.x3dv'.",
      demandOption: true,
   })
   .option ("size",
   {
      type: "string",
      alias: "s",
      description: "Set image size in pixels.",
      default: "1280x720",
   })
   .option ("quality",
   {
      type: "number",
      alias: "q",
      description: "A Number between 0 and 1 indicating the image quality to be used when creating images using file formats that support lossy compression (such as JPEG).",
      default: 1,
   })
   .option ("delay",
   {
      type: "number",
      alias: "d",
      description: "Wait the specified number of seconds before generating the image.",
      default: 0,
   })
   .option ("view-all",
   {
      type: "boolean",
      alias: "v",
      description: "Modify the current view so that all objects fit in view volume.",
   })
   .help ()
   .alias ("help", "h") .argv

   if (args .help)
      return

   const
      canvas   = document .getElementById ("browser"),
      Browser  = canvas .browser,
      input    = path .resolve (args .cwd, args .input),
      output   = path .resolve (args .cwd, args .output),
      size     = args .size .split ("x"),
      width    = parseInt (size [0]) || 1280,
      height   = parseInt (size [1]) || 720,
      mimeType = mimeTypeFromPath (output)

   canvas .setAttribute ("style", `width: ${width}px; height: ${height}px;`)

   Browser .setBrowserOption ("PrimitiveQuality", "HIGH")
   Browser .setBrowserOption ("TextureQuality",   "HIGH")

   await Browser .loadURL (new X3D .MFString (input))

   if (args ["view-all"])
   {
      Browser .viewAll (0)
      await wait ()
   }

   if (args .delay)
      await sleep (args .delay * 1000)

   const blob = await generateImage (canvas, mimeType, args .quality)

   fs .writeFileSync (output, new DataView (await blob .arrayBuffer ()))
}

async function generateImage (canvas, mimeType, quality)
{
   return new Promise ((resolve, reject) =>
   {
      canvas .toBlob (blob => resolve (blob), mimeType, quality)
   })
}

function mimeTypeFromPath (filename)
{
   switch (path .extname (filename) .toLowerCase ())
   {
      case ".jpg":
      case ".jpeg":
         return "image/jpeg"
      default:
         return "image/png"
   }
}

const wait = () => new Promise (resolve => requestAnimationFrame (resolve))

const sleep = delay => new Promise (resolve => setTimeout (resolve, delay))
