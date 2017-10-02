/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as cp from 'child_process';
import * as vscode from 'vscode';

export async function createFunction(outputChannel: vscode.OutputChannel, workingDirectory: string, templateName: string, name: string) {
    await executeCommand(outputChannel, workingDirectory, 'new', '--language', 'JavaScript', '--template', templateName, '--name', name);
}

export async function createFunctionApp(outputChannel: vscode.OutputChannel, workingDirectory: string) {
    await executeCommand(outputChannel, workingDirectory, 'init');
}

function executeCommand(outputChannel: vscode.OutputChannel, workingDirectory: string, ...args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const options: cp.SpawnOptions = {
            cwd: workingDirectory,
            shell: true
        };
        const childProc = cp.spawn('func', args, options);
        let stderr: string = '';
        childProc.stdout.on('data', (data) => outputChannel.append(data.toString()));
        childProc.stderr.on('data', (data) => stderr = stderr.concat(data.toString()));
        childProc.on('error', reject);
        childProc.on('close', code => {
            const errorMessage = stderr.trim();
            if (errorMessage) {
                // 'func' commands always seem to return exit code 0. For now,
                // we will use stderr to detect if an error occurs (even though stderr
                // doesn't necessarily mean there's an error)
                reject(errorMessage);
            } else if (code !== 0) {
                reject(new Error(`Command failed with exit code '${code}'.`));
            } else {
                resolve();
            }
        });
    });
}
