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
   **Self-imposed caps are open to measurement and revision.** An existing
   concurrency or resource limit is a historical setting, not a standing
   constraint. When a user questions throughput, queueing time, or why something
   is taking so long, measure current CPU, memory, disk and I/O first, then raise
   the cap to what that measurement supports within the same reply and state the
   basis, without re-requesting authorization. Step down only when the
   measurement shows the work would crowd other people or shared resources.
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

## Continuous production and result browsing (conditional)

When users need to inspect results during production, treat continued access to
published results as a separate deliverable. This also applies to a single long
job; it does not require heterogeneity, multiple agents or batch production.
Establish a browsable representative result, then expose further units as
background production proceeds. Preserve final coverage and acceptance; partial
display is not full completion. Without this use case, do not add a workbench or
an update channel.

- **Separate production, publication and reading.** Producers write candidates;
  publication checks that unit's structure, resource completeness and version
  consistency before switching its entry; read-only APIs and the frontend consume
  published versions. In-progress files, generator code and job locks must not be
  display dependencies. Reuse existing mechanisms; logical separation requires
  no new framework, queue, service or scheduler. Distinguish basic preview checks
  from independent scientific/source acceptance.
- **Light catalogue and unit entries.** The catalogue keeps the complete expected
  set, small summaries, states and unit references. A unit entry contains its
  current revision, layer/metric/time choices and resource references. Read large
  evidence, geometry, values and member lists on demand, in shards or pages;
  reference shared evidence by stable ID and hash. Neither the homepage nor a unit
  request may require loading all details, checking every artifact or full-batch
  acceptance. A large object or invalid unit affects only related requests;
  complete evidence remains traceable and failed units remain in coverage.
- **Independent publication and compatibility.** Each unit has a stable ID,
  a consistent result revision and resource manifest. Check the complete new unit
  before atomically switching its entry; a failure retains a still-valid previous
  version. Producer code changes must not directly replace the serving reader or
  globally invalidate published results. For incompatible API/data contracts,
  retain the serving contract while checking the new reader and frontend in a
  candidate environment, then switch. Invalidate only affected dependencies.
  Withdraw or explicitly flag old results disproved by evidence; fallback must
  not continue to call them valid.
- **Lightweight update discovery.** Choose revision-summary polling or an
  existing push channel from actual latency and scale needs. Notify only changed
  unit IDs, revisions and states; refresh affected content without repeatedly
  scanning full evidence. Revision checks recover lost or duplicate notifications.
  Do not impose a universal polling interval or reset filters, selection, zoom or
  keyboard focus on updates. Respect local cache budgets, counting old versions,
  candidates and transfer staging together.
- **Browsing during failure.** Paused producers, failed units and failed refreshes
  leave still-valid published results and already loaded/cached content available,
  with revision, update time and new-job state shown. Uncached content cannot be
  invented offline: show temporary unavailability without clearing unrelated
  results or interpreting an error as unknown geography. Cross-unit synthesis
  waits only for its actual dependencies, retaining a labelled previous valid
  revision while independent units continue to become available.

For frontend changes, use the [router's frontend acceptance mode](../SKILL.md#4-anchor-every-phase-to-an-artifact): related code checks are the default, and UI/browser acceptance requires an explicit user request. The scenarios below define behavior to preserve and assess with relevant existing lightweight code/service checks; they do not mandate browser walkthroughs. Report interface behavior as unverified when it was not exercised. Scientific and data-integrity checks retain their own requirements.

When first establishing or materially changing continuous browsing, cover access to old results while a producer runs
or pauses, a new unit appearing incrementally, one corrupt unit without blocking
others, refresh failure preserving valid content/user state, and an incompatible
candidate failing to replace the serving contract. Check consequential recovery
and record which paths ran versus remained planned or simulated. Separate code
directories, existing files and successful builds do not prove continued access.
For a small change to an established path, reuse still-valid contracts/evidence
and recheck affected paths only; old checks cannot prove a changed path.

## Unit table before allocation

The coordinator records the shared contract's version and location, then fills
in each unit's packet:

| Item | Required content |
| --- | --- |
| Unit and dependencies | Stable ID, handler type, prerequisites and current input evidence |
| Output and writes | Candidate output, exclusive paths and one owner for shared files |
| Budget and acceptance | Observed capacity, unit limits, artifact and integration checks |
| Recovery | Stage fingerprints, failure class, reusable checkpoint and affected rerun scope |

When continuous browsing applies, also record the published revision/read entry,
light update channel, compatibility boundary and evidence of browsing during
failure. This deliverable does not wait for full-batch acceptance.

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
