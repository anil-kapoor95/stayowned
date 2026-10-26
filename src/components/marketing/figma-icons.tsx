import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Icons exported from the Figma "pricing page" and "Themes page" frames, kept with their
 * original geometry and colours. Decorative only (aria-hidden).
 */
type Props = Omit<SVGProps<SVGSVGElement>, "children"> & { className?: string };

function Svg({ width, height, viewBox, className, children, ...rest }: Props & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Hero pill: "WhatsApp reply < 5 mins". */
export function BoltIcon(props: Props) {
  return (
    <Svg width={11.3333} height={14.1667} viewBox="0 0 11.3333 14.1667" {...props}>
      <path d="M2.83333 14.1667L3.54167 9.20833H0L6.375 0H7.79167L7.08333 5.66667H11.3333L4.25 14.1667H2.83333Z" fill="#E8531D" />
    </Svg>
  );
}

/** Hero pill: "100% Free Concierge Setup". */
export function VerifiedIcon(props: Props) {
  return (
    <Svg width={15.5833} height={14.875} viewBox="0 0 15.5833 14.875" {...props}>
      <path
        d="M5.38333 14.875L4.0375 12.6083L1.4875 12.0417L1.73542 9.42083L0 7.4375L1.73542 5.45417L1.4875 2.83333L4.0375 2.26667L5.38333 0L7.79167 1.02708L10.2 0L11.5458 2.26667L14.0958 2.83333L13.8479 5.45417L15.5833 7.4375L13.8479 9.42083L14.0958 12.0417L11.5458 12.6083L10.2 14.875L7.79167 13.8479L5.38333 14.875ZM5.98542 13.0688L7.79167 12.2896L9.63333 13.0688L10.625 11.3687L12.5729 10.9083L12.3958 8.925L13.7063 7.4375L12.3958 5.91458L12.5729 3.93125L10.625 3.50625L9.59792 1.80625L7.79167 2.58542L5.95 1.80625L4.95833 3.50625L3.01042 3.93125L3.1875 5.91458L1.87708 7.4375L3.1875 8.925L3.01042 10.9438L4.95833 11.3687L5.98542 13.0688ZM7.04792 9.95208L11.05 5.95L10.0583 4.92292L7.04792 7.93333L5.525 6.44583L4.53333 7.4375L7.04792 9.95208Z"
        fill="#E8531D"
      />
    </Svg>
  );
}

/** Hero pill: "0% Commission Guaranteed". */
export function PiggyBankIcon(props: Props) {
  return (
    <Svg width={14.1667} height={13.4583} viewBox="0 0 14.1667 13.4583" {...props}>
      <path
        d="M9.91667 6.375C10.1174 6.375 10.2856 6.30712 10.4214 6.17135C10.5571 6.03559 10.625 5.86736 10.625 5.66667C10.625 5.46597 10.5571 5.29774 10.4214 5.16198C10.2856 5.02622 10.1174 4.95833 9.91667 4.95833C9.71597 4.95833 9.54774 5.02622 9.41198 5.16198C9.27621 5.29774 9.20833 5.46597 9.20833 5.66667C9.20833 5.86736 9.27621 6.03559 9.41198 6.17135C9.54774 6.30712 9.71597 6.375 9.91667 6.375ZM4.25 4.95833H7.79167V3.54167H4.25V4.95833ZM1.77083 13.4583C1.36944 12.1125 0.973958 10.7696 0.584375 9.42969C0.194792 8.08976 0 6.71736 0 5.3125C0 4.22639 0.377778 3.30556 1.13333 2.55C1.88889 1.79444 2.80972 1.41667 3.89583 1.41667H7.4375C7.77986 0.968055 8.19601 0.619792 8.68594 0.371875C9.17587 0.123958 9.70417 0 10.2708 0C10.566 0 10.8168 0.103299 11.0234 0.309896C11.23 0.516493 11.3333 0.767361 11.3333 1.0625C11.3333 1.13333 11.3245 1.20417 11.3068 1.275C11.2891 1.34583 11.2684 1.41076 11.2448 1.46979C11.1976 1.59965 11.1533 1.73247 11.112 1.86823C11.0707 2.00399 11.0382 2.14271 11.0146 2.28437L12.626 3.89583H14.1667V8.83646L12.1656 9.49167L10.9792 13.4583H7.08333V12.0417H5.66667V13.4583H1.77083ZM2.83333 12.0417H4.25V10.625H8.5V12.0417H9.91667L11.0146 8.39375L12.75 7.80937V5.3125H12.0417L9.5625 2.83333C9.5625 2.59722 9.57726 2.36997 9.60677 2.15156C9.63628 1.93316 9.68056 1.71181 9.73958 1.4875C9.39722 1.58194 9.09618 1.74427 8.83646 1.97448C8.57674 2.20469 8.38785 2.49097 8.26979 2.83333H3.89583C3.21111 2.83333 2.62674 3.07535 2.14271 3.55938C1.65868 4.0434 1.41667 4.62778 1.41667 5.3125C1.41667 6.46944 1.57604 7.59983 1.89479 8.70365C2.21354 9.80747 2.52639 10.9201 2.83333 12.0417Z"
        fill="#E8531D"
      />
    </Svg>
  );
}

/** Thin hand-drawn tick used in the plan feature lists (orange on light cards, peach on the dark card). */
export function PlanTickIcon({ onDark = false, ...props }: Props & { onDark?: boolean }) {
  return (
    <Svg width={16} height={25.59} viewBox="0 0 16 25.59" {...props}>
      <path
        d="M10.3984 0.320312C7.85156 3.95573 5.23438 7.32031 2.54688 10.4141C2.34375 10.6484 2.16667 10.7656 2.01562 10.7656C1.84375 10.7656 1.53385 10.3125 1.08594 9.40625C0.361979 7.94271 0 7.06771 0 6.78125C0 6.67708 0.0703125 6.55469 0.210938 6.41406C0.513021 6.09635 0.726562 5.9375 0.851562 5.9375C0.966146 5.9375 1.08854 6.11979 1.21875 6.48438C1.5625 7.41146 1.92448 8.23698 2.30469 8.96094C4.9401 6.29427 7.54688 3.30729 10.125 0L10.3984 0.320312Z"
        fill={onDark ? "#FFB394" : "#E8531D"}
      />
    </Svg>
  );
}

/** White tick inside the orange circle ("Every theme includes"). */
export function SmallTickIcon(props: Props) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" {...props}>
      <path d="M3.5 7.29167L5.83333 9.625L10.5 4.375" stroke="white" strokeWidth={1.86667} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Arrow on "Contact support", "Create my free website" (17px) and "Upgrade to Pro" (16px). */
export function ArrowIcon({ size = 17, ...props }: Props & { size?: 16 | 17 }) {
  if (size === 16) {
    return (
      <Svg width={16} height={16} viewBox="0 0 16 16" {...props}>
        <path d="M8.66667 4.66667L12 8M12 8L8.66667 11.3333M12 8H4" stroke="currentColor" strokeWidth={1.33333} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={17} height={17} viewBox="0 0 17 17" {...props}>
      <path d="M3.54167 8.5H12.75M9.20833 12.0417L12.75 8.5L9.20833 4.95833" stroke="currentColor" strokeWidth={1.275} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Padlock: 10px white (PRO badges), 12px gold (Upgrade buttons), 20px gold (Pro banner). */
export function PadlockIcon({ size = 10, ...props }: Props & { size?: 10 | 12 | 20 }) {
  const fill = size === 10 ? "white" : "#FCD34D";
  if (size === 20) {
    return (
      <Svg width={20} height={20} viewBox="0 0 20 20" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" fill={fill} d="M5 9V7C5 4.24042 7.24043 2 10 2C12.7596 2 15 4.24042 15 7V9C16.1046 9 17 9.89543 17 11V16C17 17.1038 16.1038 18 15 18H5C3.89617 18 3 17.1038 3 16V11C3 9.89617 3.89617 9 5 9ZM13 7V9H7V7C7 5.34425 8.34425 4 10 4C11.6557 4 13 5.34425 13 7Z" />
      </Svg>
    );
  }
  if (size === 12) {
    return (
      <Svg width={12} height={12} viewBox="0 0 12 12" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" fill={fill} d="M3 5.4V4.2C3 2.54425 4.34426 1.2 6 1.2C7.65575 1.2 9 2.54425 9 4.2V5.4C9.66274 5.4 10.2 5.93726 10.2 6.6V9.6C10.2 10.2627 9.66274 10.8 9 10.8H3C2.33726 10.8 1.8 10.2627 1.8 9.6V6.6C1.8 5.93726 2.33726 5.4 3 5.4ZM7.8 4.2V5.4H4.2V4.2C4.2 3.20655 5.00655 2.4 6 2.4C6.99345 2.4 7.8 3.20655 7.8 4.2Z" />
      </Svg>
    );
  }
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" fill={fill} d="M2.5 4.5V3.5C2.5 2.12021 3.62021 1 5 1C6.37979 1 7.5 2.12021 7.5 3.5V4.5C8.05228 4.5 8.5 4.94772 8.5 5.5V8C8.5 8.55192 8.05192 9 7.5 9H2.5C1.94808 9 1.5 8.55192 1.5 8V5.5C1.5 4.94808 1.94808 4.5 2.5 4.5ZM6.5 3.5V4.5H3.5V3.5C3.5 2.67213 4.17213 2 5 2C5.82787 2 6.5 2.67213 6.5 3.5Z" />
    </Svg>
  );
}
