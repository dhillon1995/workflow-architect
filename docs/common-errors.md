# Common n8n Workflow Errors — Debug Mode Reference

Each entry documents a real error category, typical error message patterns, root cause, and how the debugger diagnoses and fixes it.

---

## 1. Missing / Unconfigured Credentials (`auth`)

**Typical error:**
```
NodeApiError: Credentials not found
Node "X" — The credential "Y" required by this node is not configured.
```

**Root cause:** The node has a `credentials` block referencing a credential that doesn't exist in the target n8n instance, or the `credentials` block is missing entirely.

**Debugger approach:** Detect `credentials not found` in the error. Check whether the failing node has a `credentials` field. If missing, add a placeholder reference and note that the user must configure it in n8n settings. If present, verify the credential type matches what the catalog specifies.

**Fix pattern:** Add or correct the `credentials` block: `{ "<credentialType>": { "id": "<placeholder>", "name": "<descriptive name>" } }`

---

## 2. Expression Evaluation Error (`expression`)

**Typical error:**
```
ExpressionError: Cannot read properties of undefined (reading 'fieldName')
Expression "={{ $json.foo.bar }}" returned undefined
```

**Root cause:** A typo in a field name, referencing a key that doesn't exist in the upstream data, or accessing a nested property on `undefined`.

**Debugger approach:** Extract the expression from the error. Compare the referenced field path against the actual fields available in the node's input data (from the workflow context or error detail). Suggest the corrected field name.

**Fix pattern:** Correct the expression path (e.g. `$json.recipient` not `$json.recipent`). Add optional chaining where appropriate: `$json.body?.email ?? ''`.

---

## 3. Node Version Mismatch (`version`)

**Typical error:**
```
NodeOperationError: The operation "X" does not exist on resource "Y"
Note: typeVersion N uses a different parameter schema than version M.x
```

**Root cause:** The workflow was created with an old n8n version. Node parameter schemas change between major `typeVersion` numbers.

**Debugger approach:** Identify the node's current `typeVersion`. Look up the correct `typeVersion` from the catalog. Rewrite the `parameters` block using the correct schema for the new version.

**Fix pattern:** Update `typeVersion` to the catalog value and rewrite affected parameters accordingly.

---

## 4. Missing Required Parameter (`params`)

**Typical error:**
```
NodeOperationError: Property "X" is required for operation "Y" on resource "Z"
```

**Root cause:** A required field (as defined by the n8n node's schema) was not provided in `parameters`.

**Debugger approach:** Extract the missing parameter name from the error. Check the catalog's `requiredParameters` for that node type. Add the missing parameter with a sensible placeholder or expression.

**Fix pattern:** Add `"<paramName>": "<value or expression>"` to the node's `parameters` object.

---

## 5. Connection Name Mismatch (`connection`)

**Typical error:**
```
NodeNotFoundError: Connection references node "X" but no node with that name exists.
Existing node names: [...]
```

**Root cause:** The `connections` object is keyed by node `name`, not `id`. If a node was renamed after connections were defined, the key becomes stale.

**Debugger approach:** Compare all connection keys to the list of actual node `name` fields. Find the mismatch. Rename the connection key to match the correct node name.

**Fix pattern:** In the `connections` object, rename the stale key to match the exact `name` value of the source node.

---

## 6. Wrong Connection Output Index (`connection`)

**Typical error:**
```
NodeOperationError: No data was returned from node "X" output index 1
```

**Root cause:** A connection targets output index 1 (the "false" branch of an IF, or a non-existent output) when the upstream node only has one output, or when the logic branches incorrectly.

**Debugger approach:** Find the connection with `index: 1`. Verify whether the source node type produces multiple outputs (IF/Switch do; most others don't). Suggest correcting the index or re-routing.

**Fix pattern:** Correct the `index` value or add a second connection array for the appropriate branch.

---

## 7. Webhook Path Collision (`params`)

**Typical error:**
```
WebhookPathAlreadyInUseError: A webhook with path "my-path" already exists.
Only one active webhook per path is allowed.
```

**Root cause:** Two active workflows share the same webhook path, or the workflow was previously activated and the webhook registration was not cleaned up.

**Debugger approach:** Suggest changing the `path` parameter to a unique value. Note that `active: true` workflows register webhooks on n8n startup.

**Fix pattern:** Change `parameters.path` to a unique string, e.g. append a short hash.

---

## 8. IF Node — No Items Passing (`logic`)

**Typical error:**
```
No data was returned for node "X". 
The branch condition may never be true with the current data.
```

**Root cause:** The condition in an IF or Switch node is logically incorrect — always evaluates to false for the actual input data.

**Debugger approach:** Examine the condition's `leftValue` expression and `rightValue`. Check for type mismatches (number vs string comparison), wrong operator, or incorrect field reference.

**Fix pattern:** Correct the operator (e.g. `equals` → `contains`), fix the expression, or add a type cast.

---

## 9. Timeout / Execution Limit Exceeded (`timeout`)

**Typical error:**
```
WorkflowExecutionTimeoutError: Workflow execution timed out after 300 seconds.
```

**Root cause:** A long-running operation (large HTTP response, large batch, loop with many iterations) exceeded the instance's execution timeout.

**Debugger approach:** Identify the likely slow node (HTTP Request, Loop, Code). Suggest adding pagination, reducing batch size, or configuring `settings.executionTimeout` if the user controls the n8n instance.

**Fix pattern:** Add `settings.executionTimeout: 600` (if applicable), or break large operations into smaller batches using the Split In Batches node.

---

## 10. Credential Type Wrong for Node (`auth`)

**Typical error:**
```
NodeApiError: Credential type "slackOAuth2Api" is not supported by this node version.
Supported type: "slackApi"
```

**Root cause:** The credential type string in the `credentials` block doesn't match what the node version expects. This happens when upgrading node versions (e.g. Slack v1 used `slackApi`, v2 added OAuth2 support with `slackOAuth2Api`).

**Debugger approach:** Look up the correct `credentialsType` from the catalog for the node's `typeVersion`. Update the credentials block key.

**Fix pattern:** Replace the credential type key with the one specified in the catalog for that `typeVersion`.
