// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { changeFile } from "./changeFile";

import { commands } from "vscode";

import { showQuickPick } from "./basicInput";

let myStatusBarItem: vscode.StatusBarItem;
const storageKey = "currentTypePriority";
const commandIds = ["Default", "*.web", "*.ios", "*.android"];
const quickInput = "extensionsPriority.quickInput";

const extensionsMap = {
  Default: ".ts",
  "*.web": ".web",
  "*.ios": ".ios",
  "*.android": ".android"
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(quickInput, async () => {
      showQuickPick(commandIds, context, storageKey).then(() => {
        const pickedValue = context.workspaceState.get(storageKey);
        if (typeof pickedValue === "string") {
          updateStatusBarItem("Loading...");
          if (vscode.workspace.rootPath) {
            changeFile(
              vscode.workspace.rootPath,
              //@ts-ignore
              extensionsMap[pickedValue],
              () => {
                commands.executeCommand("typescript.restartTsServer");
                updateStatusBarItem(pickedValue);
              }
            );
          }
        }
      });
    })
  );

  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  myStatusBarItem.command = quickInput;
  context.subscriptions.push(myStatusBarItem);

  // update status bar item once at start
  const pickedValue = context.workspaceState.get(storageKey);
  if (typeof pickedValue === "string") {
    updateStatusBarItem(pickedValue);
  } else {
    updateStatusBarItem("Default");
  }
}

function updateStatusBarItem(extension: string): void {
  myStatusBarItem.text = extension;
  myStatusBarItem.show();
}

// this method is called when your extension is deactivated
export function deactivate() {}
