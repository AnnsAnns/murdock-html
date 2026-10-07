// Shared domain types for the Murdock API and UI.

/** Every icon name the `Icon` component knows about. */
export type IconName =
  | 'github'
  | 'external'
  | 'inbox'
  | 'gear'
  | 'check'
  | 'cross'
  | 'dash'
  | 'restart'
  | 'calendar'
  | 'person'
  | 'tag'
  | 'link'
  | 'clock'
  | 'cpu'
  | 'wrench'
  | 'fileText'
  | 'files'
  | 'info'
  | 'chart'
  | 'terminal'
  | 'arrowDown'
  | 'arrowUp'
  | 'chevronLeft'
  | 'chevronDown'
  | 'warning'
  | 'shield'
  | 'logout'
  | 'cardText'
  | 'expand'
  | 'transfer'
  | 'search'
  | 'close'
  | 'menu'
  | 'more'
  | 'sun'
  | 'moon'
  | 'play'
  | 'gitPullRequest'
  | 'gitMerge'
  | 'gitBranch'
  | 'gitCommit';

/** Lifecycle states a Murdock job can be in. */
export type JobState = 'queued' | 'running' | 'passed' | 'errored' | 'stopped';

/** The kind of jobs the dashboard filters by. */
export type JobType = 'all' | 'pr' | 'branch' | 'tag';

/** Maintainer actions exposed on a job. */
export type JobActionName = 'cancel' | 'abort' | 'restart';

/** Result tabs on the job detail view. */
export type ResultTab = 'builds' | 'tests' | 'output' | 'artifacts' | 'details' | 'stats';

export interface Commit {
  sha: string;
  message: string;
  author: string;
}

export interface PrInfo {
  number: number;
  title?: string;
  url?: string;
  state?: string;
  is_merged?: boolean;
  labels?: string[];
}

/** A single job-level failure entry (`status.failed_jobs`). */
export interface FailureItem {
  name?: string;
  application?: string;
  target?: string;
  toolchain?: string;
  href?: string;
}

/** One application result from `builds.json` / `tests.json` or the live status. */
export interface ResultItem {
  application: string;
  target: string;
  toolchain: string;
  worker?: string;
  runtime?: number;
  status?: boolean;
  failures?: ResultItem[];
  build_success?: number;
  build_failures?: number;
  test_success?: number;
  test_failures?: number;
}

export interface JobStatus {
  eta?: number;
  status?: string;
  total?: number;
  passed?: number;
  failed?: number;
  failed_jobs?: FailureItem[];
  failed_builds?: ResultItem[];
  failed_tests?: ResultItem[];
}

export interface Job {
  uid: string;
  state: JobState;
  ref?: string;
  commit: Commit;
  creation_time?: number;
  start_time?: number;
  runtime?: number;
  status?: JobStatus;
  output?: string | null;
  output_text_url?: string;
  artifacts?: string[];
  env?: Record<string, string>;
  prinfo?: PrInfo;
  triggered_by?: string;
  trigger?: string;
  fasttracked?: boolean;
}

/** The subset of a job the queue/timeline helpers need. */
export type QueueJob = Pick<
  Job,
  'uid' | 'state' | 'creation_time' | 'start_time' | 'runtime' | 'status' | 'env' | 'ref'
>;

export interface WorkerStats {
  name: string;
  runtime_avg: number;
  runtime_min: number;
  runtime_max: number;
  total_cpu_time: number;
  jobs_passed: number;
  jobs_failed: number;
  jobs_count: number;
}

export interface Stats {
  total_jobs?: number;
  total_builds?: number;
  total_tests?: number;
  total_time?: string;
  workers?: WorkerStats[];
}

/** `app.json` returned for a single application's builds/tests. */
export interface ApplicationResults {
  jobs?: ResultItem[];
  failures?: ResultItem[];
}

export interface BuildProgress {
  done: number;
  total: number;
  passed: number;
  failed: number;
  percent: number;
}

export interface JobEnd {
  date: Date;
  estimated: boolean;
}

export interface RefLink {
  url: string;
  label: string;
  title: string;
  icon: IconName;
}

/** The loose subset of a job needed to derive its external reference link. */
export interface JobRefSource {
  ref?: string;
  env?: Record<string, string>;
  prinfo?: PrInfo;
  commit?: { sha?: string };
}

/** A single segment of the active-time bar. */
export interface TimelineSegment {
  uid?: string;
  state?: JobState;
  idle?: boolean;
  future: boolean;
  start: number;
  end: number;
  seconds: number;
}

export interface PrStates {
  open: boolean;
  closed: boolean;
}

export interface QueryParams {
  limit: number;
  type: JobType;
  states: JobState[];
  prnum: string;
  prstates: PrStates;
  branch: string;
  tag: string;
  sha: string;
  author: string;
}

/** Locally drafted text filters before they are committed to the URL. */
export type DraftParams = Pick<QueryParams, 'sha' | 'author' | 'prnum' | 'branch' | 'tag'>;

/** Messages pushed over Murdock's status WebSocket. */
export type SocketMessage =
  | { cmd: 'reload' }
  | { cmd: 'status'; uid: string; status: JobStatus }
  | { cmd: 'output'; uid: string; line: string };

export interface AuthUser {
  token: string;
  login: string;
  avatarUrl: string;
  name?: string | null;
}

export type Permissions = 'unknown' | 'push' | 'no';

export interface AuthContextValue {
  user: AuthUser | null;
  permissions: Permissions;
  ready: boolean;
  login: () => void;
  logout: () => void;
  enabled: boolean;
  canManage: boolean;
}

export interface GithubProfile {
  login: string;
  avatarUrl: string;
  name?: string | null;
}
