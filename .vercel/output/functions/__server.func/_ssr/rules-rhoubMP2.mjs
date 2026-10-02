import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Wordmark, t as BoothShell } from "./wordmark-HT-qZO5w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rules-rhoubMP2.js
var import_jsx_runtime = require_jsx_runtime();
var RULES = [
	{
		title: "No minors",
		body: "18+ only. If someone seems underage, leave and report. We will not host that conversation."
	},
	{
		title: "No porn",
		body: "This is a text booth, not a cam site. Sexual content involving minors is blocked and ends the chat."
	},
	{
		title: "No scams",
		body: "No Cash App, codes, wallets, or “verify with this.” Solicitations get hidden, then the booth closes."
	},
	{
		title: "No harassment",
		body: "Hate, slurs, and targeted abuse are out. Report once — both sides disconnect."
	},
	{
		title: "Stay a stranger",
		body: "No accounts, no logs kept, no location, no phone, no email. Do not ask for them."
	}
];
function RulesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoothShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {
					size: "md",
					to: "/"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex min-h-11 items-center text-sm text-muted hover:text-warm",
					children: "Back"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-12 font-display text-4xl font-extrabold tracking-[-0.04em] text-balance",
				children: "House rules"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted text-pretty",
				children: "Short, because the booth is. Break them and the line goes dead."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-10 space-y-7",
				children: RULES.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-sm tabular-nums text-violet",
						children: String(i + 1).padStart(2, "0")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium text-warm",
						children: r.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm leading-relaxed text-muted text-pretty",
						children: r.body
					})] })]
				}, r.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-12 text-sm text-dim",
				children: "NIGHTLINE is anonymous 1:1 text. Nothing here is stored after both people leave."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-warm px-6 font-medium text-night",
				children: "Back to the booth"
			})
		]
	}) });
}
//#endregion
export { RulesPage as component };
