/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AzureWizardExecuteStep } from '@microsoft/vscode-azext-utils';
import type { IProjectWizardContext } from '@microsoft/vscode-extension-logic-apps';
import type { Terminal } from 'vscode';
import { window } from 'vscode';

export class ConnectStaticWebAppStep extends AzureWizardExecuteStep<IProjectWizardContext> {
  public priority = 350; // Set the priority higher than OpenFolderStep if you want this to run after

  public async execute(_context: IProjectWizardContext): Promise<void> {
    const terminal: Terminal = window.createTerminal('Create React App');
    terminal.show();
    terminal.sendText('npx create-react-app my-app', true);
    terminal.sendText('cd my-app', true);
    terminal.sendText('npm start', true);
  }

  public shouldExecute(context: IProjectWizardContext): boolean {
    // Only execute if the user chose to connect a static web apps
    return !!context.connectStaticWebAppBehavior;
  }
}
