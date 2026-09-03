import fs from "node:fs";
import path from "node:path";
import { Job } from "@/lib/types";
import { SEED_JOBS } from "@/lib/mockData";

/**
 * Jobs live in one JSON file on the server rather than in React state.
 *
 * That is what makes the two-window demo work: the company posts a job in one
 * browser and the student sees it in the other, because both windows are reading
 * the same file through the API. A real deployment would use a database; a file
 * is enough for a single dev server and keeps the moving parts visible.
 */
const STORE_PATH = path.join(process.cwd(), ".trustmesh-data.json");

function load(): Job[] {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    return JSON.parse(raw) as Job[];
  } catch {
    // First run, or the file was deleted to reset the demo.
    save(SEED_JOBS);
    return SEED_JOBS;
  }
}

function save(jobs: Job[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(jobs, null, 2), "utf8");
}

export function listJobs(): Job[] {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

export function getJob(jobId: string): Job | undefined {
  return load().find((job) => job.id === jobId);
}

export function addJob(job: Job): Job {
  const jobs = load();
  jobs.push(job);
  save(jobs);
  return job;
}

/**
 * Applies a change to one job and writes it back. Returns undefined if the job
 * does not exist, so callers can turn that into a 404.
 */
export function updateJob(jobId: string, change: (job: Job) => Job): Job | undefined {
  const jobs = load();
  const index = jobs.findIndex((job) => job.id === jobId);
  if (index === -1) return undefined;
  const updated = change(jobs[index]);
  jobs[index] = updated;
  save(jobs);
  return updated;
}

/** Wipes the store back to the seed jobs. Used by the reset button in the footer. */
export function resetJobs(): Job[] {
  save(SEED_JOBS);
  return SEED_JOBS;
}
