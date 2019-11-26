import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { ApiClient } from '../../ApiClient';
import * as Types from '../../types';

suite('API Client Test Suite', () => {
    let apiClient: ApiClient;

    vscode.window.showInformationMessage('Start all tests.');

    apiClient = new ApiClient('http://localhost:9001', 'abc', '', 'project');

    test('Run Setup', async () => {
        await apiClient.setup();
    });

    test('Get recent builds', async () => {
        const recentBuilds: Types.RecentBuild[] = await apiClient.getRecentBuilds();

        assert.strictEqual(42, recentBuilds[0].number);
    });

    test('Get Build URL', () => {
        assert.strictEqual('http://localhost:9001/octocat/project/1', apiClient.getBuildUrl(1));
    });

    test('Retry Build', async () => {
        const build: number = await apiClient.retryBuild(42);
        assert.strictEqual(43, build);
    });
});
