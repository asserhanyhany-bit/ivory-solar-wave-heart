import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as INTEREST_CHIPS } from "./router-DXpLOQFc.mjs";
import { n as Wordmark, r as cn, t as BoothShell } from "./wordmark-HT-qZO5w.mjs";
import { a as setAgeConfirm, c as stashInterests, r as hasAgeConfirm, t as Button } from "./storage-DMvxP00p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CZK72cOn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const navigate = useNavigate();
	const [chips, setChips] = (0, import_react.useState)([]);
	const [age, setAge] = (0, import_react.useState)(false);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setAge(hasAgeConfirm());
		setHydrated(true);
	}, []);
	function toggleChip(chip) {
		setChips((prev) => {
			if (chip === "random") return prev.includes("random") ? [] : ["random"];
			const withoutRandom = prev.filter((c) => c !== "random");
			return withoutRandom.includes(chip) ? withoutRandom.filter((c) => c !== chip) : [...withoutRandom, chip];
		});
	}
	function start() {
		if (!age) return;
		setAgeConfirm(true);
		stashInterests(chips);
		navigate({ to: "/chat" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoothShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative mx-auto flex min-h-dvh max-w-3xl flex-col px-5 pb-10 pt-8 sm:px-8 sm:pt-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-medium uppercase tracking-[0.22em]",
					children: "Live booth"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/rules",
					className: "min-h-11 inline-flex items-center text-sm text-muted hover:text-warm",
					children: "Rules"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex flex-1 flex-col items-center justify-center py-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "glow-orb h-56 w-56 sm:h-72 sm:w-72",
						"aria-hidden": true,
						style: {
							top: "18%",
							left: "50%",
							marginLeft: "-7rem"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "stagger-in relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan",
								children: "On air · anonymous"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { size: "hero" }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-6 text-lg text-muted text-pretty sm:text-xl",
								children: "Talk to a stranger. Stay a stranger."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-12 w-full max-w-md stagger-in",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-left text-xs uppercase tracking-[0.18em] text-dim",
								children: "Optional interests"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: INTEREST_CHIPS.map((chip) => {
									const on = chips.includes(chip);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"data-on": on,
										onClick: () => toggleChip(chip),
										className: cn("h-11 rounded-full px-4 text-sm capitalize transition-[background-color,color,box-shadow] duration-150", "bg-ink text-muted shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_10%,transparent)]", "hover:text-warm", "data-[on=true]:bg-violet/20 data-[on=true]:text-warm data-[on=true]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-violet)_70%,transparent)]"),
										children: chip
									}, chip);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-8 flex min-h-11 cursor-pointer items-start gap-3 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "relative mt-0.5 size-5 shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: age,
											onChange: (e) => {
												setAge(e.target.checked);
												setAgeConfirm(e.target.checked);
											},
											className: "peer absolute inset-0 z-10 cursor-pointer opacity-0"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none block size-5 rounded-[4px] border border-warm/25 bg-ink peer-checked:border-violet peer-checked:bg-violet peer-focus-visible:ring-2 peer-focus-visible:ring-violet/70" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute left-[5px] top-[2px] hidden size-2 rotate-45 border-b-2 border-r-2 border-warm peer-checked:block" })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm leading-snug text-muted",
									children: "I confirm I am 18 or older. No minors. No exceptions."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "xl",
								className: "mt-6 w-full font-semibold tracking-wide",
								disabled: !hydrated || !age,
								onClick: start,
								children: "Start chatting"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-dim",
								children: "No accounts. No video. Messages vanish when you leave."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex flex-col gap-2 text-center text-xs text-dim sm:flex-row sm:items-center sm:justify-between sm:text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Open a second tab to test matching." }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/rules",
						className: "hover:text-warm",
						children: "House rules"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-2 text-line",
						children: "·"
					}),
					"18+ only"
				] })]
			})
		]
	}) });
}
//#endregion
export { Home as component };
