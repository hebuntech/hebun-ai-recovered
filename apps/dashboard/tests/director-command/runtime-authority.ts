import assert from "node:assert/strict";
import { createRuntimeAuthorityRequest, RUNTIME_AUTHORITY_STATUSES, validateRuntimeAuthorityRequest } from "../../src/features/director-command";

const metadata = { requestTags: ["runtime", "declarative"] };
const request = createRuntimeAuthorityRequest({ requestId: "authority-4d1", subject: Object.freeze({ subjectId: "director-1", subjectType: "director" as const, tenantScope: "tenant-a", executable: false as const, authoritative: false as const }), resource: Object.freeze({ resourceId: "agent-1", resourceType: "agent" as const, tenantScope: "tenant-a", executable: false as const, authoritative: false as const }), action: Object.freeze({ actionId: "agent.restart", actionType: "lifecycle", executable: false as const, authoritative: false as const }), context: Object.freeze({ correlationId: "correlation-4d1", timestamp: "2026-07-23T12:00:00.000Z", metadata, executable: false as const, authoritative: false as const }), executable: false, authoritative: false });
assert.equal(Object.isFrozen(request), true); assert.equal(Object.isFrozen(request.context.metadata), true); assert.notEqual(request.context.metadata, metadata); assert.equal(validateRuntimeAuthorityRequest(request).decision.status, "requested"); assert.equal(JSON.parse(JSON.stringify(request)).executable, false);
assert.deepEqual(RUNTIME_AUTHORITY_STATUSES, ["requested", "evaluating", "approval_required", "denied", "invalid"]);
assert.equal(validateRuntimeAuthorityRequest(createRuntimeAuthorityRequest({ ...request, resource: { ...request.resource, tenantScope: "tenant-b" } })).decision.status, "invalid");
assert.throws(() => createRuntimeAuthorityRequest({ ...request, context: { ...request.context, metadata: { callback: () => undefined } } } as never));
assert.throws(() => createRuntimeAuthorityRequest({ ...request, context: { ...request.context, metadata: { promise: Promise.resolve() } } } as never));
assert.throws(() => createRuntimeAuthorityRequest({ ...request, context: { ...request.context, metadata: { token: Symbol("x") } } } as never));
assert.throws(() => createRuntimeAuthorityRequest({ ...request, action: { ...request.action, executable: true } } as never));
assert.throws(() => { (request.context.metadata.requestTags as unknown as string[]).push("mutation"); });
console.log("runtime authority checks passed");
