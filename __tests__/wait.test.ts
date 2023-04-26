import * as assert from "assert";

import { Waiter } from "../src/wait";
import { Input } from "../src/input";
import { OctokitGitHub as GitHub } from "../src/github";
import { components } from "@octokit/openapi-types";

type Workflow = components["schemas"]["workflow"]

type Run = components["schemas"]["workflow-run"];

const getMockedRun = (runId:number | undefined) => {
    if (!runId) {
      runId = 1
    }
    return ({
      id: runId,
      status: "in_progress",
      html_url: "1",
      node_id: "",
      head_branch: null,
      head_sha: "shaMeSha",
      path: "",
      run_number: 0,
      event: "",
      conclusion: null,
      workflow_id: 0,
      url: "",
      pull_requests: null,
      created_at: "",
      updated_at: "",
      jobs_url: "",
      logs_url: "",
      check_suite_url: "",
      artifacts_url: "",
      cancel_url: "",
      rerun_url: "",
      workflow_url: "",
      head_commit: null,
      repository: {
        id: 0,
        node_id: "",
        name: "",
        full_name: "",
        owner: {
          name: undefined,
          email: undefined,
          login: "",
          id: 0,
          node_id: "",
          avatar_url: "",
          gravatar_id: null,
          url: "",
          html_url: "",
          followers_url: "",
          following_url: "",
          gists_url: "",
          starred_url: "",
          subscriptions_url: "",
          organizations_url: "",
          repos_url: "",
          events_url: "",
          received_events_url: "",
          type: "",
          site_admin: false,
          starred_at: undefined
        },
        private: false,
        html_url: "",
        description: null,
        fork: false,
        url: "",
        archive_url: "",
        assignees_url: "",
        blobs_url: "",
        branches_url: "",
        collaborators_url: "",
        comments_url: "",
        commits_url: "",
        compare_url: "",
        contents_url: "",
        contributors_url: "",
        deployments_url: "",
        downloads_url: "",
        events_url: "",
        forks_url: "",
        git_commits_url: "",
        git_refs_url: "",
        git_tags_url: "",
        git_url: undefined,
        issue_comment_url: "",
        issue_events_url: "",
        issues_url: "",
        keys_url: "",
        labels_url: "",
        languages_url: "",
        merges_url: "",
        milestones_url: "",
        notifications_url: "",
        pulls_url: "",
        releases_url: "",
        ssh_url: undefined,
        stargazers_url: "",
        statuses_url: "",
        subscribers_url: "",
        subscription_url: "",
        tags_url: "",
        teams_url: "",
        trees_url: "",
        clone_url: undefined,
        mirror_url: undefined,
        hooks_url: "",
        svn_url: undefined,
        homepage: undefined,
        language: undefined,
        forks_count: undefined,
        stargazers_count: undefined,
        watchers_count: undefined,
        size: undefined,
        default_branch: undefined,
        open_issues_count: undefined,
        is_template: undefined,
        topics: undefined,
        has_issues: undefined,
        has_projects: undefined,
        has_wiki: undefined,
        has_pages: undefined,
        has_downloads: undefined,
        has_discussions: undefined,
        archived: undefined,
        disabled: undefined,
        visibility: undefined,
        pushed_at: undefined,
        created_at: undefined,
        updated_at: undefined,
        permissions: undefined,
        role_name: undefined,
        temp_clone_token: undefined,
        delete_branch_on_merge: undefined,
        subscribers_count: undefined,
        network_count: undefined,
        code_of_conduct: undefined,
        license: undefined,
        forks: undefined,
        open_issues: undefined,
        watchers: undefined,
        allow_forking: undefined,
        web_commit_signoff_required: undefined,
        security_and_analysis: undefined
      },
      head_repository: {
        id: 0,
        node_id: "",
        name: "",
        full_name: "",
        owner: {
          name: undefined,
          email: undefined,
          login: "",
          id: 0,
          node_id: "",
          avatar_url: "",
          gravatar_id: null,
          url: "",
          html_url: "",
          followers_url: "",
          following_url: "",
          gists_url: "",
          starred_url: "",
          subscriptions_url: "",
          organizations_url: "",
          repos_url: "",
          events_url: "",
          received_events_url: "",
          type: "",
          site_admin: false,
          starred_at: undefined
        },
        private: false,
        html_url: "",
        description: null,
        fork: false,
        url: "",
        archive_url: "",
        assignees_url: "",
        blobs_url: "",
        branches_url: "",
        collaborators_url: "",
        comments_url: "",
        commits_url: "",
        compare_url: "",
        contents_url: "",
        contributors_url: "",
        deployments_url: "",
        downloads_url: "",
        events_url: "",
        forks_url: "",
        git_commits_url: "",
        git_refs_url: "",
        git_tags_url: "",
        git_url: undefined,
        issue_comment_url: "",
        issue_events_url: "",
        issues_url: "",
        keys_url: "",
        labels_url: "",
        languages_url: "",
        merges_url: "",
        milestones_url: "",
        notifications_url: "",
        pulls_url: "",
        releases_url: "",
        ssh_url: undefined,
        stargazers_url: "",
        statuses_url: "",
        subscribers_url: "",
        subscription_url: "",
        tags_url: "",
        teams_url: "",
        trees_url: "",
        clone_url: undefined,
        mirror_url: undefined,
        hooks_url: "",
        svn_url: undefined,
        homepage: undefined,
        language: undefined,
        forks_count: undefined,
        stargazers_count: undefined,
        watchers_count: undefined,
        size: undefined,
        default_branch: undefined,
        open_issues_count: undefined,
        is_template: undefined,
        topics: undefined,
        has_issues: undefined,
        has_projects: undefined,
        has_wiki: undefined,
        has_pages: undefined,
        has_downloads: undefined,
        has_discussions: undefined,
        archived: undefined,
        disabled: undefined,
        visibility: undefined,
        pushed_at: undefined,
        created_at: undefined,
        updated_at: undefined,
        permissions: undefined,
        role_name: undefined,
        temp_clone_token: undefined,
        delete_branch_on_merge: undefined,
        subscribers_count: undefined,
        network_count: undefined,
        code_of_conduct: undefined,
        license: undefined,
        forks: undefined,
        open_issues: undefined,
        watchers: undefined,
        allow_forking: undefined,
        web_commit_signoff_required: undefined,
        security_and_analysis: undefined
      },
      display_title: ""
    } as Run)
  };

