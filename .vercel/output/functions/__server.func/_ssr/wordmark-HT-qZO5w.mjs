import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wordmark-HT-qZO5w.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var DROPS = [
	{
		left: "8%",
		delay: "0s",
		dur: "7.2s"
	},
	{
		left: "18%",
		delay: "1.4s",
		dur: "6.4s"
	},
	{
		left: "31%",
		delay: "0.6s",
		dur: "8.1s"
	},
	{
		left: "44%",
		delay: "2.1s",
		dur: "7.6s"
	},
	{
		left: "57%",
		delay: "0.3s",
		dur: "6.8s"
	},
	{
		left: "69%",
		delay: "1.8s",
		dur: "7.9s"
	},
	{
		left: "81%",
		delay: "0.9s",
		dur: "6.2s"
	},
	{
		left: "92%",
		delay: "2.4s",
		dur: "8.4s"
	}
];
function BoothShell({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative min-h-dvh bg-night text-warm overflow-hidden", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,color-mix(in_oklab,var(--color-violet)_18%,transparent),transparent_70%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--color-cyan)_6%,transparent)_48%,transparent)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 hidden sm:block",
				"aria-hidden": true,
				children: DROPS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rain-drop",
					style: {
						left: d.left,
						animationDelay: d.delay,
						animationDuration: d.dur
					}
				}, d.left))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grain",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10",
				children
			})
		]
	});
}
function Wordmark({ size = "md", to }) {
	const cls = cn("font-display font-extrabold tracking-[-0.06em] leading-[0.85] text-warm text-balance", size === "hero" && "text-[clamp(3.4rem,16vw,8.5rem)]", size === "md" && "text-xl", size === "sm" && "text-base tracking-[-0.04em]");
	if (to) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		className: cls,
		children: "NIGHTLINE"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cls,
		children: "NIGHTLINE"
	});
}
//#endregion
export { Wordmark as n, cn as r, BoothShell as t };
