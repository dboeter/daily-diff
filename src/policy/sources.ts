/**
 * The Policy Watch sources that are not RSS feeds (RSS feeds are config-driven:
 * config.yml `policy.feeds`). Adding a source = one module exporting a
 * `PolicySource["fetch"]`, one line in POLICY_SOURCES, and its config. The one
 * exception, Hacker News (`policy/hn.ts`), reads the run's shared HN fetch and
 * is added in `fetchAllData`.
 */

import type { PolicyConfig } from "../core/config.ts";
import type { PolicyItem, PolicyState } from "./policy.ts";
import { fetchEurLex } from "./eurlex.ts";
import { fetchEuroparl } from "./europarl.ts";
import { fetchNlParliament } from "./nl.ts";
import { fetchHaveYourSay } from "./haveyoursay.ts";
import { fetchOpenStates } from "./openstates.ts";
import { fetchUsRules } from "./usrules.ts";
import { fetchCongress } from "./congress.ts";
import { fetchInternetConsultatie } from "./internetconsultatie.ts";

export interface PolicySourceContext {
  config: PolicyConfig;
  now: Date;
  /** The CST date of the run (the digest folder). */
  dateStr: string;
  /** The saved state; null on a first run or a malformed file. */
  state: PolicyState | null;
}

export interface PolicySource {
  /** For the log. */
  name: string;
  /**
   * Every current item, new or not: fetchPolicyData drops what the state has
   * seen. Throws on failure; the run then counts the source as failed.
   */
  fetch: (ctx: PolicySourceContext) => Promise<PolicyItem[]>;
}

export const POLICY_SOURCES: PolicySource[] = [
  { name: "EUR-Lex", fetch: fetchEurLex },
  { name: "European Parliament", fetch: fetchEuroparl },
  { name: "Tweede Kamer", fetch: fetchNlParliament },
  { name: "Have your say", fetch: fetchHaveYourSay },
  { name: "Federal Register + Regulations.gov", fetch: fetchUsRules },
  { name: "Congress.gov", fetch: fetchCongress },
  { name: "Open States", fetch: fetchOpenStates },
  { name: "Internetconsultatie", fetch: fetchInternetConsultatie },
];
