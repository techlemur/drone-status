import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';
import * as Types from './types';

export class ApiClient {
  private server: string;
  private repo: string;
  private owner: string;
  private instance: AxiosInstance;

  constructor(server: string, token: string, owner: string, repo: string) {
    this.server = server;
    this.owner = owner;
    this.repo = repo;
    this.instance = axios.create({
      baseURL: `${this.server}/api`,
      timeout: 1000,
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  public async setup() {
    try {
      const response = await this.requestApiWithGet('/user');
      if (this.owner === '') {
        this.owner = response.data.login;
      }
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to connect to (${this.server})`);
      throw new Error(err);
    }
  }

  public getBuildUrl(buildNumber: number): string {
    return `${this.server}/${this.owner}/${this.repo}/${buildNumber}`;
  }

  public async getRecentBuilds(): Promise<any> {
    try {
      const path = `/repos/${this.owner}/${this.repo}/builds`;
      let recentBuilds: Types.RecentBuild[] = [];

      const response = await this.requestApiWithGet(path);
      response.data.forEach((e: any) => {
        recentBuilds.push({
          id: e.id,
          repoId: e.repo_id,
          number: e.number,
          status: e.status,
          event: e.status,
          action: e.status,
          link: e.link,
          message: e.message ? e.message : '',
          before: e.before,
          after: e.after,
          ref: e.ref,
          sourceRepo: e.source_repo,
          source: e.source,
          target: e.target,
          authorLogin: e.author_login ? e.author_login : e.author_email,
          authorName: e.author_name ? e.author_name : e.author_login,
          authorEmail: e.author_email,
          authorAvatar: e.author_avatar,
          sender: e.sender,
          started: e.started,
          finished: e.finished,
          created: e.created,
          updated: e.updated,
          version: e.version
        });
      });
      return recentBuilds;
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to get builds for (${this.owner}/${this.repo})`);
      throw new Error(err);
    }
  }

  public async retryBuild(buildNumber: number) {
    const path = `/repos/${this.owner}/${this.repo}/builds/${buildNumber}`;

    await this.requestApiWithPost(path);
    vscode.window
      .showInformationMessage(`Restarted build #${buildNumber}`, 'Go to Build')
      .then(() => {
        buildNumber = buildNumber++;
        vscode.env.openExternal(vscode.Uri.parse(this.getBuildUrl(buildNumber)));
      });
  }

  private async requestApiWithGet(path: string): Promise<any> {
    try {
      const response = await this.instance.get(path);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }

  private async requestApiWithPost(path: string): Promise<any> {
    try {
      const response = await this.instance.post(path);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }
}
