/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AzureWizardExecuteStep } from '@microsoft/vscode-azext-utils';
import type { IProjectWizardContext } from '@microsoft/vscode-extension-logic-apps';
import { OpenBehavior } from '@microsoft/vscode-extension-logic-apps';
import { commands, Uri, workspace } from 'vscode';
import { extensionCommand } from '../../../constants';

export class OpenFolderStep extends AzureWizardExecuteStep<IProjectWizardContext> {
  public priority = 250;

  public async execute(context: IProjectWizardContext): Promise<void> {
    const openFolders = workspace.workspaceFolders || [];
    if (context.openBehavior === OpenBehavior.addToWorkspace && openFolders.length === 0) {
      context.openBehavior = OpenBehavior.openInCurrentWindow;
    }

    //open directory which contains both SWA and LA
    const uri: Uri = Uri.file(`${context.workspacePath}/..`);
    if (context.openBehavior === OpenBehavior.addToWorkspace) {
      workspace.updateWorkspaceFolders(openFolders.length, 0, { uri: uri });
    } else {
      await commands.executeCommand(
        extensionCommand.vscodeOpenFolder,
        uri,
        context.openBehavior === OpenBehavior.openInNewWindow /* forceNewWindow */
      );
    }
  }

  public shouldExecute(context: IProjectWizardContext): boolean {
    return !!context.openBehavior && context.openBehavior !== OpenBehavior.alreadyOpen && context.openBehavior !== OpenBehavior.dontOpen;
  }
}
