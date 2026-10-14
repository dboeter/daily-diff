# Netherlands: Tweede Kamer and KOOP

Status: needs-triage
Blocked by: 04

## Scope

- Tweede Kamer OData v4 (`gegevensmagazijn.tweedekamer.nl/OData/v4/2.0`): motions, government letters and written questions by title/`Onderwerp` keyword (`AI`, `kunstmatige intelligentie`, `algoritm`, `AI-verordening`), changed since the last run (`ApiGewijzigdOp`), then Jev.
- Bills only via the dossier-number watchlist (keywords miss them: implementation acts are named after the EU regulation). Store the latest `Besluit.BesluitSoort` per dossier; report from "Stemmen - aangenomen" onward. Seed: 36875 (CRA implementation act).
- KOOP SRU per watchlisted dossier, diffed on `dt.available`: `kst-<nr>-A` = in the Eerste Kamer, `stb-` = enacted.
- Dutch titles; the LLM summarizes in English. Section heading "Netherlands", after EU.

## Done when

A live run shows dossier 36875's current stage once and not again the next day; tests for the stage mapping and the keyword filter.
