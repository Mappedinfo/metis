# Parallel production

[Chinese authored source](parallel-production.zh.md). This translation shares its
method, boundaries and checks. Maintain the public rules here as one guide pair;
`project-plan` and host routers reference it only when applicable.

## Applicability and initial assessment

Before heterogeneous batch processing or producing several artifacts, assess
whether the work has independently deliverable, verifiable and rerunnable units.
Group by actual format, handler, module or source, rather than file count. Inspect
authorized representative samples, confirm the differences and freeze handling
rules; unknown types need bounded inspection rather than worker guesses. With an
accepted plan, add execution partitions without reopening settled goals. Small,
single or tightly coupled work can stay with one agent. Without agent capacity,
keep the unit boundaries and execute serially.

This guide organizes production; it grants no permission to spawn agents, acquire
new sources, write, publish or create a scheduler. Audit and repair retain the
router's map–freeze–reduce budget; production retries do not extend review rounds.

## Six production constraints

1. **Independent artifacts.** Each unit has a stable ID, authorized inputs,
   dependencies, its own candidate output, acceptance and minimum unblock
   condition. Identification, computation, rendering and integration can be
   separate stages; accept a representative output before expanding its type.
   A shared physical source should have one reading stage providing reusable
   normalized results. Preserve versions and filters while avoiding repeated
   reads and double counting. Work without independent acceptance belongs in a
   common prerequisite or with the coordinator.
2. **Shared contract.** Freeze the smallest common interface before production:
   fields/structure, observation units, identifiers and join keys, required
   semantics, applicable CRS/units/time definitions, missing and invalid values,
   provenance, versioning, output names and acceptance. Type handlers implement
   this interface while retaining their specific fields; integration cannot
   erase meaningful differences. One owner maintains shared processing logic;
   units supply adapters and contract tests for verified integration. Assess
   impact and version changes to the contract before workers resume; workers
   must not independently rewrite the common interface.
3. **Write boundaries.** Each writer exclusively owns explicit files or candidate
   directories. One owner updates shared indexes, manifests, common code and the
   production switch serially. Check actual paths, link targets and shared caches;
   different path names do not establish independence. Queue overlapping units
   and their dependents; unrelated independent units may continue. Preserve
   existing edits and running jobs; validate in isolation before integrating.
4. **Resource budget.** Check agent context and computation capacity separately:
   current tools, session permission for subagents, observed spare agent slots,
   memory, CPU, disk, I/O and remote connection limits. Agent count is not heavy
   process count. Inspection and lightweight adapters can run concurrently while
   heavy jobs obey verified limits. State per-unit time, retry, read/output bounds
   and total concurrency without a universal agent count. Unknown capacity calls
   for a small measurement or serial execution; tool visibility and theoretical
   limits do not prove spare capacity.
5. **Failure isolation.** Record failures by path, format, fields, semantics,
   joins, resources or another actual cause. Pause the failed unit and dependents;
   retain accepted independent results. Inspect a bounded failed sample, repair
   its type handler and regression checks, then retry within the existing budget.
   Exhaustion records the specific blocker and minimum unblock condition. Never
   silently drop failed units or count placeholders as completed outputs; final
   reconciliation accounts for all accepted coverage.
6. **Incremental reruns.** Record stage fingerprints and acceptance evidence for
   source content, filters, contract, configuration, handlers and shared
   dependencies. Reuse only matching results whose acceptance remains valid.
   Invalidate from the earliest affected stage and rerun that unit's dependency
   closure, preserving unaffected results. A rendering change may reuse valid
   reads/computation. Shared interfaces or dependencies can invalidate every
   related unit; narrowing fingerprints cannot excuse a required rebuild. Cache
   records do not automatically verify sources, and integrity checks stay enabled.

## Unit table before allocation

The coordinator records the shared contract's version and location, then fills
in each unit's packet:

| Item | Required content |
| --- | --- |
| Unit and dependencies | Stable ID, handler type, prerequisites and current input evidence |
| Output and writes | Candidate output, exclusive paths and one owner for shared files |
| Budget and acceptance | Observed capacity, unit limits, artifact and integration checks |
| Recovery | Stage fingerprints, failure class, reusable checkpoint and affected rerun scope |

Check contract, write boundaries and capacity before allocating independent
units. A completed worker establishes its report status only. The coordinator
inspects actual outputs, conflicts, provenance and full coverage, then updates
the shared manifest. A failed candidate leaves the valid current batch intact.
A completed plan does not prove production or runtime loading of this guide.

## Example of affected scope

An authorized batch contains boundary vectors and count tables. Confirm geometry
or observation units and the shared provenance/output contract; two handlers
write separate candidate directories while the coordinator updates the manifest.
A table encoding failure invalidates that table's reading and downstream outputs
after its handler is repaired; accepted boundary results remain valid. A changed
shared join-key rule requires revalidation of both types that depend on it. A
session forbidding subagents executes the same unit table serially; the table
cannot override the session restriction.
