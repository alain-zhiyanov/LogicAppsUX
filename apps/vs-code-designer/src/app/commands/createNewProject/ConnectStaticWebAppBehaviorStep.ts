/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import type { IAzureQuickPickItem } from '@microsoft/vscode-azext-utils';
import { AzureWizardPromptStep } from '@microsoft/vscode-azext-utils';
import type { IProjectWizardContext } from '@microsoft/vscode-extension-logic-apps';
import { localize } from '../../../localize';
import { window } from 'vscode';

export class ConnectStaticWebAppBehaviorStep extends AzureWizardPromptStep<IProjectWizardContext> {
  public hideStepCount = true;

  public async prompt(context: IProjectWizardContext): Promise<void> {
    // Define the QuickPick items with associated data
    const picks: IAzureQuickPickItem<boolean>[] = [
      { label: localize('Yes', 'Yes'), data: true },
      { label: localize('Skip', 'Skip'), data: false },
    ];

    // Show QuickPick with options
    const placeHolder: string = localize('connectStaticWebApp', 'Would you like to connect a static web app to your project?');
    // Use the user's selection to set the context property
    context.connectStaticWebAppBehavior = (await window.showQuickPick(picks, { placeHolder })).data;
  }

  public shouldPrompt(_context: IProjectWizardContext): boolean {
    return true;
  }
}
