/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import path from 'path';
import { projectTemplateKeySetting } from '../../../constants';
import { getProjFiles } from '../../utils/dotnet/dotnet';
import { addLocalFuncTelemetry, checkSupportedFuncVersion } from '../../utils/funcCoreTools/funcVersion';
import { getWorkspaceSetting } from '../../utils/vsCodeConfig/settings';
import { verifyInitForVSCode } from '../../utils/vsCodeConfig/verifyInitForVSCode';
import { getContainingWorkspace, getWorkspaceFolder } from '../../utils/workspace';
import { WorkflowStateTypeStep } from './createCodelessSteps/WorkflowStateTypeStep';
import { isString } from '@microsoft/logic-apps-shared';
import type { IActionContext } from '@microsoft/vscode-azext-utils';
import { AzureWizard } from '@microsoft/vscode-azext-utils';
import type { IFunctionWizardContext, FuncVersion, IProjectWizardContext } from '@microsoft/vscode-extension-logic-apps';
import { ProjectLanguage, WorkflowProjectType } from '@microsoft/vscode-extension-logic-apps';
import type { WorkspaceFolder } from 'vscode';
import * as fs from 'fs';

export async function createCodeless(
  context: IActionContext,
  workspacePath?: string | undefined,
  templateId?: string,
  logicAppName?: string,
  triggerSettings?: { [key: string]: string | undefined },
  language?: ProjectLanguage,
  version?: FuncVersion
): Promise<void> {
  addLocalFuncTelemetry(context);
  let workspaceFolder: WorkspaceFolder | undefined;

  workspacePath = isString(workspacePath) ? workspacePath : undefined;
  if (workspacePath === undefined) {
    workspaceFolder = await getWorkspaceFolder(context);
    workspacePath = isString(workspaceFolder) ? workspaceFolder : workspaceFolder.uri.fsPath;
  } else {
    workspaceFolder = getContainingWorkspace(workspacePath);
  }

  //TODO 2: project path changed to account for SWA. need to add flag depending on if SWA initialized

  // const projectPath: string | undefined = await verifyAndPromptToCreateProject(context, workspacePath);
  // if (!projectPath) {
  //   return;
  // }

  const projectPath = path.join(searchDirectory(workspacePath, 'Stateful1'), '..');

  let workflowProjectType: WorkflowProjectType = WorkflowProjectType.Bundle;
  const projectFiles = await getProjFiles(context, ProjectLanguage.CSharp, projectPath);
  if (projectFiles.length > 0) {
    workflowProjectType = WorkflowProjectType.Nuget;
  }

  [language, version] = await verifyInitForVSCode(context, projectPath, language, version);

  checkSupportedFuncVersion(version);

  const projectTemplateKey: string | undefined = getWorkspaceSetting(projectTemplateKeySetting, projectPath);
  const wizardContext: IFunctionWizardContext = Object.assign(context, {
    projectPath,
    workspacePath,
    workspaceFolder,
    version,
    language,
    functionName: logicAppName,
    workflowProjectType,
    projectTemplateKey,
  });
  const wizard: AzureWizard<IFunctionWizardContext> = new AzureWizard(wizardContext, {
    promptSteps: [await WorkflowStateTypeStep.create(wizardContext, { templateId, triggerSettings, isProjectWizard: false })],
  });

  await wizard.prompt();
  await wizard.execute();
}

function searchDirectory(dir: string, targetDirName: string): string | null {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      if (file === targetDirName) {
        return fullPath;
      }
      const result = searchDirectory(fullPath, targetDirName);
      if (result) {
        return result;
      }
    }
  }

  return null;
}
