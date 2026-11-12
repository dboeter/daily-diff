"""Security-section spike: ask Jev about a week of stories and release-note lines.

    python3 .scratch/security-section/spike/replay.py stories|lines|pilot

Reads TYPESAFE_API_KEY from the repo's .env. Writes results-<set>.json next to this
file, one entry per item id, and skips ids already answered, so a rerun only asks
what failed. Nothing is written under digests/.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
URL = "https://api.typesafe.ai/v1/systemone"

SCOPE = (
    "an AI tool, an AI model provider or AI service, or a data platform or data tool"
)

STORY_QUESTIONS = {
    "is_security": {
        "type": "noul",
        "instructions": (
            "Does the story described by `title` (and `description` when present), linked from `site`, "
            f"report a specific security or privacy event that concerns {SCOPE}?"
        ),
        "criteria": {
            "true": (
                "It reports a breach, hack, leak or exposure of data, secrets or personal data; a malicious "
                "or compromised package or extension; a concrete vulnerability or exploit in a named product; "
                "or a patch, postmortem or vendor statement about such an event"
            ),
            "false": (
                "Anything else: a research paper or general essay on a class of attack; a new security tool, "
                "scanner or sandbox; AI safety, misuse, moderation, policy or law; security news about "
                "something that is not AI or data tooling; an ordinary bug, outage, release or opinion"
            ),
        },
    },
    "kind": {
        "type": "choice",
        "instructions": "What kind of story is described by `title` (and `description` when present)?",
        "criteria": {
            "incident": {
                "what": "A security or privacy incident that happened in a named product or service",
                "examples": [
                    "a provider was hacked and customer data exposed",
                    "a malicious extension was published under a tool's name",
                    "a tool sent users' personal data to third parties",
                ],
            },
            "vulnerability": {
                "what": "A concrete flaw or exploit in a named product, with no breach reported",
                "examples": [
                    "a prompt injection that makes a named agent leak tokens",
                    "a sandbox escape in a named tool",
                ],
            },
            "fix": {
                "what": "A patch, postmortem, vendor statement or remediation guide for an incident or vulnerability",
                "examples": [
                    "a postmortem on a compromised extension",
                    "a release that closes a reported leak",
                ],
            },
            "none": {
                "what": "Not a specific security or privacy event in a named product",
                "examples": [
                    "a model release",
                    "a research paper on attacks",
                    "a new security scanner",
                    "an essay on AI safety",
                    "a policy story",
                ],
            },
        },
    },
    "severity": {
        "type": "score",
        "instructions": (
            "Suppose the story described by `title` and `description` is a security or privacy event. "
            "How much does it ask of the people who use the product or service it names?"
        ),
        "criteria": [
            {
                "what": "Nothing: not a security or privacy event, or one with no effect on users",
                "examples": [
                    "a model release",
                    "a theoretical attack on no named product",
                ],
            },
            {
                "what": "Worth knowing: a real flaw or exposure, limited in reach or already closed, no action needed now",
                "examples": [
                    "a fixed bug that leaked a setting",
                    "a vulnerability that needs unusual conditions",
                ],
            },
            {
                "what": "Act now: users should update, uninstall or rotate credentials, or data of many users was exposed",
                "examples": [
                    "a backdoored release of a popular extension",
                    "a breach that exposed customer data",
                    "a tool that sends account details to every site it visits",
                ],
            },
        ],
    },
    "claim_by": {
        "type": "choice",
        "instructions": "Who stands behind the claim in the story described by `title`, `description` and `site`?",
        "criteria": {
            "vendor_or_researcher": {
                "what": "The affected vendor itself or a security firm or researcher publishing its own findings",
                "examples": [
                    "a vendor postmortem",
                    "a security firm's write-up of a backdoor it found",
                ],
            },
            "press": {
                "what": "A news outlet reporting the event",
                "examples": ["a Bloomberg or Forbes article on a breach"],
            },
            "individual": {
                "what": "One user's report, forum post or blog post, not confirmed by anyone else in the text",
                "examples": [
                    "a Tell HN post",
                    "a GitHub issue by one user",
                    "a personal blog's allegation",
                ],
            },
            "unclear": {
                "what": "The text does not show who makes the claim, or there is no claim"
            },
        },
    },
}

LINE_QUESTIONS = {
    "is_security": {
        "type": "noul",
        "instructions": (
            "Does the release-note line in `line`, from release `release` of `project`, describe a change "
            "with a security or privacy effect?"
        ),
        "criteria": {
            "true": (
                "It fixes a vulnerability; stops a leak or an unintended sending of secrets, credentials or "
                "personal data; fixes a permission, sandbox, deny-rule or authentication bypass; adds a "
                "protection or check against one of these; or updates a dependency because of a CVE"
            ),
            "false": (
                "Anything else: a feature, a bug fix with no security or privacy effect, a new option or "
                "convenience around permissions, login or tokens that names no flaw and no new protection, "
                "or a mention of model tokens"
            ),
        },
    },
}


def load_json(path: str):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def api_key() -> str:
    with open(os.path.join(REPO, ".env"), encoding="utf-8") as env:
        for line in env:
            if line.startswith("TYPESAFE_API_KEY="):
                return line.split("=", 1)[1].strip().strip("\"'")
    raise SystemExit("TYPESAFE_API_KEY is not in .env")


def ask(state: dict, questions: dict, key: str) -> dict:
    body = json.dumps(
        {"model": "jev-latest", "state": state, "questions": questions}
    ).encode()
    for attempt in range(4):
        req = urllib.request.Request(
            URL,
            data=body,
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as err:
            if err.code in (429, 529) and attempt < 3:
                time.sleep(min(2**attempt, 10))
                continue
            raise
    raise RuntimeError("unreachable")


def story_state(s: dict) -> dict:
    return {
        "title": s["title"],
        **({"description": s["description"]} if s["description"] else {}),
        "site": s["site"],
    }


def line_state(l: dict) -> dict:
    return {"project": l["project"], "release": l["tag"], "line": l["line"]}


def run(items: list, to_state, questions: dict, out_name: str, key: str) -> None:
    out = os.path.join(HERE, out_name)
    done = load_json(out) if os.path.exists(out) else {}
    todo = [i for i in items if i["id"] not in done]
    failed = 0

    def one(item: dict):
        try:
            return item["id"], ask(to_state(item), questions, key)
        except Exception as err:  # noqa: BLE001 - a spike: count and report
            return item["id"], {"error": str(err)}

    with ThreadPoolExecutor(max_workers=5) as pool:
        for item_id, resp in pool.map(one, todo):
            if "error" in resp:
                failed += 1
                if failed == 1:
                    print("first failure:", resp["error"])
                continue
            done[item_id] = {
                "model": resp["model"],
                "answers": resp["answers"],
                "usage": resp.get("usage"),
            }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(done, f, indent=0)
    print(f"{out_name}: asked {len(todo)}, failed {failed}, saved {len(done)}")


def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    key = api_key()
    stories = load_json(os.path.join(HERE, "stories.json"))
    if mode == "pilot":
        # Repeat noise: the same 20 stories asked twice, apart from the main run.
        sample = stories[::19][:20]
        run(sample, story_state, STORY_QUESTIONS, "results-pilot-a.json", key)
        run(sample, story_state, STORY_QUESTIONS, "results-pilot-b.json", key)
    elif mode == "stories":
        run(stories, story_state, STORY_QUESTIONS, "results-stories.json", key)
    elif mode == "lines":
        lines = {l["id"]: l for l in load_json(os.path.join(HERE, "lines.json"))}
        sample = [
            lines[l["id"]] for l in load_json(os.path.join(HERE, "lines-sample.json"))
        ]
        run(sample, line_state, LINE_QUESTIONS, "results-lines.json", key)
    else:
        raise SystemExit(__doc__)


if __name__ == "__main__":
    main()
