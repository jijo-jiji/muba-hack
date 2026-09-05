import { PageFrame } from "@/components/shared/PageFrame";

/** Anyone can check a claim, so this page keeps the app header when signed in. */
export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <PageFrame>{children}</PageFrame>;
}
