[中文指南](signal-guide.zh.md)

# Contextual signal guide

Use this guide to decide whether a candidate harms the text's purpose.
Read the sentence, neighboring sentences, and document role before acting.
The English and Chinese guides explain the same review framework in their
own language. Choose the guide you read independently of the language of
the manuscript; both support Chinese, English, and mixed prose.
Examples below illustrate decisions; the executable vocabulary and
thresholds are maintained only in [rules.json](../scripts/rules.json).
Tier numbers are candidate-selection settings, not severity classes.

## Match the treatment to the manuscript

Keep mode, genre, and manuscript language separate. An English paragraph
reviewed through the Chinese instructions still needs English language
checks. Genre determines whether, for example, a contrast is useful in a
spoken explanation or delays a research claim. These language checks belong
to the existing semantic pass and affected-context validation; they add no
pass, prohibited-word list, or exception to fact and quotation protection.

**English prose.** Follow pronouns and clause relationships through the
paragraph, then check where modifiers attach. A relative clause with two
plausible antecedents or a participial phrase attached to the wrong subject
may change a claim; a phrase ending in "-ing" does not by itself need revision.
Check whether tense, modal verbs, articles, number, and quantifiers preserve
the intended time, certainty, and scope. Changing "a model" to "the model"
can imply an already identified model; changing "some samples" to "the
samples" can broaden the reference. Make such changes only when the context
supports them. Keep a passive that usefully foregrounds the object or method;
name an actor or source only when it matters and is already known.

**Chinese prose.** Track the current topic, omitted subjects, and references
such as "其", "这", and "该" across nearby sentences. Retain an omitted
subject when it is recoverable; supply a known subject only where a topic
shift makes the action or responsibility unclear. A numbered item or step
can be a useful subject. Inspect verb-object relations and stacked abstract
nouns for a concealed action, and check which words a long modifier qualifies.
Sentence juxtaposition can carry a clear relationship without a connector.
Do not add "因此" merely to make that relationship explicit when the text
has not established causation.

**Mixed prose.** Apply the appropriate treatment to actual sentences or
passages while keeping one coverage record and argument map. An English term,
identifier, or acronym within a Chinese sentence does not make it an English
sentence; a standalone English sentence, abstract, or caption does need
English checks. Check claims, technical meanings, numbers, and limitations
across language boundaries without forcing matching syntax or translating
protected quotations. Do not infer the response language from the language
of this guide; follow the user's requested response language.

## Vocabulary, abstraction, and emphasis

**Process jargon.** Contract, boundary, receipt, alignment, loop, ecosystem,
and related expressions need an identifiable referent. In a plain progress
note, “closed the loop on the metrics” may conceal whether someone measured,
checked, or recorded something. Choose a replacement only after the surrounding text establishes
the actual action. A real API contract, acceptance condition, legal contract,
or scientific validity limit may be precisely the right term.

**Domain language.** Terms such as hallucination, token, prompt injection,
agent, temperature, framework, and paradigm can carry technical meaning.
Preserve them when they name the subject accurately. If the audience needs
an explanation, define the term; do not erase the concept to reduce hits.
For a nontechnical use, identify the concealed action or claim before
calling the wording jargon.

**Execution reminders in prose.** Expressions such as "do not overclaim" or
"use the true scope" may be instructions to the writer carried into a
reader-facing passage. Establish whether the requested subject is the writing process
itself. Otherwise, express the actual coverage, evidence source, date,
method or action already available, or delete an empty assurance. Preserve
"The sample comes from only three cities" and genuine uncertainty because
they affect interpretation. If detail is missing, flag that gap; never invent
scope or measurements.

**Prestige and intensity.** Words such as “pivotal”, “robust”, “holistic”,
or “transformative” require context, not automatic deletion. Ask what result,
comparison, condition, or reader decision the emphasis describes. Keep
“robust to these specified perturbations” when supported; qualify or remove
unexplained praise. An adjective's frequency does not establish a defect.

**Promotion and emotion.** Inspect “boasts”, “stunning”, “breathtaking”, and
similar framing against the genre. “Located in” can simply state a
location. A supplied personal reaction can be appropriate in a memoir;
neutral reporting may need a factual description instead. Never invent an
experience or sensory detail to make a revision sound personal.

## Sentence relationships

