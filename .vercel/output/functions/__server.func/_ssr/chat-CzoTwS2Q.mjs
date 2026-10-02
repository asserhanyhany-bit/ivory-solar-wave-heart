import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as RotateCcw, i as SkipForward, n as Volume2, o as Flag, t as VolumeX } from "../_libs/lucide-react.mjs";
import { a as MUTE_MS, c as TYPING_DEBOUNCE_MS, d as sharesInterest, l as newId, o as RATE_WINDOW_MS, s as REPORT_REASONS, u as normalizeInterests } from "./router-DXpLOQFc.mjs";
import { n as Wordmark, r as cn, t as BoothShell } from "./wordmark-HT-qZO5w.mjs";
import { i as readBlocked, l as takeInterests, n as addBlocked, o as setSoundEnabled, r as hasAgeConfirm, s as soundEnabled, t as Button } from "./storage-DMvxP00p.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-CzoTwS2Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatClock(total) {
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}
function Bubble({ msg }) {
	const mine = msg.from === "me";
	const [showTs, setShowTs] = (0, import_react.useState)(false);
	const hide = (0, import_react.useRef)(null);
	function reveal() {
		setShowTs(true);
		if (hide.current) clearTimeout(hide.current);
		hide.current = setTimeout(() => setShowTs(false), 1600);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex bubble-in", mine ? "justify-end" : "justify-start"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: reveal,
			onMouseEnter: () => setShowTs(true),
			onMouseLeave: () => setShowTs(false),
			className: cn("max-w-[min(78%,28rem)] rounded-2xl px-3.5 py-2.5 text-left text-[15px] leading-snug text-pretty", mine ? "rounded-br-md bg-violet text-warm" : "rounded-bl-md bg-ink text-warm shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_8%,transparent)]", msg.hidden && "opacity-50"),
			children: [
				msg.hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "italic text-warm/70",
					children: "Message hidden"
				}) : msg.text,
				msg.status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block text-[11px] text-warm/80",
					children: "Failed to send"
				}) : null,
				showTs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block text-[10px] uppercase tracking-wide text-warm/55",
					children: new Date(msg.ts).toLocaleTimeString([], {
						hour: "numeric",
						minute: "2-digit"
					})
				}) : null
			]
		})
	});
}
function ChatView({ messages, partnerTyping, partnerInterests, isDemo, warning, mutedUntil, matchElapsed, soundOn, unread, onSend, onRetry, onSkip, onReport, onTyping, onSound, onSticky }) {
	const [draft, setDraft] = (0, import_react.useState)("");
	const [skipOpen, setSkipOpen] = (0, import_react.useState)(false);
	const [reportOpen, setReportOpen] = (0, import_react.useState)(false);
	const [now, setNow] = (0, import_react.useState)(Date.now());
	const scroller = (0, import_react.useRef)(null);
	const composer = (0, import_react.useRef)(null);
	const bottom = (0, import_react.useRef)(null);
	const muted = mutedUntil > now;
	const mutedLeft = Math.max(0, Math.ceil((mutedUntil - now) / 1e3));
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setNow(Date.now()), 250);
		return () => clearInterval(t);
	}, []);
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (!el) return;
		const onScroll = () => {
			onSticky(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
		};
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, [onSticky]);
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (!el) return;
		if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) bottom.current?.scrollIntoView({ block: "end" });
	}, [messages, partnerTyping]);
	(0, import_react.useEffect)(() => {
		const vv = window.visualViewport;
		if (!vv) return;
		const sync = () => {
			document.documentElement.style.setProperty("--kb", `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`);
		};
		sync();
		vv.addEventListener("resize", sync);
		vv.addEventListener("scroll", sync);
		return () => {
			vv.removeEventListener("resize", sync);
			vv.removeEventListener("scroll", sync);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			const tag = e.target?.tagName;
			const typingField = tag === "TEXTAREA" || tag === "INPUT";
			if (e.key === "/" && !typingField && !e.metaKey && !e.ctrlKey) {
				e.preventDefault();
				composer.current?.focus();
			}
			if (e.key === "Escape") {
				if (reportOpen) {
					setReportOpen(false);
					return;
				}
				if (onSkip() === "confirm") setSkipOpen(true);
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onSkip, reportOpen]);
	function submit(e) {
		e?.preventDefault();
		if (muted) return;
		if (onSend(draft)) {
			setDraft("");
			if (composer.current) composer.current.style.height = "auto";
		}
	}
	function onComposerKey(e) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	}
	function resize(el) {
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
	}
	function requestSkip() {
		if (onSkip() === "confirm") setSkipOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col",
		style: { paddingBottom: "var(--kb, 0px)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-14 shrink-0 items-center gap-2 border-b border-line px-3 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {
					size: "sm",
					to: "/"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": soundOn ? "Mute sounds" : "Enable sounds",
							onClick: () => onSound(!soundOn),
							className: "inline-flex size-11 items-center justify-center rounded-lg text-muted hover:text-warm",
							children: soundOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/rules",
							className: "hidden size-11 items-center justify-center rounded-lg text-xs text-muted hover:text-warm sm:inline-flex",
							children: "Rules"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setReportOpen(true),
							className: "inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm text-muted hover:text-danger",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Report"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "min-w-11",
							onClick: requestSkip,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-4" }), "Skip"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex min-w-0 flex-1 flex-col",
					children: [
						warning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-b border-danger/30 bg-danger/10 px-4 py-2 text-center text-sm text-danger",
							children: warning
						}) : null,
						isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-b border-cyan/25 bg-cyan/10 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.16em] text-cyan",
							children: "Demo · not a real person"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: scroller,
							className: "min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8",
							children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pt-16 text-center text-sm text-dim",
								children: "Say hello. Or don’t."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-auto flex max-w-2xl flex-col gap-2.5",
								children: [
									messages.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bubble, { msg }), msg.status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => onRetry(msg.id),
											className: "absolute -bottom-1 right-1 inline-flex h-8 items-center gap-1 rounded-full bg-ink px-2 text-[11px] text-warm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3" }), "Retry"]
										}) : null]
									}, msg.id)),
									partnerTyping ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "pl-1 text-xs text-muted",
										children: "Stranger is typing…"
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottom })
								]
							})
						}),
						unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-center pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									onSticky(true);
									bottom.current?.scrollIntoView({ block: "end" });
								},
								className: "h-9 rounded-full bg-violet px-3 text-xs font-medium text-warm",
								children: "New messages"
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: submit,
							className: "shrink-0 border-t border-line bg-night/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6",
							children: [
								muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mb-2 text-center text-xs text-muted",
									children: [
										"Slow down — muted ",
										mutedLeft,
										"s"
									]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mx-auto flex max-w-2xl items-end gap-2 rounded-xl bg-ink p-2 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_10%,transparent)]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										ref: composer,
										rows: 1,
										value: draft,
										maxLength: 500,
										disabled: muted,
										placeholder: "Say something",
										onChange: (e) => {
											setDraft(e.target.value);
											resize(e.target);
											onTyping();
										},
										onKeyDown: onComposerKey,
										className: "max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[16px] leading-snug text-warm outline-none placeholder:text-dim"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										size: "md",
										variant: "violet",
										disabled: muted || !draft.trim(),
										children: "Send"
									})]
								}),
								draft.length > 400 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-right text-[11px] tabular-nums text-dim",
									children: [
										draft.length,
										"/",
										500
									]
								}) : null
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden w-64 shrink-0 flex-col border-l border-line bg-ink/40 p-5 lg:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.2em] text-dim",
							children: "In the booth"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-display text-2xl font-bold tracking-[-0.03em]",
							children: isDemo ? "DEMO" : "Stranger"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 flex items-center gap-2 text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", isDemo ? "bg-cyan" : "bg-cyan") }), isDemo ? "Scripted partner" : "Connected"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-mono text-sm tabular-nums text-dim",
							children: formatClock(matchElapsed)
						}),
						partnerInterests.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 flex flex-wrap gap-1.5",
							children: partnerInterests.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-booth px-2.5 py-1 text-[11px] capitalize text-muted",
								children: tag
							}, tag))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 text-xs text-dim",
							children: "No shared tags. That’s fine."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-auto pt-8 text-xs leading-relaxed text-dim",
							children: "They don’t have a name. Don’t ask for one you wouldn’t give."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: skipOpen,
				onOpenChange: setSkipOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-night/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "fixed left-1/2 top-1/2 z-50 w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-booth p-6 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_12%,transparent)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display text-xl font-bold tracking-[-0.03em]",
							children: "Skip this stranger?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "mt-2 text-sm text-muted",
							children: "You’ve been talking. Skip ends the booth immediately."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setSkipOpen(false),
								children: "Stay"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "violet",
								onClick: () => {
									setSkipOpen(false);
									onSkip(true);
								},
								children: "Skip"
							})]
						})
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: reportOpen,
				onOpenChange: setReportOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-night/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "fixed left-1/2 top-1/2 z-50 w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-booth p-6 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-warm)_12%,transparent)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display text-xl font-bold tracking-[-0.03em]",
							children: "Report stranger"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "mt-2 text-sm text-muted",
							children: "One tap. Both sides disconnect. They won’t match you again here."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: REPORT_REASONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => {
									setReportOpen(false);
									onReport(r.id);
								},
								children: r.label
							}, r.id))
						})
					]
				})] })
			})
		]
	});
}
var COPY = {
	partner_left: {
		title: "They left the booth.",
		body: "The other side went quiet. The room is gone."
	},
	skipped: {
		title: "You skipped.",
		body: "Line cleared. Someone else is out there."
	},
	reported: {
		title: "Reported. They’re gone.",
		body: "You won’t be matched with them in this browser."
	},
	reported_you: {
		title: "You were disconnected.",
		body: "The other person reported this chat. The booth closed."
	},
	left: {
		title: "You left.",
		body: "The stranger was released. No transcript remains."
	},
	strikes: {
		title: "Chat ended.",
		body: "Too many blocked messages. Find a cleaner booth."
	}
};
function EndView({ reason, onAgain, onHome }) {
	const copy = COPY[reason];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "px-5 py-4 sm:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {
				size: "md",
				to: "/"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col items-center justify-center px-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.22em] text-dim",
					children: "Line dead"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 max-w-md font-display text-4xl font-extrabold tracking-[-0.04em] text-balance sm:text-5xl",
					children: copy.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-sm text-muted text-pretty",
					children: copy.body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 flex w-full max-w-xs flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full font-semibold",
						onClick: onAgain,
						children: "Find someone new"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "lg",
						className: "w-full",
						onClick: onHome,
						children: "Back home"
					})]
				})
			]
		})]
	});
}
function SearchingView({ elapsed, onCancel, onDemo }) {
	const still = elapsed >= 4;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between px-5 py-4 sm:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {
					size: "md",
					to: "/"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onCancel,
					className: "inline-flex h-11 items-center text-sm text-muted hover:text-warm",
					children: "Cancel"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center justify-center px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mb-10 size-28",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "search-ring" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "search-ring" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "search-ring" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-8 rounded-full bg-violet/30 blur-md" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-[42%] rounded-full bg-cyan" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl",
						children: still ? "Still looking…" : "Looking for a stranger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 tabular-nums text-sm text-muted",
						children: [elapsed, "s in the queue"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-sm text-sm text-dim text-pretty",
						children: still ? "Waiting for a stranger. Open a second tab to test matching." : "Matching the oldest person in line. Interest overlap is a bonus, never a gate."
					}),
					still ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "mt-8",
						onClick: onDemo,
						children: "Try a local demo"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-6 pb-8 text-center text-xs text-dim",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/rules",
						className: "hover:text-warm",
						children: "Rules"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-2",
						children: "·"
					}),
					"Demo replies are labeled so they are never mistaken for a person."
				]
			})
		]
	});
}
async function postLine(op, signal) {
	const res = await fetch("/api/line", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(op),
		signal,
		keepalive: op.op === "leave" || op.op === "skip" || op.op === "report" || op.op === "cancel"
	});
	if (!res.ok) {
		const err = /* @__PURE__ */ new Error(`line ${res.status}`);
		err.status = res.status;
		throw err;
	}
	return await res.json();
}
var NightlineClient = class {
	id;
	interests;
	blocked;
	lastPartnerId;
	handlers;
	ac = new AbortController();
	bc = null;
	waitTimer = null;
	pollLoop = null;
	stopped = false;
	searchingSince = Date.now();
	localWaiters = /* @__PURE__ */ new Map();
	transport = null;
	roomId = null;
	partnerId = null;
	constructor(opts) {
		this.id = newId();
		this.interests = normalizeInterests(opts.interests);
		this.blocked = opts.blocked;
		this.lastPartnerId = opts.lastPartnerId;
		this.handlers = opts.handlers;
	}
	async start() {
		this.searchingSince = Date.now();
		this.openBroadcast();
		try {
			const res = await postLine({
				op: "join",
				id: this.id,
				interests: this.interests,
				lastPartnerId: this.lastPartnerId,
				blocked: this.blocked
			}, this.ac.signal);
			this.ingest(res.events, "server");
		} catch {}
		this.pollLoop = this.runPoll();
	}
	stop() {
		if (this.stopped) return;
		this.stopped = true;
		this.ac.abort();
		if (this.waitTimer) clearInterval(this.waitTimer);
		this.bcPost({
			t: "gone",
			id: this.id
		});
		if (this.roomId && this.transport === "local") this.bcPost({
			t: "ended",
			roomId: this.roomId,
			from: this.id,
			reason: "left"
		});
		this.bc?.close();
		this.bc = null;
		postLine({
			op: "leave",
			id: this.id
		}).catch(() => {});
		try {
			navigator.sendBeacon?.("/api/line", new Blob([JSON.stringify({
				op: "leave",
				id: this.id
			})], { type: "application/json" }));
		} catch {}
	}
	async send(msgId, text) {
		if (this.transport === "local" && this.roomId && this.partnerId) {
			const ts = Date.now();
			this.bcPost({
				t: "msg",
				roomId: this.roomId,
				from: this.id,
				id: msgId,
				text,
				ts
			});
			this.handlers.onAck(msgId);
			return;
		}
		if (!this.roomId || this.transport !== "server") {
			this.handlers.onNack(msgId, "no room");
			return;
		}
		try {
			const res = await postLine({
				op: "send",
				id: this.id,
				roomId: this.roomId,
				msgId,
				text
			});
			this.ingest(res.events, "server");
		} catch {
			this.handlers.onNack(msgId, "network");
		}
	}
	typing(on) {
		if (this.transport === "local" && this.roomId) {
			this.bcPost({
				t: "typing",
				roomId: this.roomId,
				from: this.id,
				on
			});
			return;
		}
		if (this.transport === "server" && this.roomId) postLine({
			op: "typing",
			id: this.id,
			roomId: this.roomId,
			on
		}).catch(() => {});
	}
	skip() {
		this.disconnectPartner("partner_left");
	}
	report(reason) {
		this.disconnectPartner("reported_you", reason);
		this.handlers.onEnded("reported", this.partnerId ?? void 0);
	}
	disconnectPartner(reasonForOther, reportReason) {
		const roomId = this.roomId;
		const transport = this.transport;
		this.roomId = null;
		this.transport = null;
		if (transport === "local" && roomId) this.bcPost({
			t: "ended",
			roomId,
			from: this.id,
			reason: reasonForOther
		});
		if (transport === "server" && roomId) postLine(reportReason ? {
			op: "report",
			id: this.id,
			roomId,
			reason: reportReason
		} : {
			op: "skip",
			id: this.id,
			roomId
		}).catch(() => {});
	}
	async runPoll() {
		while (!this.stopped) {
			if (this.transport === "local") {
				await sleep(1200, this.ac.signal);
				continue;
			}
			try {
				const res = await postLine({
					op: "poll",
					id: this.id
				}, this.ac.signal);
				if (this.stopped) return;
				if (res.status === "idle" && !this.transport) await postLine({
					op: "join",
					id: this.id,
					interests: this.interests,
					lastPartnerId: this.lastPartnerId,
					blocked: this.blocked
				}).catch(() => {});
				this.ingest(res.events, "server");
			} catch (err) {
				if (this.stopped || this.ac.signal.aborted) return;
				await sleep(700, this.ac.signal);
			}
		}
	}
	ingest(events, source) {
		for (const ev of events) if (ev.t === "matched") {
			if (this.transport && this.transport !== source) {
				if (source === "server") postLine({
					op: "skip",
					id: this.id,
					roomId: ev.roomId
				}).catch(() => {});
				continue;
			}
			this.acceptMatch(ev.roomId, ev.partnerId, ev.interests, source);
		} else if (ev.t === "msg") {
			if (this.transport !== source && source === "server") continue;
			this.handlers.onMessage({
				id: ev.id,
				from: "them",
				text: ev.text,
				ts: ev.ts
			});
		} else if (ev.t === "ack") this.handlers.onAck(ev.id);
		else if (ev.t === "nack") this.handlers.onNack(ev.id, ev.error);
		else if (ev.t === "typing") this.handlers.onTyping(ev.on);
		else if (ev.t === "ended") {
			if (this.transport === "local" && source === "server") continue;
			this.roomId = null;
			this.transport = null;
			this.handlers.onEnded(ev.reason, ev.partnerId);
		}
	}
	acceptMatch(roomId, partnerId, interests, transport) {
		this.transport = transport;
		this.roomId = roomId;
		this.partnerId = partnerId;
		this.lastPartnerId = partnerId;
		if (transport === "local") {
			postLine({
				op: "cancel",
				id: this.id
			}).catch(() => {});
			this.bcPost({
				t: "gone",
				id: this.id
			});
		} else this.bcPost({
			t: "gone",
			id: this.id
		});
		this.handlers.onMatched({
			roomId,
			partnerId,
			interests,
			transport
		});
	}
	openBroadcast() {
		if (typeof BroadcastChannel === "undefined") return;
		this.bc = new BroadcastChannel("nightline");
		this.bc.onmessage = (ev) => this.onBc(ev.data);
		this.announceWait();
		this.waitTimer = setInterval(() => {
			if (!this.transport) this.announceWait();
		}, 900);
	}
	announceWait() {
		this.bcPost({
			t: "wait",
			id: this.id,
			interests: this.interests,
			lastPartnerId: this.lastPartnerId,
			blocked: this.blocked,
			at: this.searchingSince
		});
	}
	onBc(msg) {
		if (!msg || this.stopped) return;
		if (msg.t === "wait") {
			if (msg.id === this.id) return;
			this.localWaiters.set(msg.id, msg);
			this.maybeLocalPair(msg);
		} else if (msg.t === "gone") this.localWaiters.delete(msg.id);
		else if (msg.t === "pair") {
			if (this.transport) return;
			const other = msg.a === this.id ? msg.b : msg.b === this.id ? msg.a : null;
			if (!other) return;
			const interests = msg.a === this.id ? msg.interestsB : msg.interestsA;
			this.acceptMatch(msg.roomId, other, interests, "local");
		} else if (msg.t === "msg") {
			if (this.transport !== "local" || msg.roomId !== this.roomId || msg.from === this.id) return;
			this.handlers.onMessage({
				id: msg.id,
				from: "them",
				text: msg.text,
				ts: msg.ts
			});
			this.bcPost({
				t: "ack",
				roomId: msg.roomId,
				id: msg.id,
				to: msg.from
			});
		} else if (msg.t === "ack") {
			if (msg.to === this.id) this.handlers.onAck(msg.id);
		} else if (msg.t === "typing") {
			if (this.transport !== "local" || msg.roomId !== this.roomId || msg.from === this.id) return;
			this.handlers.onTyping(msg.on);
		} else if (msg.t === "ended") {
			if (this.transport !== "local" || msg.roomId !== this.roomId || msg.from === this.id) return;
			this.roomId = null;
			this.transport = null;
			this.handlers.onEnded(msg.reason, msg.from);
		}
	}
	maybeLocalPair(them) {
		if (this.transport || this.stopped) return;
		if (them.blocked.includes(this.id) || this.blocked.includes(them.id)) return;
		const elapsed = Date.now() - this.searchingSince;
		const themElapsed = Date.now() - them.at;
		if (!(elapsed >= 4e3 || themElapsed >= 4e3) && (them.id === this.lastPartnerId || them.lastPartnerId === this.id)) return;
		if (!sharesInterest(this.interests, them.interests) && !(elapsed >= 3e3 || themElapsed >= 3e3)) return;
		if (this.id < them.id) {
			const roomId = `l-${this.id.slice(0, 8)}-${them.id.slice(0, 8)}`;
			this.bcPost({
				t: "pair",
				roomId,
				a: this.id,
				b: them.id,
				interestsA: this.interests,
				interestsB: them.interests
			});
			this.acceptMatch(roomId, them.id, them.interests, "local");
		}
	}
	bcPost(msg) {
		try {
			this.bc?.postMessage(msg);
		} catch {}
	}
};
function sleep(ms, signal) {
	return new Promise((resolve) => {
		if (signal?.aborted) {
			resolve();
			return;
		}
		const t = setTimeout(resolve, ms);
		signal?.addEventListener("abort", () => {
			clearTimeout(t);
			resolve();
		}, { once: true });
	});
}
var OPENERS = ["Demo mode. I'm a script, not a person.", "This booth is a local demo — not a stranger."];
var LINES = [
	"Open a second tab if you want a real match.",
	"The rain sounds louder after midnight.",
	"I only know a handful of lines. That's the point.",
	"Ask me anything. I'll still be a demo.",
	"Still here. Still labeled DEMO.",
	"If this feels empty, find a real stranger.",
	"Late night radio energy, zero human on the other end."
];
function demoReply(turn, _userText) {
	if (turn <= 1) return OPENERS[Math.min(turn, OPENERS.length - 1)] ?? OPENERS[0];
	return LINES[(turn + _userText.length) % LINES.length] ?? LINES[0];
}
function demoDelay() {
	return 700 + Math.floor(Math.random() * 1100);
}
var SLUR = /\b(nigg(?:a|er)s?|fag(?:got)?s?|kikes?|spics?|chinks?|trann(?:y|ies)|retards?)\b/i;
var SCAM = /\b(cash\s*app|what's your cashapp|whats your cashapp|venmo|zelle|gift\s*cards?|verify (?:with )?code|send(?: me)? (?:the )?code|crypto\s*wallet|seed phrase|telegram\.me|wa\.me|whatsapp me)\b/i;
var SEXUAL = /\b(sex|sexy|nude|nudes|naked|horny|send pics?|dick pic|onlyfans)\b/i;
var MINOR = /\b(little (?:girl|boy)s?|underage|schoolgirl|schoolboy|\b(?:1[0-7]|[8-9])\s*(?:y\/o|yo|years? old)|are you (?:1[0-7]|[8-9])\b)\b/i;
function scanMessage(text) {
	const t = text.trim();
	if (!t) return null;
	if (SLUR.test(t)) return "slur";
	if (SCAM.test(t)) return "scam";
	if (SEXUAL.test(t) && MINOR.test(t)) return "minor";
	if (/\b(any kids|you a minor|are you under)\b/i.test(t) && SEXUAL.test(t)) return "minor";
	return null;
}
function warningCopy(hit) {
	if (hit === "minor") return "That message was blocked. This booth is 18+ only.";
	if (hit === "scam") return "That looks like a scam. Message hidden.";
	if (hit === "slur") return "Keep it clean. One more strike ends the chat.";
	return "Message hidden. One more strike ends the chat.";
}
var ctx = null;
function audio() {
	if (typeof window === "undefined") return null;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return null;
	ctx ??= new AC();
	if (ctx.state === "suspended") ctx.resume();
	return ctx;
}
function beep(freq, duration, gain = .05, type = "sine") {
	const ac = audio();
	if (!ac) return;
	const osc = ac.createOscillator();
	const g = ac.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	g.gain.setValueAtTime(gain, ac.currentTime);
	g.gain.exponentialRampToValueAtTime(8e-4, ac.currentTime + duration);
	osc.connect(g);
	g.connect(ac.destination);
	osc.start();
	osc.stop(ac.currentTime + duration);
}
function tickMatch() {
	beep(520, .07, .04, "triangle");
	window.setTimeout(() => beep(780, .09, .045, "triangle"), 70);
}
function tickIncoming() {
	beep(440, .05, .035, "sine");
}
function useNightline(interests) {
	const [phase, setPhase] = (0, import_react.useState)("searching");
	const [endReason, setEndReason] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [partnerTyping, setPartnerTyping] = (0, import_react.useState)(false);
	const [partnerInterests, setPartnerInterests] = (0, import_react.useState)([]);
	const [isDemo, setIsDemo] = (0, import_react.useState)(false);
	const [warning, setWarning] = (0, import_react.useState)(null);
	const [mutedUntil, setMutedUntil] = (0, import_react.useState)(0);
	const [searchElapsed, setSearchElapsed] = (0, import_react.useState)(0);
	const [matchElapsed, setMatchElapsed] = (0, import_react.useState)(0);
	const [soundOn, setSoundOnState] = (0, import_react.useState)(false);
	const [unread, setUnread] = (0, import_react.useState)(0);
	const [searchKey, setSearchKey] = (0, import_react.useState)(0);
	const clientRef = (0, import_react.useRef)(null);
	const lastPartnerRef = (0, import_react.useRef)(null);
	const strikesRef = (0, import_react.useRef)(0);
	const warnedRef = (0, import_react.useRef)(false);
	const stickyRef = (0, import_react.useRef)(true);
	const matchAtRef = (0, import_react.useRef)(null);
	const searchAtRef = (0, import_react.useRef)(Date.now());
	const typingIdleRef = (0, import_react.useRef)(null);
	const partnerTypeHideRef = (0, import_react.useRef)(null);
	const demoTimerRef = (0, import_react.useRef)(null);
	const demoTurnRef = (0, import_react.useRef)(0);
	const rateRef = (0, import_react.useRef)([]);
	const soundRef = (0, import_react.useRef)(false);
	const phaseRef = (0, import_react.useRef)("searching");
	const demoRef = (0, import_react.useRef)(false);
	const ignoreEndedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		setSoundOnState(soundEnabled());
		soundRef.current = soundEnabled();
	}, []);
	const setSoundOn = (0, import_react.useCallback)((on) => {
		soundRef.current = on;
		setSoundOnState(on);
		setSoundEnabled(on);
	}, []);
	const clearDemoTimer = () => {
		if (demoTimerRef.current) {
			clearTimeout(demoTimerRef.current);
			demoTimerRef.current = null;
		}
	};
	const goEnded = (0, import_react.useCallback)((reason, partnerId) => {
		if (phaseRef.current === "ended") return;
		phaseRef.current = "ended";
		setPhase("ended");
		setEndReason(reason);
		setPartnerTyping(false);
		if (partnerId) lastPartnerRef.current = partnerId;
		if (reason === "reported" && partnerId) addBlocked(partnerId);
		clearDemoTimer();
		clientRef.current?.stop();
		clientRef.current = null;
	}, []);
	(0, import_react.useEffect)(() => {
		if (demoRef.current) return;
		let active = true;
		let client = null;
		let minSearch = null;
		let pendingMatch = null;
		const started = Date.now();
		searchAtRef.current = started;
		phaseRef.current = "searching";
		setPhase("searching");
		setEndReason(null);
		setMessages([]);
		setPartnerTyping(false);
		setPartnerInterests([]);
		setWarning(null);
		setUnread(0);
		strikesRef.current = 0;
		warnedRef.current = false;
		stickyRef.current = true;
		matchAtRef.current = null;
		const revealMatch = () => {
			if (!pendingMatch || !active || phaseRef.current !== "searching") return;
			phaseRef.current = "matched";
			matchAtRef.current = Date.now();
			lastPartnerRef.current = pendingMatch.partnerId;
			setPartnerInterests(pendingMatch.interests);
			setPhase("matched");
			if (soundRef.current) tickMatch();
		};
		client = new NightlineClient({
			interests,
			lastPartnerId: lastPartnerRef.current,
			blocked: readBlocked(),
			handlers: {
				onMatched: (info) => {
					if (!active) return;
					pendingMatch = info;
					const wait = Math.max(0, 1100 - (Date.now() - started));
					minSearch = setTimeout(revealMatch, wait);
				},
				onMessage: (ev) => {
					if (!active) return;
					const hit = scanMessage(ev.text);
					setMessages((prev) => [...prev, {
						id: ev.id,
						from: "them",
						text: ev.text,
						ts: ev.ts,
						status: "sent",
						hidden: Boolean(hit)
					}]);
					if (!stickyRef.current) setUnread((n) => n + 1);
					if (soundRef.current) tickIncoming();
				},
				onAck: (id) => {
					setMessages((prev) => prev.map((m) => m.id === id ? {
						...m,
						status: "sent"
					} : m));
				},
				onNack: (id, error) => {
					if (error === "rate") setMutedUntil(Date.now() + MUTE_MS);
					setMessages((prev) => prev.map((m) => m.id === id ? {
						...m,
						status: "failed"
					} : m));
				},
				onTyping: (on) => {
					setPartnerTyping(on);
					if (partnerTypeHideRef.current) clearTimeout(partnerTypeHideRef.current);
					if (on) partnerTypeHideRef.current = setTimeout(() => setPartnerTyping(false), TYPING_DEBOUNCE_MS);
				},
				onEnded: (reason, partnerId) => {
					if (!active || ignoreEndedRef.current) return;
					if (minSearch) clearTimeout(minSearch);
					goEnded(reason, partnerId);
				}
			}
		});
		ignoreEndedRef.current = false;
		clientRef.current = client;
		client.start();
		const onHide = () => client?.stop();
		window.addEventListener("pagehide", onHide);
		window.addEventListener("beforeunload", onHide);
		return () => {
			active = false;
			if (minSearch) clearTimeout(minSearch);
			window.removeEventListener("pagehide", onHide);
			window.removeEventListener("beforeunload", onHide);
			client?.stop();
			if (clientRef.current === client) clientRef.current = null;
		};
	}, [
		interests,
		searchKey,
		goEnded
	]);
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => {
			if (phaseRef.current === "searching") setSearchElapsed(Math.floor((Date.now() - searchAtRef.current) / 1e3));
			if (phaseRef.current === "matched" && matchAtRef.current) setMatchElapsed(Math.floor((Date.now() - matchAtRef.current) / 1e3));
		}, 250);
		return () => clearInterval(t);
	}, [searchKey]);
	const applyStrike = (0, import_react.useCallback)((hit) => {
		strikesRef.current += 1;
		const copy = warningCopy(hit);
		setWarning(copy);
		if (!warnedRef.current) warnedRef.current = true;
		if (strikesRef.current >= 2) {
			clientRef.current?.skip();
			goEnded("strikes", clientRef.current?.partnerId ?? void 0);
		}
	}, [goEnded]);
	const send = (0, import_react.useCallback)((raw) => {
		const text = raw.trim().slice(0, 500);
		if (!text) return false;
		if (Date.now() < mutedUntil) return false;
		const ring = rateRef.current.filter((t) => Date.now() - t < RATE_WINDOW_MS);
		if (ring.length >= 8) {
			setMutedUntil(Date.now() + MUTE_MS);
			rateRef.current = ring;
			return false;
		}
		ring.push(Date.now());
		rateRef.current = ring;
		const hit = scanMessage(text);
		const id = `m${newId()}`;
		const msg = {
			id,
			from: "me",
			text,
			ts: Date.now(),
			status: hit ? "sent" : "pending",
			hidden: Boolean(hit)
		};
		setMessages((prev) => [...prev, msg]);
		stickyRef.current = true;
		if (hit) {
			applyStrike(hit);
			return true;
		}
		if (demoRef.current) {
			setMessages((prev) => prev.map((m) => m.id === id ? {
				...m,
				status: "sent"
			} : m));
			const turn = ++demoTurnRef.current;
			setPartnerTyping(true);
			clearDemoTimer();
			demoTimerRef.current = setTimeout(() => {
				setPartnerTyping(false);
				const reply = demoReply(turn, text);
				setMessages((prev) => [...prev, {
					id: `d${newId()}`,
					from: "them",
					text: reply,
					ts: Date.now(),
					status: "sent"
				}]);
				if (soundRef.current) tickIncoming();
			}, demoDelay());
			return true;
		}
		clientRef.current?.send(id, text);
		return true;
	}, [applyStrike, mutedUntil]);
	const retry = (0, import_react.useCallback)((id) => {
		const found = messages.find((m) => m.id === id && m.from === "me");
		if (!found) return;
		setMessages((prev) => prev.map((m) => m.id === id ? {
			...m,
			status: "pending"
		} : m));
		clientRef.current?.send(id, found.text);
	}, [messages]);
	const notifyTyping = (0, import_react.useCallback)(() => {
		if (phaseRef.current !== "matched" || demoRef.current) return;
		clientRef.current?.typing(true);
		if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
		typingIdleRef.current = setTimeout(() => {
			clientRef.current?.typing(false);
		}, TYPING_DEBOUNCE_MS);
	}, []);
	const skip = (0, import_react.useCallback)((force = false) => {
		if (demoRef.current) {
			demoRef.current = false;
			setIsDemo(false);
			clearDemoTimer();
			lastPartnerRef.current = "demo";
			phaseRef.current = "searching";
			setPhase("searching");
			setMessages([]);
			setSearchKey((k) => k + 1);
			return "done";
		}
		const exchanged = messages.filter((m) => !m.hidden).length;
		if (!force && exchanged >= 3) return "confirm";
		ignoreEndedRef.current = true;
		lastPartnerRef.current = clientRef.current?.partnerId ?? lastPartnerRef.current;
		clientRef.current?.skip();
		clientRef.current?.stop();
		clientRef.current = null;
		phaseRef.current = "searching";
		setPhase("searching");
		setSearchElapsed(0);
		setMessages([]);
		setPartnerTyping(false);
		setWarning(null);
		setSearchKey((k) => k + 1);
		return "done";
	}, [messages]);
	const report = (0, import_react.useCallback)((reason) => {
		if (demoRef.current) {
			demoRef.current = false;
			setIsDemo(false);
			clearDemoTimer();
			goEnded("reported");
			return;
		}
		const pid = clientRef.current?.partnerId;
		if (pid) addBlocked(pid);
		clientRef.current?.report(reason);
		goEnded("reported", pid ?? void 0);
	}, [goEnded]);
	const startDemo = (0, import_react.useCallback)(() => {
		demoRef.current = true;
		setIsDemo(true);
		clientRef.current?.stop();
		clientRef.current = null;
		phaseRef.current = "matched";
		matchAtRef.current = Date.now();
		setPhase("matched");
		setPartnerInterests([]);
		setMessages([]);
		demoTurnRef.current = 0;
		if (soundRef.current) tickMatch();
		setPartnerTyping(true);
		clearDemoTimer();
		demoTimerRef.current = setTimeout(() => {
			setPartnerTyping(false);
			demoTurnRef.current = 1;
			setMessages([{
				id: `d${newId()}`,
				from: "them",
				text: demoReply(1, ""),
				ts: Date.now(),
				status: "sent"
			}]);
		}, 900);
	}, []);
	const findNew = (0, import_react.useCallback)(() => {
		demoRef.current = false;
		setIsDemo(false);
		clearDemoTimer();
		clientRef.current?.stop();
		clientRef.current = null;
		setSearchKey((k) => k + 1);
	}, []);
	const leave = (0, import_react.useCallback)(() => {
		clientRef.current?.stop();
		clientRef.current = null;
		demoRef.current = false;
		setIsDemo(false);
	}, []);
	const setSticky = (0, import_react.useCallback)((sticky) => {
		stickyRef.current = sticky;
		if (sticky) setUnread(0);
	}, []);
	return {
		...(0, import_react.useMemo)(() => ({
			phase,
			endReason,
			messages,
			partnerTyping,
			partnerInterests,
			isDemo,
			warning,
			mutedUntil,
			searchElapsed,
			matchElapsed,
			soundOn,
			unread
		}), [
			phase,
			endReason,
			messages,
			partnerTyping,
			partnerInterests,
			isDemo,
			warning,
			mutedUntil,
			searchElapsed,
			matchElapsed,
			soundOn,
			unread
		]),
		send,
		retry,
		skip,
		report,
		startDemo,
		findNew,
		leave,
		notifyTyping,
		setSoundOn,
		setSticky,
		isSticky: () => stickyRef.current
	};
}
function ChatPage() {
	const navigate = useNavigate();
	const [allowed, setAllowed] = (0, import_react.useState)(null);
	const [interests, setInterests] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!hasAgeConfirm()) {
			navigate({ to: "/" });
			setAllowed(false);
			return;
		}
		setInterests(takeInterests());
		setAllowed(true);
	}, [navigate]);
	if (allowed !== true) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoothShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center text-sm text-muted",
		children: "Opening the booth…"
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveChat, { interests });
}
function LiveChat({ interests }) {
	const navigate = useNavigate();
	const line = useNightline(interests);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BoothShell, { children: [
		line.phase === "searching" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchingView, {
			elapsed: line.searchElapsed,
			onCancel: () => {
				line.leave();
				navigate({ to: "/" });
			},
			onDemo: line.startDemo
		}) : null,
		line.phase === "matched" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatView, {
			messages: line.messages,
			partnerTyping: line.partnerTyping,
			partnerInterests: line.partnerInterests,
			isDemo: line.isDemo,
			warning: line.warning,
			mutedUntil: line.mutedUntil,
			matchElapsed: line.matchElapsed,
			soundOn: line.soundOn,
			unread: line.unread,
			onSend: line.send,
			onRetry: line.retry,
			onSkip: line.skip,
			onReport: line.report,
			onTyping: line.notifyTyping,
			onSound: line.setSoundOn,
			onSticky: line.setSticky
		}) : null,
		line.phase === "ended" && line.endReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EndView, {
			reason: line.endReason,
			onAgain: line.findNew,
			onHome: () => {
				line.leave();
				navigate({ to: "/" });
			}
		}) : null
	] });
}
//#endregion
export { ChatPage as component };
