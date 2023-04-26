import { OctokitGitHub as GitHub } from "./github";
import { Input } from "./input";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { components } from "@octokit/openapi-types";

export interface Wait {
  wait(secondsSoFar?: number): Promise<number>;
}

export class Waiter implements Wait {
  private readonly info: (msg: string) => void;
  private input: Input;
  private githubClient: GitHub;
  private workflowId: any;

  constructor(
    workflowId: any,
    githubClient: GitHub | any,
    input: Input,
    info: (msg: string) => void
  ) {
    this.workflowId = workflowId;
    this.input = input;
    this.githubClient = githubClient;
    this.info = info;
  }

  wait = async (secondsSoFar?: number) => {
    if (
      this.input.continueAfterSeconds &&
      (secondsSoFar || 0) >= this.input.continueAfterSeconds
    ) {
      this.info(`🤙Exceeded wait seconds. Continuing...`);
      core.setOutput("force_continued", "1");
      return secondsSoFar || 0;
    }

    if (
      this.input.abortAfterSeconds &&
      (secondsSoFar || 0) >= this.input.abortAfterSeconds
    ) {
      this.info(`🛑Exceeded wait seconds. Aborting...`);
      core.setOutput("force_continued", "");
      throw new Error(`Aborted after waiting ${secondsSoFar} seconds`);
    }

    const runsData = await this.githubClient.runs(
      this.input.owner,
      this.input.repo,
      this.input.sameBranchOnly ? this.input.branch : undefined,
      this.workflowId
    );

    type GitHubWorkflowRun = components["schemas"]["workflow-run"];
    const runs: GitHubWorkflowRun[] = runsData as GitHubWorkflowRun[];

    if (this.input.cancelIfNotLatest) {
      const newerRuns = runs
        .filter((run) => run.id > this.input.runId)
        .sort((a, b) => b.id - a.id);
      if (newerRuns && newerRuns.length > 0) {
        this.info(
          `🏃Detected more up-to-date workflow in progress. Canceling...😴`
        );
        core.notice("⚡⚡⚡ Skipped ⚡⚡⚡");
        this.cancelWorkflow();
        return;
      }
    }
    
    const previousRuns = runs
      .filter((run) => run.id < this.input.runId)
      .sort((a, b) => b.id - a.id);
    if (!previousRuns || !previousRuns.length) {
      core.setOutput("force_continued", "");
      return;
    }

    const previousRun = previousRuns[0];
    this.info(`✋Awaiting run ${previousRun.html_url} ...`);
    await new Promise((resolve) =>
      setTimeout(resolve, this.input.pollIntervalSeconds * 1000)
    );
    return this.wait((secondsSoFar || 0) + this.input.pollIntervalSeconds);
  };

  cancelWorkflow = async () => {
    const octokit = github.getOctokit(this.input.githubToken);
    const owner = this.input.owner;
    const repo = this.input.repo;
    const id = this.input.runId;
    const res = await octokit.rest.actions.cancelWorkflowRun({
      owner,
      repo,
      run_id: id,
    });
    if (res.status != 202) {
      throw new Error(
        `Error canceling workflow, status: ${res.status}, response: ${res.data}`
      );
    }

    // force the cancellation to happen on this action
    const twoMinutes = 120 * 1000;
    await new Promise(() =>
      setTimeout(() => {
        throw new Error(
          `Workflow still not canceled after two minutes, but the response was success. Check API status: githubstatus.com.`
        );
      }, twoMinutes)
    );
    return;
  };
}
