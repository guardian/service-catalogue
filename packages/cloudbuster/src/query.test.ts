import type { AwsCloudFormationStack } from "common/types";
import { stackToUpdateTime, tagFilter } from "./query";

const creationTime = new Date("2023-01-01T00:00:00Z");

function createMockStack(
    tags: Record<string, string>,
    last_updated_time?: Date,
): AwsCloudFormationStack {
    return {
        stack_name: "mock-stack",
        tags,
        creation_time: creationTime,
        last_updated_time: last_updated_time ?? null,
        account_id: "123456789012",
        region: "us-east-1",
    };
}

describe("tagFilter", () => {
    it("returns true when Stack, Stage, and App tags are present and truthy", () => {
        const stack: AwsCloudFormationStack = createMockStack({
            Stack: "stack1", Stage: "prod", App: "myapp"
        });
        expect(tagFilter(stack)).toBe(true);
    });

    it("returns false when Stack tag is missing", () => {
        const stack: AwsCloudFormationStack = createMockStack({
            Stage: "prod", App: "myapp"
        });
        expect(tagFilter(stack)).toBe(false);
    });

    it("returns false when Stage tag is missing", () => {
        const stack = createMockStack({
            Stack: "stack1", App: "myapp"
        });
        expect(tagFilter(stack)).toBe(false);
    });

    it("returns false when App tag is missing", () => {
        const stack = createMockStack({
            Stack: "stack1", Stage: "prod"
        });
        expect(tagFilter(stack)).toBe(false);
    });

    it("returns false when tags object is empty", () => {
        const stack = createMockStack({});
        expect(tagFilter(stack)).toBe(false);
    });
});

const lastUpdated = new Date("2024-05-01T12:00:00Z");

it("adds a new key with last_updated_time if not present", () => {

    const stack = createMockStack(
        { Stack: "stack1", Stage: "prod", App: "myapp" },
        lastUpdated,
    );

    const map = new Map<string, Date>();
    stackToUpdateTime(stack, map);
    const key = "stack1-prod-myapp";
    expect(map.has(key)).toBe(true);
    expect(map.get(key)).toBe(lastUpdated);
});

it("adds a new key with creation_time if last_updated_time is undefined", () => {
    const stack = createMockStack(
        { Stack: "stack2", Stage: "dev", App: "anotherapp" },
    );
    const map = new Map<string, Date>();
    stackToUpdateTime(stack, map);
    const key = "stack2-dev-anotherapp";
    expect(map.has(key)).toBe(true);
    expect(map.get(key)).toBe(creationTime);
});

it("does not overwrite an existing key", () => {
    const key = "stack3-test-app";
    const map = new Map<string, Date>();
    const date1 = new Date("2025-01-01T00:00:00Z");
    const date2 = new Date("2025-02-01T00:00:00Z");

    const stack1 = createMockStack(
        { Stack: "stack3", Stage: "test", App: "app" },
        date1,
    );
    const stack2 = {
        ...stack1,
        last_updated_time: date2,
    }

    stackToUpdateTime(stack1, map);
    stackToUpdateTime(stack2, map);
    expect(map.get(key)).toBe(date1);
});
