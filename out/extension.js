"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const changeFile_1 = require("./changeFile");
const vscode_1 = require("vscode");
const basicInput_1 = require("./basicInput");
let myStatusBarItem;
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
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand(quickInput, () => __awaiter(this, void 0, void 0, function* () {
        basicInput_1.showQuickPick(commandIds, context, storageKey).then(() => {
            const pickedValue = context.workspaceState.get(storageKey);
            if (typeof pickedValue === "string") {
                updateStatusBarItem("Loading...");
                if (vscode.workspace.rootPath) {
                    changeFile_1.changeFile(vscode.workspace.rootPath, 
                    //@ts-ignore
                    extensionsMap[pickedValue], () => {
                        vscode_1.commands.executeCommand("typescript.restartTsServer");
                        updateStatusBarItem(pickedValue);
                    });
                }
            }
        });
    })));
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.command = quickInput;
    context.subscriptions.push(myStatusBarItem);
    // update status bar item once at start
    const pickedValue = context.workspaceState.get(storageKey);
    if (typeof pickedValue === "string") {
        updateStatusBarItem(pickedValue);
    }
    else {
        updateStatusBarItem("default");
    }
}
exports.activate = activate;
function updateStatusBarItem(extension) {
    myStatusBarItem.text = extension;
    myStatusBarItem.show();
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map