describe("wait", () => {
  describe("Waiter", () => {
    describe("wait", () => {
      let input: Input;
      const workflow: Workflow = {
        id: 123124,
        name: "Test workflow",
        node_id: "",
        path: "",
        state: "active",
        created_at: "",
        updated_at: "",
        url: "",
        html_url: "",
        badge_url: ""
      };

      beforeEach(() => {
        input = {
          branch: "master",
          continueAfterSeconds: undefined,
          abortAfterSeconds: undefined,
          pollIntervalSeconds: 1,
          githubToken: "fake-token",
          owner: "org",
          repo: "repo",
          runId: 2,
          workflowName: workflow.name,
          sameBranchOnly: true,
          cancelIfNotLatest: false,
        };
      });

      it("will continue after a prescribed number of seconds", async () => {
        input.continueAfterSeconds = 1;
        const inProgressRun = {
          id: 1,
          status: "in_progress",
          html_url: "",
        };
        const githubClient = ({
          runs: async (
            owner: string,
            repo: string,
            branch: string | undefined,
            workflowId: number
          ) => Promise.resolve([inProgressRun]),
          workflows: async (owner: string, repo: string) =>
            Promise.resolve([workflow]),
        } as GitHub);

        const messages: Array<string> = [];
        const waiter = new Waiter(
          workflow.id,
          githubClient,
          input,
          (message: string) => {
            messages.push(message);
          }
        );
        assert.equal(await waiter.wait(), 1);
        assert.deepEqual(messages, [
          "✋Awaiting run  ...",
          "🤙Exceeded wait seconds. Continuing...",
        ]);
      });

      it("will abort after a prescribed number of seconds", async () => {
        input.abortAfterSeconds = 1;
        const inProgressRun = {
          id: 1,
          status: "in_progress",
          html_url: "",
        };
        const githubClient = ({
          runs: async (
            owner: string,
            repo: string,
            branch: string | undefined,
            workflowId: number
          ) => Promise.resolve([inProgressRun]),
          workflows: async (owner: string, repo: string) =>
            Promise.resolve([workflow]),
        } as GitHub);

        const messages: Array<string> = [];
        const waiter = new Waiter(
          workflow.id,
          githubClient,
          input,
          (message: string) => {
            messages.push(message);
          }
        );
        await assert.rejects(waiter.wait(), {
          name: "Error",
          message: "Aborted after waiting 1 seconds",
        });
        assert.deepEqual(messages, [
          "✋Awaiting run  ...",
          "🛑Exceeded wait seconds. Aborting...",
        ]);
      });

      it("will return when a run is completed", async () => {
        const run = getMockedRun(undefined);
        const mockedRunsFunc = jest
          .fn()
          .mockReturnValueOnce(Promise.resolve([run]))
          .mockReturnValue(Promise.resolve([]));
        const githubClient = {
          runs: mockedRunsFunc,
          workflows: async (owner: string, repo: string) =>
            Promise.resolve([workflow]),
        };

        const messages: Array<string> = [];
        const waiter = new Waiter(
          workflow.id,
          githubClient,
          input,
          (message: string) => {
            messages.push(message);
          }
        );
        await waiter.wait();
        assert.deepEqual(messages, ["✋Awaiting run 1 ..."]);
      });

      it("will wait for all previous runs", async () => {
        const inProgressRuns = [
          {
            id: 1,
            status: "in_progress",
            html_url: "1",
          },
          {
            id: 2,
            status: "in_progress",
            html_url: "2",
          },
          {
            id: 3,
            status: "in_progress",
            html_url: "3",
          },
        ];
        // Give the current run an id that makes it the last in the queue.
        input.runId = inProgressRuns.length + 1;
        // Add an in-progress run to simulate a run getting queued _after_ the one we
        // are interested in.
        inProgressRuns.push({
          id: input.runId + 1,
          status: "in_progress",
          html_url: input.runId + 1 + "",
        });

        const mockedRunsFunc = jest.fn();
        mockedRunsFunc
          .mockReturnValueOnce(Promise.resolve(inProgressRuns.slice(0)))
          .mockReturnValueOnce(Promise.resolve(inProgressRuns.slice(0, 2)))
          .mockReturnValueOnce(Promise.resolve(inProgressRuns))
          // Finally return just the run that was queued _after_ the "input" run.
          .mockReturnValue(
            Promise.resolve(inProgressRuns.slice(inProgressRuns.length - 1))
          );

        const githubClient = {
          runs: mockedRunsFunc,
          run: jest.fn(),
          workflows: async (owner: string, repo: string) =>
            Promise.resolve([workflow]),
        };

        const messages: Array<string> = [];
        const waiter = new Waiter(
          workflow.id,
          githubClient,
          input,
          (message: string) => {
            messages.push(message);
          }
        );
        await waiter.wait();
        // Verify that the last message printed is that the latest previous run
        // is complete and not the oldest one.
        const latestPreviousRun = inProgressRuns[inProgressRuns.length - 1];
        assert.deepEqual(
          messages[messages.length - 1],
          `✋Awaiting run ${input.runId - 1} ...`
        );
      });
    });
  });
});
