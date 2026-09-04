"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";

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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-surface-elevated"
        title="Gonka AI Router Configuration"
      >
        <span
          className={`h-2 w-2 rounded-full ${
            status === "connected" ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span>{status === "connected" ? "Gonka AI: Live" : "Gonka AI: Demo Preset"}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gonka AI Configuration</CardTitle>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-ink-soft hover:text-ink text-sm font-medium"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-body text-ink-soft">
                  TrustMesh uses <strong>Gonka Router (gonkarouter.io)</strong> for dual-model forensic auditing of deliverables.
                </p>

                <div className="rounded-lg border border-border bg-surface-elevated p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Endpoint:</span>
                    <code className="text-ink font-mono">api.gonkarouter.io/v1</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Model:</span>
                    <code className="text-ink font-mono">moonshotai/Kimi-K2.6</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Status:</span>
                    <span className={`font-semibold ${status === "connected" ? "text-emerald-600" : "text-amber-600"}`}>
                      {status === "connected" ? "Live API Verified" : "Fallback / Demo Presets"}
                    </span>
                  </div>
                </div>

                <Field
                  label="Gonka Router API Key"
                  htmlFor="gonka-key"
                  hint="Enter your key to test live dual-model evaluation."
                >
                  <Input
                    id="gonka-key"
                    type="password"
                    placeholder="sk-..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                  />
                </Field>

                {testResult && (
                  <div
                    className={`rounded-md p-3 text-xs ${
                      testResult.ok
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <p className="font-semibold">{testResult.ok ? "Success" : "Error"}</p>
                    <p>{testResult.message}</p>
                    {testResult.latencyMs !== undefined && testResult.latencyMs > 0 && (
                      <p className="mt-1 text-[10px] opacity-75">Roundtrip: {testResult.latencyMs}ms</p>
                    )}
                  </div>
                )}
              </CardBody>
              <CardFooter className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleTest}
                  disabled={testing}
                >
                  {testing ? "Testing…" : "Test Key"}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                    Close
                  </Button>
                  <Button type="button" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
