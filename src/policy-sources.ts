/**
 * The Policy Watch sources that are not RSS feeds (RSS feeds are config-driven:
 * config.yml `policy.feeds`). Adding a source = one module exporting a
 * `PolicySource["fetch"]`, one line in POLICY_SOURCES, and its config.
 */

import type { PolicyConfig } from "./config.ts";
import type { PolicyItem, PolicyState } from "./policy.ts";

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

export const POLICY_SOURCES: PolicySource[] = [];
