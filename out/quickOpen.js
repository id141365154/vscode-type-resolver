"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
const path = require("path");
const cp = require("child_process");
const vscode_1 = require("vscode");
const vscode_2 = require("vscode");
/**
 * A file opener using window.createQuickPick().
 *
 * It shows how the list of items can be dynamically updated based on
 * the user's input in the filter field.
 */
function quickOpen() {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = yield pickFile();
        if (uri) {
            const document = yield vscode_2.workspace.openTextDocument(uri);
            yield vscode_1.window.showTextDocument(document);
        }
    });
}
exports.quickOpen = quickOpen;
class FileItem {
    constructor(base, uri) {
        this.base = base;
        this.uri = uri;
        this.label = path.basename(uri.fsPath);
        this.description = path.dirname(path.relative(base.fsPath, uri.fsPath));
    }
}
class MessageItem {
    constructor(base, message) {
        this.base = base;
        this.message = message;
        this.description = '';
        this.label = message.replace(/\r?\n/g, ' ');
        this.detail = base.fsPath;
    }
}
function pickFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const disposables = [];
        try {
            return yield new Promise((resolve, reject) => {
                const input = vscode_1.window.createQuickPick();
                input.placeholder = 'Type to search for files';
                let rgs = [];
                disposables.push(input.onDidChangeValue(value => {
                    rgs.forEach(rg => rg.kill());
                    if (!value) {
                        input.items = [];
                        return;
                    }
                    input.busy = true;
                    const cwds = vscode_2.workspace.workspaceFolders ? vscode_2.workspace.workspaceFolders.map(f => f.uri.fsPath) : [process.cwd()];
                    const q = process.platform === 'win32' ? '"' : '\'';
                    rgs = cwds.map(cwd => {
                        const rg = cp.exec(`rg --files -g ${q}*${value}*${q}`, { cwd }, (err, stdout) => {
                            const i = rgs.indexOf(rg);
                            if (i !== -1) {
                                if (rgs.length === cwds.length) {
                                    input.items = [];
                                }
                                if (!err) {
                                    input.items = input.items.concat(stdout
                                        .split('\n').slice(0, 50)
                                        .map(relative => new FileItem(vscode_1.Uri.file(cwd), vscode_1.Uri.file(path.join(cwd, relative)))));
                                }
                                if (err && !err.killed && err.code !== 1 && err.message) {
                                    input.items = input.items.concat([
                                        new MessageItem(vscode_1.Uri.file(cwd), err.message)
                                    ]);
                                }
                                rgs.splice(i, 1);
                                if (!rgs.length) {
                                    input.busy = false;
                                }
                            }
                        });
                        return rg;
                    });
                }), input.onDidChangeSelection(items => {
                    const item = items[0];
                    if (item instanceof FileItem) {
                        resolve(item.uri);
                        input.hide();
                    }
                }), input.onDidHide(() => {
                    rgs.forEach(rg => rg.kill());
                    resolve(undefined);
                    input.dispose();
                }));
                input.show();
            });
        }
        finally {
            disposables.forEach(d => d.dispose());
        }
    });
}
//# sourceMappingURL=quickOpen.js.map