import { PageFrame } from "@/components/shared/PageFrame";

/**
 * A portfolio is meant to be shared, so a stranger can open it. A signed-in
 * student following the link from their own dashboard keeps the app header.
 */
export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <PageFrame>{children}</PageFrame>;
}
