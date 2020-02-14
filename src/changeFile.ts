const fs = require("fs");
import * as vscode from "vscode";

export const changeFile = (
  path: string,
  priorityExtension: string,
  callback: () => void
) => {
  let custom =
    priorityExtension !== ".ts"
      ? `tryExtension("${priorityExtension}.ts") || tryExtension("${priorityExtension}.tsx") ||`
      : "";

  let replacement = `(candidate, extensions, onlyRecordFailures, state) {
    if (!onlyRecordFailures) {
        // check if containing folder exists - if it doesn't then just record failures for all supported extensions without disk probing
        var directory = ts.getDirectoryPath(candidate);
        if (directory) {
            onlyRecordFailures = !ts.directoryProbablyExists(directory, state.host);
        }
    }
    switch (extensions) {
        case Extensions.DtsOnly:
            return tryExtension(".d.ts" /* Dts */);
        case Extensions.TypeScript:
            return ${custom} tryExtension(".ts" /* Ts */) || tryExtension(".tsx" /* Tsx */) || tryExtension(".d.ts" /* Dts */);
        case Extensions.JavaScript:
            return tryExtension(".js" /* Js */) || tryExtension(".jsx" /* Jsx */);
        case Extensions.TSConfig:
        case Extensions.Json:
            return tryExtension(".json" /* Json */);
    }`;

  const file = path + "/node_modules/typescript/lib/tsserver.js";

  fs.readFile(
    file,
    "utf8",
    //@ts-ignore
    function(error, data) {
      if (error) {
        vscode.window.showInformationMessage(error);
      }
      if (data) {
        const newData = data.replace(
          /(?<=function tryAddingExtensions)(.*)(?=function tryExtension)/gms,
          replacement
        );

        fs.writeFile(file, newData, "utf-8", function(err: Error) {
          if (err) {
            vscode.window.showInformationMessage(err.message);
            throw err;
          }
          //console.log("file", file);
          callback();
        });
      } else {
        vscode.window.showInformationMessage(
          "Can`t find tsserver.js in workspaces node_modules."
        );
      }
    }
  );
};
