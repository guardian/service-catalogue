import type { PrismaClient } from ".prisma/client";
import { getStacks } from "common/src/database-queries";
import type { AwsCloudFormationStack } from "common/types";
import type { StackUpdateTimes } from "./types";

export function stackToUpdateTime(stack: AwsCloudFormationStack, stackStageAppMap: StackUpdateTimes) {
    const key = `${stack.tags.Stack}-${stack.tags.Stage}-${stack.tags.App}`;
    const lastUpdated = stack.last_updated_time ?? stack.creation_time;
    if (!stackStageAppMap.has(key)) {
        console.debug(`Adding stack to map: ${key} with last updated time: ${lastUpdated.toDateString()}`);
        stackStageAppMap.set(key, lastUpdated)
    }
}

export function tagFilter(stack: AwsCloudFormationStack): boolean {
    const hasTags = !!stack.tags.Stack && !!stack.tags.Stage && !!stack.tags.App;
    return hasTags;
}

export async function getStackUpdateTimes(prisma: PrismaClient) {
    /*
     * Findings relating to EC2 instances will reset their first_observed_at on relaunch.
     * This usually happens weekly, so we have a lot of findings that (erroneously) appear to be within SLA
     * If we can match the tags of the instance to a cloudformation stack, using the last_updated_time
     * is a better (though still imperfect) approximation of when the issue was introduced.
     *
     * Writing these to a map is more memory efficient than holding the whole table in memory,
     * and is more performant than parsing a list of all stacks each time.
     */

    const taggedStacks = (await getStacks(prisma)).filter(tagFilter);
    const stackStageAppMap: StackUpdateTimes = new Map<string, Date>();
    taggedStacks.forEach((stack) => {
        stackToUpdateTime(stack, stackStageAppMap);
    });
    console.log(`Found ${stackStageAppMap.size} stacks with stack, stage and app tags.`);
    return stackStageAppMap;
}