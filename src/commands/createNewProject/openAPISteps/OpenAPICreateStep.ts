import { OpenDialogOptions, ProgressLocation, Uri, window, workspace } from "vscode";
import { AzureWizardExecuteStep } from "vscode-azureextensionui";
import { ProjectLanguage } from "../../../constants";
import { ext } from "../../../extensionVariables";
import { localize } from "../../../localize";
import { cpUtils } from "../../../utils/cpUtils";
import { IFunctionWizardContext } from "../../createFunction/IFunctionWizardContext";

export class OpenAPICreateStep extends AzureWizardExecuteStep<IFunctionWizardContext> {
    public priority: number;

    public async execute(wizardContext: IFunctionWizardContext): Promise<void> {
        const uris = await this.askDocument();
        const uri = uris[0];

        const args: string[] = [];
        args.push(`--input-file:${uri.fsPath}`);

        if (wizardContext.language === ProjectLanguage.TypeScript) {
            args.push('--use:@autorest/azure-functions-typescript@0.0.1-preview-dev');
        } else if (wizardContext.language === ProjectLanguage.CSharp) {
            args.push('--use:@autorest/azure-functions-csharp@0.1.0-dev.187602791');
            args.push('--namespace:Microsoft.Azure.Stencil');
        } else if (wizardContext.language === ProjectLanguage.Java) {
            args.push('--use:@autorest/azure-functions-java@0.0.2-Preview');
            args.push('--namespace:com.microsoft.azure.stencil');
            args.push('--azure-functions-java');
        } else if (wizardContext.language === ProjectLanguage.Python) {
            args.push('--use:@autorest/azure-functions-python@0.0.1-preview-dev.20200729.3');
        } else {
            throw new Error(localize("notSupported", "Not a supported language"));
        }

        args.push('--no-namespace-folders:True');
        args.push('--generate-metadata:false');
        args.push(`--output-folder:${wizardContext.projectPath}`);
        args.push('--no-async');
        args.push(`--language:${wizardContext.language?.toLowerCase()}`);

        ext.outputChannel.show();
        await window.withProgress({ location: ProgressLocation.Notification, title: localize('generatingFunctions', 'Generating Http trigger functions from OpenAPI...') }, async () => {
            await cpUtils.executeCommand(ext.outputChannel, undefined, 'autorest', ...args);
        });
    }

    public shouldExecute(): boolean {
        return true;
    }

    public async askDocument(): Promise<Uri[]> {
        const openDialogOptions: OpenDialogOptions = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            openLabel: "Select OpenAPI File",
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
