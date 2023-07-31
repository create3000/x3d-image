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
   .command ("x3d-tidy", "Generate image and video files from X3D")
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
   })
   .help ()
   .alias ("help", "h") .argv;

   const
      Browser = X3D .createBrowser () .browser,
      input   = path .resolve (args .cwd, args .input),
      output  = path .resolve (args .cwd, args .output)

   Browser .setBrowserOption ("PrimitiveQuality", "HIGH");
   Browser .setBrowserOption ("TextureQuality",   "HIGH");

   await Browser .loadURL (new X3D .MFString (input))
}
