import { setFailed, info } from "@actions/core";
import { env } from "process";
import { parseInput } from "./input";
import { OctokitGitHub } from "./github";
import { Waiter } from "./wait";

async function run() {
  try {
    /**
     * Local debug setup:
      const input = {
        // implicit inputs
        githubToken: "token", // careful not to git push this
        owner: "owner-string",
        repo: "test-repo",
        workflowName: "Case Sensitive Name", // taken from the "name: ..." on top of the action.yml
        branch: "master",
        runId: 111111111111, // big number to have the action wait, meaning this one is the latest
        
        // action inputs
        pollIntervalSeconds: 5,
        continueAfterSeconds: undefined,
        abortAfterSeconds: undefined,
        sameBranchOnly: true,
        cancelIfNotLatest: false
      };
     */
    const input = parseInput(env);
    const github = new OctokitGitHub(input.githubToken);
    const workflows = await github.workflows(input.owner, input.repo);
    const workflow_id = workflows.find(
      (workflow) => workflow.name == input.workflowName
    )?.id;
    if (workflow_id) {
      await new Waiter(workflow_id, github, input, info).wait();
    }
  } catch (error) {
    let errorMessage = "Unknown exception";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    setFailed(errorMessage);
  }
}

if (require.main === module) {
  run();
}
