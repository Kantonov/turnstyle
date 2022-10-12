import { Run, OctokitGitHub, GitHub } from "./github";
import { Input, parseInput } from "./input";
import { setOutput, notice } from "@actions/core";
import * as github from "@actions/github";

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
    githubClient: GitHub,
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
      setOutput("force_continued", "1");
      return secondsSoFar || 0;
    }

    if (
      this.input.abortAfterSeconds &&
      (secondsSoFar || 0) >= this.input.abortAfterSeconds
    ) {
      this.info(`🛑Exceeded wait seconds. Aborting...`);
      setOutput("force_continued", "");
      throw new Error(`Aborted after waiting ${secondsSoFar} seconds`);
    }

    const runs = await this.githubClient.runs(
      this.input.owner,
      this.input.repo,
      this.input.sameBranchOnly ? this.input.branch : undefined,
      this.workflowId
    );

    if (this.input.cancelIfNotLatest) {
      const newerRuns = runs
        .filter((run) => run.id > this.input.runId)
        .sort((a, b) => b.id - a.id);
      if (newerRuns && newerRuns.length > 0) {
        this.info(
          `🏃Detected more up-to-date workflow in progress. Aborting...😴`
        );
        notice("⚡⚡⚡ Skipped ⚡⚡⚡");
        this.cancelWorkflow();
        return;
      }
    }

    const previousRuns = runs
      .filter((run) => run.id < this.input.runId)
      .sort((a, b) => b.id - a.id);
    if (!previousRuns || !previousRuns.length) {
      setOutput("force_continued", "");
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
    return;
  };
}
