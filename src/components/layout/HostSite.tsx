/**
 * Marks a page as a host's own website: hides the StayOwned header, banner and footer (MarketingOnly).
 * A hoisted style, so it is already in the server HTML (no flash) and works on any path or domain.
 */
export function HostSite() {
  return (
    <style href="host-site" precedence="default">
      {"[data-marketing]{display:none}"}
    </style>
  );
}
