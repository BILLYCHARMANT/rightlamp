import type { ReactNode } from "react";



export type DashboardGridGradient =

  | "neutral"

  | "warm"

  | "cool"

  | "slate"

  | "lavender";



export const dashboardCardShellClass = "dash-grid-box";



const gradientClass: Record<DashboardGridGradient, string> = {

  neutral:

    "bg-gradient-to-b from-white via-slate-50/90 to-slate-100",

  warm:

    "bg-gradient-to-b from-white via-orange-50 to-orange-100/85",

  cool:

    "bg-gradient-to-b from-white via-sky-50 to-sky-100/80",

  slate:

    "bg-gradient-to-b from-white via-slate-100/70 to-slate-200/55",

  lavender:

    "bg-gradient-to-b from-white via-indigo-50/80 to-indigo-100/45",

};



type DashboardGridBoxProps = {

  children: ReactNode;

  className?: string;

  gradient?: DashboardGridGradient;

  as?: "article" | "section" | "div";

};



export function dashboardGridBoxClass(

  gradient: DashboardGridGradient = "neutral",

  className = "",

) {

  return `${dashboardCardShellClass} ${gradientClass[gradient]} ${className}`;

}



export function DashboardGridBox({

  children,

  className = "",

  gradient = "neutral",

  as: Tag = "div",

}: DashboardGridBoxProps) {

  return (

    <Tag className={dashboardGridBoxClass(gradient, className)}>{children}</Tag>

  );

}