**Negation and contrast.** Select the genre before judging split negation
(“This is not X. This is Y.”), “not X but Y”, or repeated rejected alternatives.
In research prose and academic reviews (`academic`),
mark rhetorical framing for revision and state the object, method or result
directly: "The records contain rainfall probability." In popular science,
teaching and scripts (`explain`), inspect context; "The records contain
rainfall probability, not rainfall volume" can correct a relevant
misconception. General prose also needs context. A real method
comparison or necessary limitation must keep its information, expressed
directly when appropriate: "Our model predicts rainfall probability; the
baseline predicts rainfall volume."
Revise an unmotivated rejected alternative, false opposition or repetitive
delay. Changing punctuation alone leaves that reasoning problem intact.

**Three-part lists.** A triad is useful when its three members are distinct
and relevant, such as three specified experimental conditions. Inspect
forced symmetry, overlapping members, and unexplained extras. Do not cut a
valid item or invent a fourth to disrupt the pattern.

**Transitions and stock introductions.** A chain of “first”, “therefore”,
“in other words”, or “more importantly” is useful only if it
expresses the actual sequence or relation. Keep functional signposting.
Delete a redundant transition or correct the relation when the text does
not support it; a causal connector may expose a substantive evidence gap.

**Intensifier repetition.** Adjacent sentences repeating the same
strengthener merit attention even below a frequency threshold. Check the
claim being strengthened and whether the second sentence adds information.
Forms such as “highly + adjective” or “very + adjective”
are reading prompts, not complete grammatical definitions or defects.

**Passive openings and missing actors.** A passive can properly foreground
an object or procedure. Revise “is widely believed” when it hides
a necessary source or attribution. Supply an actor only if already known.
For a comparative construction such as “the more X, the more Y”, check whether
the relevant subjects and claimed relationship are clear and supported.

**Importance and superficial interpretation.** “Marking a pivotal moment”,
“highlighting its importance”, or “reflects” may attach a conclusion
without explaining the bridge from observation. Ask what inference the
phrase adds, what warrants it, and what changes for the reader. Preserve a
supported interpretation; remove an empty afterthought or flag the missing
reason. An English participle ending in “-ing” is not a defect by form.

## Meaning across passages

**Semantic loops.** Different words can repeat one claim, even with no
lexical repetition. Compare the propositions: do “narrow”, “small”, and
“shallow” add distinct dimensions here, or restate an unsupported judgment?
Merge only true redundancy, preserving differences in population, scale,
mechanism, or consequence. A repeated keyword can instead maintain a clear
referent. No fixed word count establishes a semantic loop.

**False ranges.** For “from X to Y”, identify the
axis or process connecting the endpoints. Dates, measured ranges, stages,
and a clearly explained transformation may be valid. Flag a range only
when the text implies continuity or progression it has not established.
Explain the missing relation; a surface match cannot decide this.

**Template endings.** A summary may help a reader use a long argument.
Check whether it supplies a decision, implication, or needed synthesis.
Cut a closing paragraph only if it repeats without serving the accepted
purpose. A conclusion heading or “in conclusion” is not sufficient evidence.

## Shape and presentation

Sentence and paragraph lengths can describe rhythm. They cannot establish
authorship or a universal ideal. Never apply a supposed AI range such as
12–18 words or a standard-deviation cutoff. Review whether a passage is
monotonous, overloaded, or difficult to follow in its language and genre;
revise only the parts responsible for that reader effect.

Title Case, bold terminology, emoji, and `**Label**: explanation` lists can
support navigation or match a house style. Inspect emphasis saturation,
inconsistent hierarchy, and audience mismatch. Technical instructions may
benefit from repeated labels. Do not globally strip formatting because it
resembles a template. The scanner covers only its documented surface forms;
manual review remains responsible for the actual structure.

## Calibration and historical context

The helper applies local rules to locate wording. It cannot determine whether
text was written by an AI system or a person. Do not
convert its counts into “AI likelihood”, invent confidence percentages, or use
colloquialness, spelling errors, emotional variability, or concrete details
as evidence of authenticity or truth.

Two historical examples explain why provenance claims require their own
evidence: OpenAI withdrew its specific classifier in July 2023 citing low
accuracy ([OpenAI notice](https://openai.com/index/new-ai-classifier-for-indicating-ai-written-text/));
Liang and colleagues reported misclassification of non-native English
writing in the detectors and samples they tested in 2023
([Patterns paper](https://doi.org/10.1016/j.patter.2023.100779)). These are
bounded findings about those systems and settings. They neither validate
this helper nor establish the performance of all present-day detectors.
