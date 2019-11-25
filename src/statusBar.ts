import * as vscode from 'vscode';
import * as Types from './types';
import { ApiClient } from './ApiClient';
import { QuickPick } from './QuickPick';

export class StatusBar {
  private apiClient: ApiClient;
  private quickPick: QuickPick;
  private statusBarItem: vscode.StatusBarItem;
  private statusBarInterval: NodeJS.Timeout | undefined;

  constructor(apiClient: ApiClient, quickPick: QuickPick, statusBarItem: vscode.StatusBarItem) {
    this.apiClient = apiClient;
    this.quickPick = quickPick;
    this.statusBarItem = statusBarItem;
    this.statusBarInterval = undefined;
  }

  public async setup(interval: number = 60000) {
    const self = this;
    this.statusBarInterval = setInterval(async () => {
      try {
        await self.updateBuildStatus();
      } catch (err) {
        console.log(err);
      }
    }, interval);
    await this.updateBuildStatus();
  }

  public async updateBuildStatus() {
    const recentBuilds: Types.RecentBuild[] = await this.apiClient.getRecentBuilds();
    this.updateItem(recentBuilds[0]);
    this.quickPick.updateRecentBuilds(recentBuilds);
  }

  public clearStatusBarInterval() {
    if (this.statusBarInterval) {
      clearInterval(this.statusBarInterval);
    }
  }

  public updateBuildStatusDelayed() {
    setTimeout(async () => {
      this.updateBuildStatus();
    }, 1000);
  }

  public updateItem(recentBuild: Types.RecentBuild | undefined) {
    let text: string = 'Drone ';
    if (!recentBuild) {
      text += '$(stop)';
    } else {
      switch (recentBuild.status) {
        case 'pending':
          text += '$(clock)';
          this.updateBuildStatusDelayed();
          break;
        case 'running':
          text += '$(gear~spin)';
          this.updateBuildStatusDelayed();
          break;
        case 'failed':
          text += '$(x)';
          break;
        case 'success':
          text += '$(check)';
          break;
        case 'killed':
          text += '$(circle-slash)';
          break;
        default:
          text += recentBuild.status;
          break;
      }
    }

    this.statusBarItem.text = text;
    this.statusBarItem.show();
  }
}
