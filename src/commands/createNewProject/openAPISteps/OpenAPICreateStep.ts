import { OpenDialogOptions, Uri, workspace } from "vscode";
import { AzureWizardExecuteStep } from "vscode-azureextensionui";
import { ext } from "../../../extensionVariables";
import { cpUtils } from "../../../utils/cpUtils";
import { IFunctionWizardContext } from "../../createFunction/IFunctionWizardContext";

export class OpenAPICreateStep extends AzureWizardExecuteStep<IFunctionWizardContext> {
    public priority: number;

    public async execute(wizardContext: IFunctionWizardContext): Promise<void> {
        const uris = await this.askDocument();
        const uri = uris[0];

        const args: string[] = [];
        args.push(`--input-file:${uri.fsPath}`);
        args.push('--use:@autorest/azure-functions@0.0.1-preview-dev.20200727.5');
        args.push(`--output-folder:${wizardContext.projectPath}`);
        args.push('--no-async');
        args.push(`--language:${wizardContext.language?.toLowerCase()}`);

        ext.outputChannel.show();
        await cpUtils.executeCommand(ext.outputChannel, undefined, 'autorest', ...args);
    }
    public shouldExecute(): boolean {
        return true;
    }

    public async askDocument(): Promise<Uri[]> {
        const openDialogOptions: OpenDialogOptions = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            openLabel: "OpenAPI File",
            filters: {
                JSON: ["json"]
            }
        };
        const rootPath = workspace.rootPath;
        if (rootPath) {
            openDialogOptions.defaultUri = Uri.file(rootPath);
        }
        return await ext.ui.showOpenDialog(openDialogOptions);
    }
}
