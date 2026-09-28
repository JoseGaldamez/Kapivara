## Efficiency and scope

Prefer the smallest correct change.

Do not perform broad repository-wide validation unless it is necessary
for the requested change.

After modifying code:

1. Run the narrowest relevant test first.
2. Run broader tests only if the narrow test fails or the change affects
   shared infrastructure.
3. Do not run dependency installation commands (`npm ci`, `npm install`,
   etc.) unless dependencies actually changed or are missing.
4. Do not run clean/rebuild commands unless required.
5. Do not repeatedly run the same validation after it has already passed.
6. Do not perform unrelated security, lint, race, compatibility, or
   architectural checks unless requested or directly relevant.
7. Do not create temporary files inside the repository unless strictly
   necessary.
8. Do not implement additional improvements discovered during the task.
   Report them at the end instead.
9. If validation requires installing system dependencies or substantially
   expanding the task, stop and report it instead of doing it automatically.

For small fixes, prefer:
inspect -> edit -> targeted validation -> report.

Do not turn a localized task into a repository-wide refactor or audit.

## Validation budget

For a localized change, use at most 2 validation commands by default.

Additional validation commands require a concrete reason caused by the
change being made.

Passing validation must not trigger additional exploratory validation.