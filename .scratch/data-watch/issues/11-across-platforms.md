# Across platforms

Status: resolved
Type: task
Blocked by: 08

## Evidence

The report lists each vendor's changes separately, but the useful view for a consultancy whose clients are on several platforms is the comparison. 2026-10-21 alone had: Snowflake-provided tags and the Databricks Data Classification API (governance tagging), BigQuery AI.AGG output_schema next to Snowflake AI Functions and Genie (AI in SQL), and conversational analytics on BigQuery and Genie.

## Scope

- An `## Across platforms` section after the tables, written by the prose call (no new call): 0–3 bullets, each one capability that moved on two or more platforms today or within the rows shown, saying how they differ (GA vs preview, which clouds). Only rows in the report count; no claims about features the rows do not show.
- Left out when the model finds none (the prompt must allow that explicitly; no padding).
- Docs: AGENTS.md (layout).

## Done when

- Prompt test: the section's rules are present and require two platforms per bullet.
- Report test: the section is placed after the tables and left out when absent.
- A replay of 2026-10-21's inputs, read by hand, gives at least one bullet that compares two vendors.
- All checks pass.

## Verification

Replay of 2026-10-21 (Haiku as the model): two bullets, governance tagging (Snowflake-provided tags GA vs the Databricks Data Classification API GA with auto-tagging in preview) and Iceberg tables (Databricks transactions vs Snowflake Parquet Direct preview). The first replay ended the section with a note to the editor; the section now keeps only its bullets.
