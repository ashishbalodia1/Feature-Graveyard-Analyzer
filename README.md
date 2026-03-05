# Feature Graveyard Analyzer

> **Product Spec v1.0** — SaaS Analytics Platform
> Status: Definition Phase | Owner: Product Team | Last Updated: March 2026

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [User Personas](#2-user-personas)
3. [Key Metrics for Feature Success](#3-key-metrics-for-feature-success)
4. [Dead Feature Signals](#4-dead-feature-signals)
5. [Feature Health Score](#5-feature-health-score)
6. [Product Outputs & Insights](#6-product-outputs--insights)
7. [Non-Goals](#7-non-goals)

---

## 1. Problem Statement

### The Core Problem

Software products accumulate features the way garages accumulate junk — slowly, invisibly, and at great cost.

Most product teams ship features on a roadmap cadence but have no systematic process for reviewing whether those features are delivering value after launch. The result:

- **Engineering waste**: Developers maintain, test, and migrate code for features nobody uses.
- **UX debt**: Unused features clutter the interface, increasing cognitive load and hurting activation.
- **Strategic blindness**: Teams keep building without knowing which bets failed, making it impossible to learn and reallocate resources.
- **Compounding cost**: Every dead feature adds to onboarding complexity, documentation burden, and QA surface area.

### The Market Gap

Current analytics tools (Mixpanel, Amplitude, Heap) show you *what* users do. They do not tell you *which features have failed* or *what to do about it*. Product teams are left to run manual queries, export CSVs, and debate in Slack. There is no opinionated, automated system that surfaces feature rot and recommends action.

### The Solution

**Feature Graveyard Analyzer** connects to a company's existing event data (via API or SDK), runs a continuous scoring model across all tracked features, and surfaces a prioritized list of dead, dying, and at-risk features — with recommended actions for each.

### Business Impact

| Without FGA | With FGA |
|---|---|
| Dead features discovered by accident or not at all | Weekly automated audit of entire feature surface |
| Engineering time wasted on unused code | Clear deprecation candidates with supporting data |
| Roadmap decisions based on gut feel | Evidence-based prioritization backed by usage signals |
| UX cluttered with zombie features | Leaner, faster product with intentional feature set |

---

## 2. User Personas

### Persona 1 — The Pragmatic PM

**Name**: Priya, Senior Product Manager at a 150-person B2B SaaS company
**Goal**: Justify roadmap decisions to engineering leadership and reduce scope creep.
**Pain**: She knows some features are unused but can't prove it without a data analyst's help. Every cleanup conversation turns into an internal political fight without hard numbers.
**How FGA helps**: Priya gets a weekly digest of her product's Feature Health Report. She brings the Feature Health Score to sprint planning and uses it to kill features confidently, with data backing every decision.

---

### Persona 2 — The Efficiency-Focused Founder

**Name**: Marcus, Co-founder & CTO of a 20-person startup
**Goal**: Ship faster by keeping the codebase lean and the product focused.
**Pain**: His team ships fast but rarely removes anything. The product is 3 years old and full of features built for churned customers. Technical debt is slowing them down.
**How FGA helps**: Marcus connects FGA to their event pipeline in under an hour. He gets a Graveyard List every sprint — features with near-zero usage and high maintenance cost — so he can confidently sunset them.

---

### Persona 3 — The Data Analyst

**Name**: Sasha, Product Analyst at a 500-person e-commerce platform
**Goal**: Translate raw telemetry data into actionable product recommendations.
**Pain**: Stakeholders ask "is Feature X being used?" constantly, and each question requires a custom query and a slide deck. There is no shared source of truth.
**How FGA helps**: Sasha uses FGA as the canonical system of record for feature usage. She exports Feature Health Scores into quarterly business reviews and embeds the FGA dashboard into Notion pages for async stakeholder access.

---

### Persona 4 — The VP of Engineering

**Name**: David, VP Engineering at a Series B company
**Goal**: Reduce maintenance overhead and protect developer productivity.
**Pain**: His team spends 20–30% of sprint capacity on maintenance of features that serve <1% of users. He has no tool to quantify or defend cleanup work to the board.
**How FGA helps**: David uses FGA's Engineering Waste Report — which maps dead features to lines of code, test coverage, and CI time — to build a business case for dedicated cleanup sprints.

---

## 3. Key Metrics for Feature Success

FGA evaluates every tracked feature across six metric categories:

### 3.1 Adoption Rate
> % of active users who have used the feature at least once within a rolling 30-day window.

- **Formula**: `(Unique users who triggered feature event) / (Total active users) × 100`
- **Healthy benchmark**: >30% for core features; >10% for secondary features
- **Red flag**: <5% for any feature older than 90 days post-launch

---

### 3.2 Retention Rate (Feature-Level)
> % of users who used the feature in Month N and returned to use it in Month N+1.

- **Formula**: `(Users who used feature in both Month N and N+1) / (Users who used feature in Month N) × 100`
- **Healthy benchmark**: >40% month-over-month retention
- **Red flag**: <15% or declining trend over 3 consecutive months

---

### 3.3 Engagement Depth
> How deeply users interact with a feature beyond a single surface touch.

- Measured as: number of sub-actions completed per feature session, time spent, or steps completed in a multi-step flow.
- **Healthy benchmark**: Users reach at least 50% completion depth on average for workflow features.
- **Red flag**: Users consistently exit at Step 1 of a multi-step feature.

---

### 3.4 Abandonment / Error Rate
> % of feature sessions that end without a meaningful completion event (or end in an error).

- **Formula**: `(Sessions with no completion event or ending in error) / (Total feature sessions) × 100`
- **Healthy benchmark**: <20% abandonment
- **Red flag**: >50% abandonment; any feature with >10% error rate

---

### 3.5 Trend Velocity
> Month-over-month change in the adoption rate, indicating whether usage is growing or decaying.

- **Formula**: `((Current month adoption) - (Prior month adoption)) / (Prior month adoption) × 100`
- **Healthy benchmark**: Flat or positive trend
- **Red flag**: Negative trend for 3+ consecutive months

---

### 3.6 Support & Feedback Signal
> Volume of support tickets, NPS comments, and user feedback directly referencing the feature.

- Sourced via: Intercom/Zendesk integration, NPS verbatim tagging, or manual tag import.
- **Healthy benchmark**: Positive-to-negative mention ratio >2:1
- **Red flag**: Feature is mentioned primarily in complaint tickets or has zero mentions (invisible feature).

---

## 4. Dead Feature Signals

A feature is classified on a four-tier scale based on the combination of signals below.

### Signal Taxonomy

| Signal | Description | Weight |
|---|---|---|
| **Ghost Usage** | Adoption rate <3% among active users | High |
| **Usage Cliff** | >50% drop in usage within 60 days of launch and never recovered | High |
| **Zero Retention** | <10% of users who try it return to use it again | High |
| **Abandonment Spike** | >60% of sessions end without completing the primary action | Medium |
| **Decay Trend** | 3+ consecutive months of declining adoption | Medium |
| **Orphan Feature** | No associated support tickets, NPS mentions, or user requests in 6 months | Medium |
| **Engineering Smell** | Feature has open bugs >90 days old with no resolution priority | Low |
| **Funnel Ghost** | Feature is embedded in a core user flow but skipped by >80% of users | High |

---

### Classification Tiers

| Tier | Label | Criteria | Recommended Action |
|---|---|---|---|
| 🔴 **Tier 1** | Dead | Ghost Usage + Zero Retention + Decay Trend | Immediate deprecation candidate |
| 🟠 **Tier 2** | Dying | Any 2 High signals OR 1 High + 2 Medium signals | Put on 60-day watch; run user research |
| 🟡 **Tier 3** | At Risk | 1 High signal OR 3 Medium signals | Investigate; test improvement hypothesis |
| 🟢 **Tier 4** | Healthy | Meets adoption + retention benchmarks | No action; monitor quarterly |

---

## 5. Feature Health Score

### Composite Score Formula

Each feature receives a **Feature Health Score (FHS)** from **0 to 100**.

$$
FHS = (A \times 0.25) + (R \times 0.25) + (E \times 0.20) + (1 - Ab) \times 0.15 + (T \times 0.10) + (S \times 0.05)
$$

Where each input is normalized to a 0–100 scale:

| Variable | Metric | Weight |
|---|---|---|
| **A** | Adoption Rate (normalized) | 25% |
| **R** | Feature Retention Rate (normalized) | 25% |
| **E** | Engagement Depth Score | 20% |
| **Ab** | Abandonment Rate (inverted: lower = better) | 15% |
| **T** | Trend Velocity (normalized, negative dampened) | 10% |
| **S** | Support Sentiment Score | 5% |

---

### Score Bands

| FHS Range | Grade | Status Label |
|---|---|---|
| 80 – 100 | A | Healthy |
| 60 – 79 | B | Stable |
| 40 – 59 | C | At Risk |
| 20 – 39 | D | Dying |
| 0 – 19 | F | Dead |

---

### Worked Example

**Feature**: "Export to CSV" in a B2B analytics product

| Metric | Raw Value | Normalized (0–100) |
|---|---|---|
| Adoption Rate | 6% (low) | 20 |
| Feature Retention | 18% | 22 |
| Engagement Depth | 2/5 steps avg | 40 |
| Abandonment Rate | 72% (inverted) | 28 |
| Trend Velocity | -8% MoM | 20 |
| Support Sentiment | Neutral | 50 |

$$
FHS = (20 \times 0.25) + (22 \times 0.25) + (40 \times 0.20) + (28 \times 0.15) + (20 \times 0.10) + (50 \times 0.05)
$$

$$
FHS = 5 + 5.5 + 8 + 4.2 + 2 + 2.5 = \textbf{27.2 → Grade D: Dying}
$$

**Recommended Action**: Run a 2-week discovery sprint. Interview churned users who attempted the feature. If no strong signal to improve, schedule for deprecation in next quarter.

---

## 6. Product Outputs & Insights

### 6.1 Feature Graveyard List
A ranked table of all features with FHS < 40, sorted by estimated engineering waste (maintenance cost × team size × feature age). This is the core artifact of the product — the weekly deliverable every team acts on.

**Columns**: Feature Name | FHS | Grade | Active Users | Trend | Est. Maintenance Cost | Recommended Action

---

### 6.2 Feature Health Dashboard
A real-time dashboard showing:
- Portfolio-level health distribution (% of features by grade)
- Trending up vs. trending down features
- Features that crossed a grade threshold since last week
- Time-series charts for any individual feature's FHS over 12 months

---

### 6.3 Engineering Waste Report
Maps dead and dying features to:
- Lines of code (via GitHub/GitLab integration)
- Open pull requests and issues referencing the feature
- CI/CD minutes attributable to feature test suites
- Estimated developer-hours per sprint spent on maintenance

**Output**: A prioritized cleanup backlog, formatted for direct import into Jira or Linear.

---

### 6.4 Deprecation Playbook (Per Feature)
When a feature crosses into Tier 1 (Dead), FGA auto-generates a deprecation playbook containing:
- Summary of all usage signals with source citations
- List of users who have used the feature in the last 90 days (export for offboarding comms)
- Suggested in-app sunset messaging copy
- Proposed timeline: announcement → sunset → code removal
- Link to comparable feature alternatives to redirect users toward

---

### 6.5 Weekly Digest (Email / Slack)
A concise weekly push notification summarizing:
- Net change in portfolio FHS week-over-week
- New features entering the Graveyard List
- Features that recovered (moved from Dying → Stable)
- One featured "Spotlight": the single highest-impact deprecation opportunity of the week

---

### 6.6 Integration Outputs
| Integration | Output |
|---|---|
| Jira / Linear | Auto-created deprecation tickets for Tier 1 features |
| Slack | Weekly digest + real-time alerts when a feature crosses a grade threshold |
| Notion / Confluence | Embeddable Feature Health dashboard block |
| CSV / API | Raw FHS data export for custom BI tools (Looker, Metabase, etc.) |
| GitHub / GitLab | Engineering Waste Report linked to actual code references |

---

## 7. Non-Goals

The following are explicitly out of scope for v1.0 to maintain product focus:

- **Feature discovery / ideation**: FGA analyzes existing features only. It does not suggest new features to build.
- **A/B test management**: FGA reads outcomes but does not manage experiments.
- **Real-time event streaming dashboards**: FGA is a weekly/monthly analytical tool, not a live monitoring system.
- **Revenue attribution per feature**: Connecting features to MRR impact is a v2 consideration.
- **Qualitative research tooling**: User interview scheduling, survey creation, and session recording are out of scope; FGA integrates with tools that do this (Dovetail, FullStory).

---

*Feature Graveyard Analyzer — Turn your product's dead weight into your next competitive advantage.*

---

# Data Model

> **Schema Reference v1.0** — PostgreSQL (primary store) + JSONB for flexible event properties
> All timestamps are stored as `TIMESTAMPTZ` in UTC. All IDs are `UUID v4`.

---

## Entity Relationship Overview

```
organizations
    └── users (many per org)
            └── sessions (many per user)
                    └── feature_events (many per session)

feature_metadata ──────────────────┘ (feature_id FK)
        └── engagement_metrics (one row per feature per period)
```

---

## Table 1 — `users`

Represents every end-user of a product that FGA is monitoring. One row per unique user identity.

### Schema

```sql
CREATE TABLE users (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID            NOT NULL REFERENCES organizations(id),
    external_id         TEXT            NOT NULL,          -- ID in the customer's own system
    email               TEXT,                              -- nullable; some products track anon users
    display_name        TEXT,
    plan_tier           TEXT            NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'enterprise'
    country_code        CHAR(2),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    last_active_at      TIMESTAMPTZ,
    is_internal         BOOLEAN         NOT NULL DEFAULT false,   -- flag to exclude test/employee accounts
    metadata            JSONB           NOT NULL DEFAULT '{}'     -- arbitrary customer-defined attributes
);

CREATE INDEX idx_users_org        ON users(organization_id);
CREATE INDEX idx_users_external   ON users(organization_id, external_id);
CREATE INDEX idx_users_last_active ON users(last_active_at);
```

### Field Notes

| Field | Purpose |
|---|---|
| `external_id` | The UID from the customer's auth system (Auth0 sub, Postgres user PK, etc.). Used to join FGA data back to the customer's own database. |
| `plan_tier` | Enables segmenting feature usage by cohort — a "dead" feature among free users may be healthy for enterprise. |
| `is_internal` | Excludes QA, founders, and employee accounts from usage calculations to avoid skewing adoption rates for small teams. |
| `metadata` | Flexible bag for customer-specific dimensions: `{"role": "admin", "team": "growth", "company_size": "50-200"}` |

### Sample Data

```
id                                   | org_id   | external_id | email                  | plan_tier  | country | last_active_at
-------------------------------------|----------|-------------|------------------------|------------|---------|-----------------------------
a1b2c3d4-...                         | org-001  | usr_9182    | priya@acmecorp.com     | enterprise | IN      | 2026-03-04 14:22:00+00
e5f6a7b8-...                         | org-001  | usr_0044    | marcus@startupio.com   | pro        | US      | 2026-02-28 09:10:00+00
c9d0e1f2-...                         | org-002  | usr_3312    | sasha@bigretail.com    | enterprise | DE      | 2026-03-05 08:45:00+00
```

---

## Table 2 — `sessions`

A session is a single continuous visit by a user to the product. It begins on first event and closes after 30 minutes of inactivity (standard session timeout) or explicit logout.

### Schema

```sql
CREATE TABLE sessions (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES users(id),
    organization_id     UUID            NOT NULL REFERENCES organizations(id),
    started_at          TIMESTAMPTZ     NOT NULL,
    ended_at            TIMESTAMPTZ,                       -- NULL if session still active
    duration_seconds    INTEGER,                           -- computed on session close
    entry_path          TEXT,                              -- URL/route where session began
    exit_path           TEXT,                              -- URL/route of last event
    device_type         TEXT,                              -- 'desktop' | 'mobile' | 'tablet'
    browser             TEXT,                              -- 'chrome' | 'firefox' | 'safari' | 'edge'
    os                  TEXT,                              -- 'macos' | 'windows' | 'ios' | 'android'
    app_version         TEXT            NOT NULL,          -- semantic version of the product at time of session
    referrer_source     TEXT,                              -- UTM source or internal navigation origin
    is_bounce           BOOLEAN         GENERATED ALWAYS AS (duration_seconds < 10) STORED
);

CREATE INDEX idx_sessions_user       ON sessions(user_id);
CREATE INDEX idx_sessions_org_time   ON sessions(organization_id, started_at DESC);
CREATE INDEX idx_sessions_started    ON sessions(started_at DESC);
```

### Field Notes

| Field | Purpose |
|---|---|
| `app_version` | Critical for feature analysis — a usage drop after `v2.4.0` may indicate a regression, not organic abandonment. |
| `entry_path` | Identifies which surface users land on; useful for understanding feature discoverability. |
| `is_bounce` | Computed column. Sessions under 10 seconds are bounces and are excluded from engagement depth calculations. |

### Sample Data

```
id           | user_id      | started_at              | ended_at                | duration_s | device  | browser | app_version
-------------|--------------|-------------------------|-------------------------|------------|---------|---------|------------
sess-001     | a1b2c3d4-... | 2026-03-04 14:00:00+00  | 2026-03-04 14:22:00+00  | 1320       | desktop | chrome  | 3.12.1
sess-002     | e5f6a7b8-... | 2026-03-04 09:05:00+00  | 2026-03-04 09:10:00+00  | 300        | mobile  | safari  | 3.12.1
sess-003     | a1b2c3d4-... | 2026-03-05 10:15:00+00  | NULL                    | NULL       | desktop | chrome  | 3.12.2
```

---

## Table 3 — `feature_events`

The highest-volume table in the system. One row per discrete user interaction with any tracked feature. This is the raw event log from which all metrics are derived.

### Schema

```sql
CREATE TABLE feature_events (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID            NOT NULL REFERENCES sessions(id),
    user_id             UUID            NOT NULL REFERENCES users(id),
    organization_id     UUID            NOT NULL REFERENCES organizations(id),
    feature_id          UUID            NOT NULL REFERENCES feature_metadata(id),
    event_type          TEXT            NOT NULL,          -- see Event Type Taxonomy below
    event_name          TEXT            NOT NULL,          -- human-readable; e.g. 'export_csv_clicked'
    occurred_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
    step_index          SMALLINT,                          -- position in a multi-step flow (0-based); NULL for single-action features
    step_total          SMALLINT,                          -- total steps in the flow; NULL for single-action features
    duration_ms         INTEGER,                           -- time since previous event in same feature context
    is_error            BOOLEAN         NOT NULL DEFAULT false,
    error_code          TEXT,                              -- application error code if is_error = true
    properties          JSONB           NOT NULL DEFAULT '{}'  -- arbitrary event-level dimensions
);

-- Partitioned by month for query performance at scale
CREATE INDEX idx_fevents_feature_time  ON feature_events(feature_id, occurred_at DESC);
CREATE INDEX idx_fevents_user_time     ON feature_events(user_id, occurred_at DESC);
CREATE INDEX idx_fevents_session       ON feature_events(session_id);
CREATE INDEX idx_fevents_type          ON feature_events(event_type);
CREATE INDEX idx_fevents_properties    ON feature_events USING gin(properties);
```

### Event Type Taxonomy

| `event_type` | When it fires | Example |
|---|---|---|
| `feature_viewed` | Feature UI becomes visible in the viewport | User scrolls to the "Integrations" panel |
| `feature_entered` | User actively opens or navigates into a feature | User clicks "Open CSV Export" modal |
| `feature_step_completed` | User completes one step in a multi-step flow | User selects date range in export wizard (step 1 of 3) |
| `feature_completed` | User successfully completes the primary action | CSV file download triggered |
| `feature_abandoned` | User exits a feature flow without completing it | User closes export modal at step 2 |
| `feature_errored` | An error prevents feature use | API timeout on export generation |
| `feature_dismissed` | User explicitly opts out or hides the feature | User clicks "Don't show again" on a feature prompt |

### How Events Are Tracked (SDK Integration)

FGA ships a lightweight JavaScript SDK (with server-side SDKs for Node, Python, Ruby, Go). Instrumentation is a single function call added by the engineering team at the point of each user interaction:

```javascript
// Example: tracking a multi-step export wizard

// Step 1 — user opens the feature
fga.track('feature_entered', {
  featureKey: 'csv_export',
  properties: { trigger: 'toolbar_button' }
});

// Step 2 — user completes step 1 of 3
fga.track('feature_step_completed', {
  featureKey: 'csv_export',
  stepIndex: 0,
  stepTotal: 3,
  properties: { date_range: '30d' }
});

// Step 3 — user completes step 2 of 3
fga.track('feature_step_completed', {
  featureKey: 'csv_export',
  stepIndex: 1,
  stepTotal: 3,
  properties: { columns_selected: 5 }
});

// Step 4a — SUCCESS path
fga.track('feature_completed', {
  featureKey: 'csv_export',
  properties: { rows_exported: 1240, file_size_kb: 88 }
});

// Step 4b — ABANDONMENT path (user closed modal)
fga.track('feature_abandoned', {
  featureKey: 'csv_export',
  stepIndex: 1,    // abandoned at step 2 of 3
  stepTotal: 3
});

// Step 4c — ERROR path
fga.track('feature_errored', {
  featureKey: 'csv_export',
  errorCode: 'EXPORT_TIMEOUT',
  properties: { rows_attempted: 50000 }
});
```

The SDK batches events client-side and flushes to the FGA ingestion API every 5 seconds or on page unload. Sessions are managed automatically — the SDK handles session ID assignment, timeout detection, and device fingerprinting.

### Sample Data

```
id        | session_id | feature_id      | event_type              | event_name               | occurred_at              | step_index | step_total | is_error
----------|------------|-----------------|-------------------------|--------------------------|--------------------------|------------|------------|--------
evt-001   | sess-001   | feat-csv-export | feature_entered         | csv_export_opened        | 2026-03-04 14:05:00+00   | NULL       | NULL       | false
evt-002   | sess-001   | feat-csv-export | feature_step_completed  | csv_export_step_1_done   | 2026-03-04 14:05:18+00   | 0          | 3          | false
evt-003   | sess-001   | feat-csv-export | feature_abandoned       | csv_export_abandoned     | 2026-03-04 14:05:45+00   | 1          | 3          | false
evt-004   | sess-002   | feat-dashboard  | feature_viewed          | dashboard_viewed         | 2026-03-04 09:06:00+00   | NULL       | NULL       | false
evt-005   | sess-002   | feat-dashboard  | feature_completed       | dashboard_loaded         | 2026-03-04 09:06:02+00   | NULL       | NULL       | false
evt-006   | sess-001   | feat-csv-export | feature_errored         | csv_export_error         | 2026-03-04 14:10:00+00   | NULL       | NULL       | true
```

---

## Table 4 — `feature_metadata`

One row per tracked feature. This is the authoritative registry of everything the product knows about a feature — its identity, ownership, lifecycle status, and targets.

### Schema

```sql
CREATE TABLE feature_metadata (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID        NOT NULL REFERENCES organizations(id),
    feature_key             TEXT        NOT NULL,          -- stable machine identifier; e.g. 'csv_export'
    display_name            TEXT        NOT NULL,          -- human label; e.g. 'CSV Export'
    description             TEXT,
    category                TEXT,                          -- 'core' | 'power' | 'admin' | 'onboarding' | 'experimental'
    surface                 TEXT,                          -- 'web_app' | 'mobile' | 'api' | 'email'
    owner_team              TEXT,                          -- engineering team responsible for maintenance
    launched_at             DATE,                          -- date feature reached GA
    deprecated_at           DATE,                          -- set when feature is sunset
    status                  TEXT        NOT NULL DEFAULT 'active',  -- 'active' | 'experimental' | 'deprecated' | 'removed'
    adoption_target_pct     NUMERIC(5,2),                  -- team's own goal for adoption rate
    retention_target_pct    NUMERIC(5,2),                  -- team's own goal for retention rate
    is_core_flow            BOOLEAN     NOT NULL DEFAULT false,  -- is this feature in the critical user journey?
    estimated_loc           INTEGER,                       -- lines of code (synced from GitHub integration)
    tags                    TEXT[],                        -- free-form tags for filtering; e.g. '{reporting,export}'
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, feature_key)
);

CREATE INDEX idx_fmeta_org_status  ON feature_metadata(organization_id, status);
CREATE INDEX idx_fmeta_tags        ON feature_metadata USING gin(tags);
```

### Field Notes

| Field | Purpose |
|---|---|
| `feature_key` | Stable snake_case slug used in SDK calls. Never changes even if `display_name` is renamed. |
| `category` | Used to apply different FHS thresholds — an `experimental` feature is not held to the same adoption target as a `core` feature. |
| `is_core_flow` | Features in the critical user journey (signup, activation, primary value action) are flagged specially. A low FHS for a core flow feature triggers a P0 alert, not just a weekly digest item. |
| `adoption_target_pct` / `retention_target_pct` | The team's own declared goal. FHS is calculated both against fixed benchmarks and against the team's own target, and both scores are surfaced. |
| `estimated_loc` | Pulled nightly from GitHub/GitLab via blame analysis of feature-tagged files. Used in Engineering Waste Report. |

### Sample Data

```
id               | feature_key      | display_name      | category     | owner_team   | launched_at | status  | adoption_target | is_core_flow | estimated_loc
-----------------|------------------|-------------------|--------------|--------------|-------------|---------|-----------------|--------------|---------------
feat-csv-export  | csv_export       | CSV Export        | power        | data-team    | 2024-06-01  | active  | 25.00           | false        | 1840
feat-dashboard   | main_dashboard   | Main Dashboard    | core         | platform     | 2023-01-15  | active  | 90.00           | true         | 5210
feat-api-webhook | api_webhooks     | API Webhooks      | power        | integrations | 2024-02-10  | active  | 20.00           | false        | 3100
feat-dark-mode   | dark_mode        | Dark Mode         | experimental | design       | 2025-08-01  | active  | 15.00           | false        | 420
feat-old-reports | legacy_reports   | Legacy Reports    | core         | data-team    | 2022-03-01  | active  | 40.00           | false        | 6700
```

---

## Table 5 — `engagement_metrics`

A pre-aggregated metrics table, rebuilt nightly by the FGA analytics engine from raw `feature_events`. One row per feature per time period. This is what powers all dashboard queries — no analyst should need to query `feature_events` directly.

### Schema

```sql
CREATE TABLE engagement_metrics (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id                  UUID        NOT NULL REFERENCES feature_metadata(id),
    organization_id             UUID        NOT NULL REFERENCES organizations(id),
    period_start                DATE        NOT NULL,
    period_end                  DATE        NOT NULL,
    period_type                 TEXT        NOT NULL,      -- 'weekly' | 'monthly'

    -- Volume
    total_events                INTEGER     NOT NULL DEFAULT 0,
    total_sessions              INTEGER     NOT NULL DEFAULT 0,   -- sessions with at least one feature_entered
    unique_users                INTEGER     NOT NULL DEFAULT 0,   -- distinct user_ids
    active_users_in_period      INTEGER     NOT NULL DEFAULT 0,   -- denominator for adoption rate

    -- Adoption
    adoption_rate_pct           NUMERIC(6,3),  -- unique_users / active_users_in_period * 100
    new_adopters                INTEGER,       -- users using feature for first time this period
    returning_users             INTEGER,       -- users who used feature in prior period AND this period

    -- Retention
    retention_rate_pct          NUMERIC(6,3),  -- returning_users / prior_period_unique_users * 100
    prior_period_unique_users   INTEGER,       -- denominator for retention calculation

    -- Engagement Depth
    avg_steps_completed         NUMERIC(6,3),  -- avg step_index reached across all entered sessions
    max_steps_in_flow           SMALLINT,      -- step_total for this feature (0 for single-action)
    avg_depth_pct               NUMERIC(6,3),  -- avg_steps_completed / max_steps_in_flow * 100

    -- Completion & Abandonment
    completion_count            INTEGER,       -- sessions ending with feature_completed
    abandonment_count           INTEGER,       -- sessions ending with feature_abandoned
    error_count                 INTEGER,       -- sessions containing feature_errored
    completion_rate_pct         NUMERIC(6,3),  -- completion_count / total_sessions * 100
    abandonment_rate_pct        NUMERIC(6,3),  -- abandonment_count / total_sessions * 100
    error_rate_pct              NUMERIC(6,3),  -- error_count / total_sessions * 100

    -- Trend
    adoption_delta_pct          NUMERIC(8,3),  -- adoption_rate_pct vs prior period (positive = growth)

    -- Computed Score
    feature_health_score        NUMERIC(5,2),  -- FHS 0–100, computed by scoring engine
    fhs_grade                   CHAR(1),       -- 'A' | 'B' | 'C' | 'D' | 'F'
    fhs_tier                    SMALLINT,      -- 1=Dead | 2=Dying | 3=AtRisk | 4=Healthy

    computed_at                 TIMESTAMPTZ    NOT NULL DEFAULT now(),

    UNIQUE(feature_id, period_start, period_type)
);

CREATE INDEX idx_engmet_feature_period  ON engagement_metrics(feature_id, period_start DESC);
CREATE INDEX idx_engmet_org_period      ON engagement_metrics(organization_id, period_start DESC);
CREATE INDEX idx_engmet_fhs             ON engagement_metrics(organization_id, feature_health_score ASC);
```

### Sample Data (Monthly — March 2026)

```
feature_id       | period       | unique_users | active_users | adoption_pct | retention_pct | avg_depth_pct | abandonment_pct | error_pct | adoption_delta | fhs    | grade | tier
-----------------|--------------|--------------|--------------|--------------|---------------|---------------|-----------------|-----------|----------------|--------|-------|-----
feat-csv-export  | 2026-03-01   | 48           | 1200         | 4.00         | 16.70         | 38.00         | 72.00           | 8.30      | -9.10          | 22.4   | D     | 2
feat-dashboard   | 2026-03-01   | 1140         | 1200         | 95.00        | 91.20         | 92.00         | 4.10            | 0.80      | +1.20          | 94.1   | A     | 4
feat-api-webhook | 2026-03-01   | 210          | 1200         | 17.50        | 44.30         | 71.00         | 28.60           | 3.10      | +2.80          | 61.3   | B     | 4
feat-dark-mode   | 2026-03-01   | 36           | 1200         | 3.00         | 9.40          | 100.00        | 0.00            | 0.00      | -4.50          | 18.7   | F     | 1
feat-old-reports | 2026-03-01   | 22           | 1200         | 1.83         | 7.10          | 55.00         | 61.00           | 11.20     | -14.30         | 11.2   | F     | 1
```

---

## How Feature Usage Is Calculated

The FGA analytics engine runs as a nightly batch job. Here is the exact calculation pipeline:

### Step 1 — Define the Active User Denominator

```sql
-- All users with at least one session event in the period window
SELECT COUNT(DISTINCT user_id) AS active_users_in_period
FROM sessions
WHERE organization_id = :org_id
  AND started_at BETWEEN :period_start AND :period_end
  AND is_bounce = false;
```

This becomes the denominator for every adoption rate calculation for that period. Internal users (`is_internal = true`) are excluded.

### Step 2 — Calculate Per-Feature Adoption

```sql
-- Unique users who fired feature_entered or feature_completed for this feature
SELECT
    fe.feature_id,
    COUNT(DISTINCT fe.user_id)                                          AS unique_users,
    COUNT(DISTINCT fe.session_id)                                       AS total_sessions,
    COUNT(DISTINCT fe.user_id) * 100.0 / :active_users_in_period       AS adoption_rate_pct
FROM feature_events fe
WHERE fe.organization_id = :org_id
  AND fe.occurred_at     BETWEEN :period_start AND :period_end
  AND fe.event_type      IN ('feature_entered', 'feature_completed')
GROUP BY fe.feature_id;
```

### Step 3 — Calculate Retention (Period-over-Period)

```sql
-- Users present in both the current period AND the prior period for the same feature
WITH current_period AS (
    SELECT DISTINCT user_id FROM feature_events
    WHERE feature_id = :feature_id
      AND occurred_at BETWEEN :period_start AND :period_end
),
prior_period AS (
    SELECT DISTINCT user_id FROM feature_events
    WHERE feature_id = :feature_id
      AND occurred_at BETWEEN :prior_start AND :prior_end
)
SELECT
    COUNT(*)                                            AS returning_users,
    COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM prior_period), 0) AS retention_rate_pct
FROM current_period
WHERE user_id IN (SELECT user_id FROM prior_period);
```

### Step 4 — Calculate Engagement Depth

```sql
-- For multi-step features, average how far through the flow users get
SELECT
    AVG(max_step_reached)                                       AS avg_steps_completed,
    MAX(step_total)                                             AS max_steps_in_flow,
    AVG(max_step_reached) * 100.0 / NULLIF(MAX(step_total), 0) AS avg_depth_pct
FROM (
    SELECT
        session_id,
        COALESCE(MAX(step_index) + 1, 1)    AS max_step_reached,
        MAX(step_total)                      AS step_total
    FROM feature_events
    WHERE feature_id  = :feature_id
      AND occurred_at BETWEEN :period_start AND :period_end
      AND step_total  IS NOT NULL
    GROUP BY session_id
) sub;
```

### Step 5 — Calculate Completion, Abandonment, Error Rates

```sql
SELECT
    COUNT(*) FILTER (WHERE event_type = 'feature_completed')  AS completion_count,
    COUNT(*) FILTER (WHERE event_type = 'feature_abandoned')  AS abandonment_count,
    COUNT(*) FILTER (WHERE is_error = true)                   AS error_count,
    COUNT(DISTINCT session_id)                                AS total_sessions
FROM feature_events
WHERE feature_id  = :feature_id
  AND occurred_at BETWEEN :period_start AND :period_end;

-- Rates derived as: count / total_sessions * 100
```

### Step 6 — Score and Grade

The FHS scoring engine reads the five calculated values, normalizes each to 0–100 using min/max scaling calibrated against the organization's own historical range, applies the weighted formula from the product spec, and writes the result back to `engagement_metrics.feature_health_score`.

Features with FHS < 20 and `launched_at` more than 90 days ago are automatically added to the Graveyard List and queued for a Deprecation Playbook.

---
