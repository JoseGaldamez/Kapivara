---
name: pragmatic-implementation
description: Use whenever modifying, fixing, refactoring, securing, testing, or maintaining an existing codebase. Keep implementation focused on the requested outcome: reason as deeply as needed, make all changes genuinely required for correctness, validate them appropriately, avoid unnecessary artifacts and unrelated scope, and report optional improvements separately instead of implementing them without being asked.
---

# Pragmatic Implementation

Complete the user's requested coding task thoroughly without turning it into a larger project than necessary.

## Guiding principle

**Do everything necessary to complete the requested task correctly, and avoid work that is not necessary to complete it.**

This skill does **not** limit reasoning depth. Think, inspect, debug, trace, compare alternatives, and validate as much as needed to reach a reliable result.

The constraint is on unnecessary implementation work and unnecessary repository changes, not on thinking.

## Scope

Before making changes, establish the requested outcome and keep it as the acceptance target.

Changes are in scope when they are reasonably necessary to:

- implement the requested behavior;
- fix the reported defect or vulnerability;
- preserve correctness and compatibility;
- update directly affected tests, configuration, types, interfaces, or documentation;
- validate that the implementation actually works.

Do not avoid a necessary change merely because it touches several files or requires substantial work. There is no arbitrary file-count or diff-size limit.

However, every material change should have a clear connection to the requested outcome.

## Required work vs. optional improvements

Distinguish between:

1. **Required work** — necessary for the requested task to be correct, safe, buildable, testable, or internally consistent.
2. **Optional improvements** — useful cleanup, hardening, refactoring, modernization, optimization, architectural improvement, or related work that is not required for the requested task.

Implement required work.

Do **not** automatically implement optional improvements.

If optional improvements are worth mentioning, list them briefly at the end so the user can decide whether to request them separately.

## Prefer direct changes

Prefer modifying the existing implementation and following the project's established patterns.

Do not create new abstractions, wrappers, services, interfaces, packages, layers, frameworks, configuration mechanisms, or dependencies unless they provide a concrete benefit required by the task.

Do not redesign a subsystem merely because a cleaner architecture is possible.

Do not perform opportunistic cleanup in unrelated code.

## Repository hygiene

Do not create files merely to organize your own reasoning.

Avoid unnecessary:

- planning documents;
- scratch Markdown files;
- TODO files;
- implementation journals;
- intermediate reports;
- backup copies;
- copied source files;
- temporary JSON or text files;
- patch-staging files;
- one-off helper scripts;
- debug artifacts.

Keep analysis and planning in the agent context unless the user explicitly asks for an artifact.

If a tool genuinely requires a temporary file, prefer the operating system's temporary directory when practical and remove the file after use. Do not leave temporary artifacts in the repository.

Creating a real source file, test file, migration, configuration file, fixture, or other project artifact is appropriate when the implementation genuinely requires it.

## Investigation

Inspect enough of the codebase to understand the relevant behavior and its dependencies.

Prefer focused discovery:

- search for relevant symbols and call sites;
- inspect directly related files;
- follow the actual execution path;
- inspect related tests and configuration when useful.

Expand the investigation when evidence shows it is necessary.

Do not scan or analyze unrelated parts of the repository merely for completeness.

## Security fixes

For security work:

- understand the vulnerable behavior and its reachable path;
- fix the underlying issue rather than only hiding a symptom;
- make all consequential changes needed for the fix to be effective;
- preserve intended behavior where possible;
- validate the affected security boundary or behavior;
- update affected tests or configuration when appropriate.

Do not interpret a targeted security-fix request as permission for unrelated repository-wide hardening.

If additional security improvements are discovered but are not required for the requested fix, report them separately as recommendations.

## Refactoring

Refactor when the requested change genuinely requires it or when a small local refactor materially reduces risk or duplication in the changed path.

Do not use the task as an opportunity for unrelated modernization, folder reorganization, naming cleanup, style changes, framework replacement, or architecture redesign.

## Dependencies

Add, remove, or upgrade dependencies when required to solve the task correctly.

Prefer existing project capabilities and standard libraries when they are adequate.

Do not upgrade unrelated dependencies or replace working libraries merely because newer or preferred alternatives exist.

For dependency vulnerabilities, prefer the narrowest compatible change that actually resolves the affected issue, unless broader changes are technically required.

## Validation

Validation is part of implementation, not optional overhead.

Run the checks needed to establish reasonable confidence in the change. Depending on the task, this may include:

- targeted unit or integration tests;
- affected package tests;
- type checking;
- linting;
- compilation;
- application build;
- security-specific verification;
- broader tests when the change has broad impact.

Use judgment rather than minimizing validation for its own sake.

Start with focused checks when they provide useful feedback, then broaden validation when warranted by the impact or uncertainty of the change.

Do not repeatedly run expensive commands without a reason or create elaborate testing infrastructure solely to prove a small change.

If validation reveals a failure caused by the implementation, fix it.

If validation cannot be completed, state exactly what remains unverified.

## Stay outcome-oriented

During implementation, periodically compare the work against the original acceptance target.

Do not confuse activity with progress.

Do not continue adding changes after the requested outcome is implemented and sufficiently validated merely because more improvements are possible.

If the solution becomes substantially broader than initially expected, reassess whether each additional change is truly required.

If the broader work is required, continue and complete it.

If it is merely beneficial, stop and recommend it instead.

## Context and token discipline

Treat context, tool calls, and compute as resources to spend where they improve the result.

Do not reduce useful reasoning just to save tokens.

Instead, avoid waste such as:

- repeatedly rereading unchanged files;
- rerunning identical checks without new information;
- generating verbose intermediate reports;
- producing artifacts solely for internal bookkeeping;
- exploring unrelated code paths after the requested issue is understood;
- implementing speculative improvements.

Prioritize reaching a correct, validated implementation.

## Final response

After completing the task, give a concise summary covering:

- what was changed;
- important validation performed;
- anything directly relevant that could not be verified.

If useful optional work was discovered, add a short **Recommendations** section.

Recommendations are not part of the completed implementation unless the user explicitly requested them.

Do not present optional recommendations as unfinished required work.

## Definition of done

The task is complete when:

- the requested outcome is implemented;
- all necessary related changes have been made;
- relevant validation has been performed to a reasonable level;
- failures introduced by the change have been addressed;
- unnecessary artifacts and unrelated modifications were not added;
- optional improvements have been left as recommendations rather than silently expanding scope.
