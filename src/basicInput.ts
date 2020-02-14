/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, ExtensionContext } from "vscode";

/**
 * Shows a pick list using window.showQuickPick().
 */

export async function showQuickPick(
  commands: string[],
  context: ExtensionContext,
  storageKey: string
) {
  const result = await window.showQuickPick(commands, {
    placeHolder: "Choose highest priority for types resolvers"
  });

  context.workspaceState.update(storageKey, result);
}
