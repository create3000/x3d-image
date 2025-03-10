"use strict";

const
   electron = require ("electron"),
   path     = require ("path"),
   colors   = require ("colors");

// Restore argv.

process .argv = process .argv .concat (JSON .parse (atob (process .argv .pop ())));
process .chdir (process .argv .pop ());

// Set env vars for Electron.

process .env .ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
// process .env .ELECTRON_ENABLE_LOGGING            = 1;

// Hide Electron.

if (process .platform === "darwin")
{
   electron .app .setActivationPolicy ("accessory");
   electron .app .dock .hide ();
}

// Start app and handle events.

electron .app .whenReady () .then (async () =>
{
   const window = new electron .BrowserWindow ({
      show: false,
      skipTaskbar: true,
      webPreferences: {
         // offscreen: true,
         preload: path .join (__dirname, "window.js"),
         nodeIntegration: true,
         contextIsolation: false,
      },
   });

   electron .ipcMain .on ("log", (event, messages) =>
   {
      console .log (... messages);
   });

   electron .ipcMain .on ("warn", (event, messages) =>
   {
      console .warn (... messages .map (string => colors .yellow (string)));
   });

   electron .ipcMain .on ("error", (event, messages) =>
   {
      console .error (... messages .map (string => colors .red (string)));
   });

   electron .ipcMain .on ("exit", (event, code = 0) =>
   {
      electron .app .exit (code);
   });

   await window .loadFile (path .join (__dirname, "window.html"));

   window .webContents .send ("main", process .argv);
});
