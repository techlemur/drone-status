import * as vscode from 'vscode';
import { ApiClient } from './apiClient';
import { QuickPick } from './quickPick';
import { StatusBar } from './statusBar';

export async function activate(context: vscode.ExtensionContext) {
  let apiClient: ApiClient;
  let quickPick: QuickPick;
  let statusBar: StatusBar;

  const commandName = 'droneStatus.selectCommand';
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = commandName;
  context.subscriptions.push(vscode.commands.registerCommand(commandName, async () => {
    try {
      if (quickPick && statusBar) {
        await statusBar.updateBuildStatus();
        await quickPick.showItem(statusBar);
      }
    } catch (err) {
      console.log(err);
      return;
    }
  }));
  context.subscriptions.push(statusBarItem);

  const main = async (server: string, token: string, owner: string, repo: string) => {
    try {
      apiClient = new ApiClient(server, token, owner, repo);
      await apiClient.setup();

      quickPick = new QuickPick(apiClient);
      statusBar = new StatusBar(apiClient, quickPick, statusBarItem);
      await statusBar.setup();
    } catch (err) {
      if (statusBar) {
        statusBar.clearStatusBarInterval();
      }
      console.log(err);
      return;
    }
  };

  const getConfig = () => {
    const owner = vscode.workspace.getConfiguration('droneStatus').get('owner', '');

    let server = vscode.workspace.getConfiguration('droneStatus').get('server', '');
    let token = vscode.workspace.getConfiguration('droneStatus').get('token', '');
    let repo = vscode.workspace.getConfiguration('droneStatus').get('repo', '');

    if (server === '') {
      server = process.env.DRONE_SERVER === undefined ? '' : process.env.DRONE_SERVER;
    }

    if (token === '') {
      token = process.env.DRONE_TOKEN === undefined ? '' : process.env.DRONE_TOKEN;
    }

    if (token === '' || server === '') {
      vscode.window.showErrorMessage(`Drone server and/or token configuration missing`);
      return;
    }

    if (repo === '') {
      repo = vscode.workspace.workspaceFolders === undefined ? '' : vscode.workspace.workspaceFolders[0].name;
    }

    if (statusBar) {
      statusBar.clearStatusBarInterval();
    }
    main(server, token, owner, repo);
  };
  getConfig();
  vscode.workspace.onDidChangeConfiguration(getConfig);
}

export function deactivate() { }
