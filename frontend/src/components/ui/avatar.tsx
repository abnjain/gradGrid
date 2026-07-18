import React from "react";
import { cn } from "@/lib/utils";
import type { AvatarSize, AvatarColor } from "@/types";

const sizeMap: Record<AvatarSize, { class: string; fontSize: string }> = {
  xs: { class: "w-6 h-6", fontSize: "text-[9px]" },
  sm: { class: "w-7 h-7", fontSize: "text-[10px]" },
  md: { class: "w-9 h-9", fontSize: "text-[13px]" },
  lg: { class: "w-11 h-11", fontSize: "text-[15px]" },
  xl: { class: "w-14 h-14", fontSize: "text-[18px]" },
  "2xl": { class: "w-[72px] h-[72px]", fontSize: "text-[22px]" },
  "3xl": { class: "w-24 h-24", fontSize: "text-[28px]" },
};

const colorMap: Record<AvatarColor, string> = {
  teal: "bg-av-teal-bg text-av-teal",
  amber: "bg-av-amber-bg text-av-amber",
  rose: "bg-av-rose-bg text-av-rose",
  violet: "bg-av-violet-bg text-av-violet",
  sky: "bg-av-sky-bg text-av-sky",
  lime: "bg-av-lime-bg text-av-lime",
  orange: "bg-av-orange-bg text-av-orange",
  slate: "bg-av-slate-bg text-av-slate",
};

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: AvatarSize;
  color?: AvatarColor;
  status?: "online" | "away" | "offline";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function hashColor(name: string): AvatarColor {
  const colors: AvatarColor[] = ["teal", "amber", "rose", "violet", "sky", "lime", "orange", "slate"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const statusMap: Record<string, string> = {
  online: "bg-success",
  away: "bg-accent",
  offline: "bg-mist",
};

function Avatar({
  className,
  name,
  src,
  size = "md",
  color,
  status,
  ...props
}: AvatarProps) {
  const avatarColor = color || hashColor(name);
  const sizeClass = sizeMap[size];

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full font-display font-bold overflow-hidden flex-shrink-0 select-none",
          sizeClass.class,
          sizeClass.fontSize,
          colorMap[avatarColor],
          "tracking-tight",
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover absolute inset-0" />
        ) : (
          getInitials(name)
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface",
            statusMap[status]
          )}
        />
      )}
    </div>
  );
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: { name: string; src?: string; color?: AvatarColor }[];
  max?: number;
  size?: AvatarSize;
}

function AvatarGroup({ avatars, max = 4, size = "md", className, ...props }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={cn("flex items-center", className)} {...props}>
      {visible.map((avatar, i) => (
        <Avatar
          key={i}
          name={avatar.name}
          src={avatar.src}
          color={avatar.color}
          size={size}
          className="border-2 border-surface -ml-2 first:ml-0"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-full font-display font-bold flex-shrink-0 border-2 border-surface bg-surface-raised text-mid",
            sizeMap[size].class,
            "text-[10px] font-bold",
            "-ml-2"
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
