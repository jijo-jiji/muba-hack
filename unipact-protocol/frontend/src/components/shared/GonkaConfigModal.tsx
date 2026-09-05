"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardBody, CardFooter } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";

export function GonkaConfigModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("trustmesh_gonka_api_key") || "";
    setKey(saved);
    checkStatus(saved);
  }, []);

  const checkStatus = async (apiKey?: string) => {
    try {
      const res = await fetch("/api/gonka/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey || undefined }),
      });
      const data = await res.json();
      setStatus(data.ok ? "connected" : "disconnected");
    } catch {
      setStatus("disconnected");
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/gonka/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key.trim() || undefined }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.ok) {
        setStatus("connected");
        if (key.trim()) {
          localStorage.setItem("trustmesh_gonka_api_key", key.trim());
        }
      } else {
        setStatus("disconnected");
      }
    } catch (err) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      });
      setStatus("disconnected");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem("trustmesh_gonka_api_key", key.trim());
    } else {
      localStorage.removeItem("trustmesh_gonka_api_key");
    }
    setIsOpen(false);
  };

  const isLive = status === "connected";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="AI review settings"
        className="inline-flex items-center gap-2 rounded border border-line px-2.5 py-1 text-small text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-success" : "bg-warning"}`} />
        <span>{isLive ? "AI review: live" : "AI review: demo data"}</span>
      </button>

      {isOpen && (
        <Modal title="AI review settings" onClose={() => setIsOpen(false)}>
          <CardBody className="space-y-6">
            <p className="text-body text-ink-soft">
              Reviews run through Gonka Router. Without a key the app returns canned results, and
              every screen that shows one labels it as demo data.
            </p>

            <dl className="space-y-2 rounded border border-line bg-page px-4 py-3">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-small text-ink-soft">Endpoint</dt>
                <dd className="font-mono text-small text-ink">api.gonkarouter.io/v1</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-small text-ink-soft">Models</dt>
                <dd className="font-mono text-small text-ink">Kimi-K2.6, DeepSeek-V4</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-small text-ink-soft">Status</dt>
                <dd className={`text-small font-medium ${isLive ? "text-success" : "text-warning"}`}>
                  {isLive ? "Live" : "Falling back to demo data"}
                </dd>
              </div>
            </dl>

            <Field
              label="Gonka Router API key"
              htmlFor="gonka-key"
              hint="Stored in this browser only. It is sent to our server to make the call, never to anyone else."
            >
              <Input
                id="gonka-key"
                type="password"
                placeholder="sk-..."
                value={key}
                onChange={(event) => setKey(event.target.value)}
              />
            </Field>

            {testResult && (
              <div
                className={`rounded border px-4 py-3 ${
                  testResult.ok ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
                }`}
              >
                <p
                  className={`text-small font-medium ${
                    testResult.ok ? "text-success" : "text-danger"
                  }`}
                >
                  {testResult.ok ? "Connected" : "Could not connect"}
                </p>
                <p className="mt-1 text-small text-ink-soft">{testResult.message}</p>
                {testResult.latencyMs !== undefined && testResult.latencyMs > 0 && (
                  <p className="mt-1 text-small text-ink-faint">
                    Round trip {testResult.latencyMs} ms
                  </p>
                )}
              </div>
            )}
          </CardBody>

          <CardFooter className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="secondary" onClick={handleTest} disabled={testing}>
              {testing ? "Testing…" : "Test key"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                Save
              </Button>
            </div>
          </CardFooter>
        </Modal>
      )}
    </>
  );
}
