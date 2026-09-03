"use client";

import { useCallback, useEffect, useState } from "react";
import { Job } from "@/lib/types";

/** How often each window re-reads the shared job list, in milliseconds. */
const POLL_INTERVAL = 4000;

interface JobsState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Reads the jobs this account is allowed to see, and keeps re-reading them.
 *
 * The polling is what makes the side-by-side demo work without anyone pressing
 * refresh: the company posts a job in one window and it appears in the student's
 * window a few seconds later.
 */
export function useJobs(): JobsState {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/jobs", { cache: "no-store" });
      if (!response.ok) throw new Error(`The server replied with HTTP ${response.status}`);
      const data = await response.json();
      setJobs(data.jobs ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  return { jobs, isLoading, error, refresh };
}

/** The same idea for a single job page. */
export function useJob(jobId: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      setJob(data.job);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  return { job, isLoading, error, refresh, setJob };
}
