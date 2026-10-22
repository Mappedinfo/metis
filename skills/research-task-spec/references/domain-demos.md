# Fictional domain demonstrations

These tasks demonstrate ambiguity, priorities and acceptance choices. They
contain no actual data, runs or scientific findings. Paths and thresholds are
illustrative proposals, not project facts. Read only the relevant section.

## Geography: rainfall and landslides

**Request:** “Compare two rainfall products and determine which better explains
landslides; make the result reliable.”

**Consequential ambiguity:** historical explanation or prediction of unseen
events? Event, slope unit or grid as the observation? How is accumulation
defined relative to the event time? These choices change sampling and validation;
resolve them from an existing protocol or necessary bundled questions. File
names and chart colors can follow project conventions directly.

**Independent preparation:** inventory supplied data coverage, units, missingness
and event IDs. Keep unsettled definitions explicit; do not announce a superior
product.

| Requirement | Verifiable artifact | Acceptance basis |
| --- | --- | --- |
| R1 Compare data compatibility | Coverage table and differences | Units, time definitions, spatial support and missing-data handling are traceable; incompatible portions stay explicit |
| R2 Perform the accepted comparison | Method, comparison table and uncertainty | Shared evaluation scope, baselines and sampling rules; for prediction, validation reflects intended spatial or temporal generalization |

**Check selection:** inspect CRS, spatial coverage and alignment when overlay is
involved; raster-specific checks apply to raster inputs. Verify temporal order
when rainfall precedes the event, and avoid unavailable future information in
prediction. Where dependence matters, choose appropriate validation, robustness
or uncertainty methods. Random splitting alone does not establish geographic
generalization.

**Stop:** complete the agreed comparison and report its differences. A comparison
can be complete while superiority remains uncertain.

## Urban science: green space and heat

**Request:** “Analyze urban heat and green-space configuration and show its
effect.”

**Consequential ambiguity:** descriptive association or causal effect? Land
surface temperature, air temperature or heat exposure? Which region, season and
observation unit? Do not convert “effect” into a causal claim automatically or
borrow architectural daylight/planning values as this task's thresholds.

**Example clauses:** if association analysis is accepted, R1 can require an
analysis table at the agreed spatial/temporal definition, reported associations,
uncertainty and scope. R2 can require examining sensitivity to the chosen scale
and key processing decisions, with results and methods. Variables, scales,
interval methods and coverage come from the question, accepted protocol and
available data.

**Check selection:** inspect observation units, matching, denominators and
variable definitions. Check scale sensitivity when aggregation or boundaries
could alter interpretation. Diagnose residual spatial dependence only where
the model and inferential goal warrant it. Its presence calls for reviewing
the model, uncertainty or design; it does not automatically choose a spatial
lag/error model or GWR. Causal work first needs an identification basis,
confounding treatment and supportable scope.

**Claim:** C1, “The green-space metric is associated in the agreed direction
with land surface temperature in the study region and period,” remains pending.
An unstable direction or disappearance under relevant controls/scales weakens
it. Robust association alone does not establish causation.

**Change:** a user adds policy causal-effect evaluation to an association task.
Record the source, affected R1/C1, additional identification work and resource
gaps. Existing data checks can remain valid; association evidence cannot alone
accept the new causal requirement.

## GeoAI: classification across cities

**Request:** “Train a classifier that also works across cities and improves on
the current baseline.”

**Consequential ambiguity:** completely unseen cities or limited target-city
labels? Which classes, prediction units and metrics? Does existing authorization
cover the resources and run budget? Do not derive city counts, improvement
margins, model names or seed counts from this example.

| Requirement | Tasks and evidence | Acceptance basis |
| --- | --- | --- |
| R1 Define generalization evaluation | T1 records city/time/sample splits and their manifest | Accepted deployment situation; check duplicates, overlaps and relevant spatial leakage across splits |
| R2 Compare fairly with baseline | T2 runs under agreed data, labels and resources, recording configuration and metrics | Preprocessing and model selection use permitted data; the test set retains its intended role; method and budget differences are explicit |
| R3 Deliver verifiable results | T3 delivers model, evaluation table and run records | Metrics include aggregation, denominators or weights, per-city results and appropriate uncertainty; recomputation scope and tolerance are explicit |

**Missing evidence:** without baseline run records, prepare data checks and the
evaluation pipeline while improvement remains unverified. Rerun only when needed
and authorized; remembered or simulated values are not actual baseline results.

**Stop:** a fair-comparison request can finish with no improvement. When an
accepted performance threshold is required, failure to reach it remains a failed
requirement; retain the goal and report the gap.

## Computer science: retrieval prototype and performance

**Request:** “Build a demonstrable retrieval prototype and verify the new index
is faster without losing quality.”

**Consequential ambiguity:** required user actions and inputs? Does “faster” mean
construction, throughput, single-query or a latency percentile? What metric or
functional cases define retained quality? Which data scale, hardware, concurrency
and cache conditions are fixed? Resolve meanings first. Thresholds can cite an
existing benchmark or remain explicit proposals.

**Separate acceptance:** R1 checks the full prototype user path, such as query,
results, empty states and error feedback. R2 compares the same workload under
stated measurement conditions, reports repeated-measurement variation and checks
quality by the accepted method. An operable interface supports R1, not R2.
Without spatial data, CRS, MAUP and spatial permutations are unnecessary.

**Tracking:** if the new implementation is faster only with warm caches, record
the observation conditions and result location. A claim covering cold caches
remains unverified. Retain implemented features and verified warm-cache results;
continue authorized gap checks.

**Stop:** report function and comparison separately. Additional testing beyond
accepted resources remains a proposal. Missing required cases or benchmarks
leave a named gap; more screenshots cannot replace them.

## Method provenance

These examples were written for the metis task-agreement workflow using the
architectural brief analogy of requirement expression, feedback and outcome
checking. They establish no building standard or domain-wide numerical
threshold; actual methods and acceptance follow the research question and
accepted protocol.
