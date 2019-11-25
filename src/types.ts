import * as vscode from 'vscode';

export interface RecentBuild {
  id: number;
  repoId: number;
  number: number;
  status: string;
  event: string;
  action: string;
  link: string;
  message: string;
  before: string;
  after: string;
  ref: string;
  sourceRepo: string;
  source: string;
  target: string;
  authorLogin: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  sender: string;
  started: number;
  finished: number;
  created: number;
  updated: number;
  version: number;
}

export interface BuildListQuickPickItem extends vscode.QuickPickItem {
  buildUrl: string;
}
