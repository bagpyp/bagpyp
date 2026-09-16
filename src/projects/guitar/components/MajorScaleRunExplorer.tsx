"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getAllNoteColorsInCircleOfFifths } from "../lib/note-colors";
import {
	generateBoxShapePatterns,
	getPitchClass,
	type BoxShapePattern
} from "../lib/box-shapes";
import {
	MAJOR_MODE_DEFINITIONS,
	formatRouteByString,
	formatRouteSequence,
	generateMajorScaleModeRoutes,
	type LaunchCount,
	type MajorScaleRoute
} from "../lib/major-scale-runs";

type LabelMode = "degrees" | "notes" | "steps";
type MatrixPerspective = "tonic" | "position";
type DetailLayout = "focused" | "compare";

interface MajorScaleRunExplorerProps {
	selectedMajorKey: string;
}

const LAUNCH_COUNTS: LaunchCount[] = [1, 2, 3];
const STRING_NAMES = ["E", "A", "D", "G", "B", "E"];
const MODE_ACCENTS = [
	"#38bdf8",
	"#34d399",
	"#fb7185",
	"#a78bfa",
	"#f59e0b",
	"#22d3ee",
	"#f472b6"
];

function mod(value: number, modulus: number): number {
	return ((value % modulus) + modulus) % modulus;
}

function getRouteLabel(route: MajorScaleRoute): string {
	return `${route.tonicName} ${route.modeName}`;
}

function getHostLabel(route: MajorScaleRoute): string {
	return `${route.hostTonicName} ${route.hostModeName}`;
}

function getWindowOffset(launchCount: LaunchCount): number {
	return 3 - launchCount;
}

function RouteWindowStrip({ route }: { route: MajorScaleRoute }) {
	const start = getWindowOffset(route.launchCount);
	const end = start + 14;

	return (
		<div className="min-w-0">
			<div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
				<span>17-note host box</span>
				<span>
					window x<sub>{start}</sub>…x<sub>{end}</sub> · 15 notes · 24 semitones
				</span>
			</div>
			<div
				className="-mx-1 w-full max-w-full overflow-x-auto px-1 pb-1"
				aria-label={`15-note window from index ${start} through ${end} inside a 17-note box`}
			>
				<div
					className="grid min-w-[610px] gap-1"
					style={{ gridTemplateColumns: "repeat(17, minmax(0, 1fr))" }}
				>
					{Array.from({ length: 17 }, (_, index) => {
						const isInside = index >= start && index <= end;
						const routeStep = index - start + 1;
						const isTonic =
							isInside &&
							(routeStep === 1 || routeStep === 8 || routeStep === 15);
						return (
							<div
								key={index}
								className={[
									"flex h-9 items-center justify-center rounded-md border font-mono text-[10px] transition-colors sm:text-xs",
									isTonic
										? "border-amber-300 bg-amber-400 text-slate-950 shadow-[0_0_14px_rgba(251,191,36,0.35)]"
										: isInside
										? "border-sky-400/50 bg-sky-500/20 text-sky-100"
										: "border-slate-700/70 bg-slate-950/80 text-slate-600"
								].join(" ")}
								title={
									isInside
										? `Route step ${routeStep}`
										: `Clipped host note x${index}`
								}
							>
								{isTonic ? routeStep : `x${index}`}
							</div>
						);
					})}
				</div>
			</div>
			<p className="mt-1 text-[10px] text-slate-500 sm:hidden">
				Swipe sideways to inspect all 17 host slots.
			</p>
			<div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
				<span>{start} clipped before</span>
				<span>{2 - start} clipped after</span>
			</div>
		</div>
	);
}

function StringLoadRibbon({ route }: { route: MajorScaleRoute }) {
	const twoNoteStringIndex = route.stringLoads.findIndex(
		(count, index) => index > 0 && index < 5 && count === 2
	);

	return (
		<div>
			<div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
				<span>Notes per string</span>
				<span className="text-amber-300">
					2-note anti-drift seam on string {6 - twoNoteStringIndex}
				</span>
			</div>
			<div className="grid grid-cols-6 gap-1.5">
				{route.stringLoads.map((count, stringIndex) => (
					<div
						key={stringIndex}
						className={[
							"rounded-lg border px-1 py-2 text-center",
							stringIndex === twoNoteStringIndex
								? "border-amber-400/60 bg-amber-400/10"
								: stringIndex === 0
								? "border-sky-400/60 bg-sky-400/10"
								: "border-slate-700 bg-slate-950/60"
						].join(" ")}
					>
						<div className="text-[10px] uppercase tracking-wide text-slate-500">
							s{6 - stringIndex}
						</div>
						<div className="mt-0.5 text-lg font-bold text-slate-100">
							{count}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

interface HostGhostNote {
	hostIndex: number;
	stringIndex: number;
	fret: number;
}

function getAlignedHostGhostNotes(
	route: MajorScaleRoute,
	hostPattern: BoxShapePattern
): HostGhostNote[] {
	const lowEIndex = 3 - route.launchCount;
	const anchorFret = hostPattern.pattern[0][lowEIndex];

	if (anchorFret === undefined) return [];

	// Generated boxes may live one octave above or below the route. Align the
	// route tonic with its low-E host slot before exposing the two clipped notes.
	const fretShift = route.startFret - anchorFret;
	const windowEnd = lowEIndex + 14;

	return hostPattern.pattern
		.flatMap((frets, stringIndex) =>
			frets.map((fret) => ({
				hostIndex: 0,
				stringIndex,
				fret: fret + fretShift
			}))
		)
		.map((note, hostIndex) => ({ ...note, hostIndex }))
		.filter(({ hostIndex }) => hostIndex < lowEIndex || hostIndex > windowEnd);
}

function getFocusedFretRange(
	route: MajorScaleRoute,
	ghostNotes: readonly HostGhostNote[]
): [number, number] {
	const displayedFrets = [
		route.fretMin,
		route.fretMax,
		...ghostNotes.map((note) => note.fret)
	];
	let start = Math.max(0, Math.min(...displayedFrets) - 1);
	let end = Math.min(24, Math.max(...displayedFrets) + 1);
	const minimumSpan = 7;

	while (end - start + 1 < minimumSpan) {
		if (start > 0) start -= 1;
		if (end - start + 1 < minimumSpan && end < 24) end += 1;
		if (start === 0 && end === 24) break;
	}

	return [start, end];
}

function RouteFretboard({
	route,
	hostPattern,
	labelMode,
	compact = false
}: {
	route: MajorScaleRoute;
	hostPattern: BoxShapePattern;
	labelMode: LabelMode;
	compact?: boolean;
}) {
	const width = 1120;
	const height = compact ? 250 : 310;
	const left = 72;
	const right = 24;
	const top = 34;
	const bottom = compact ? 34 : 44;
	const ghostNotes = getAlignedHostGhostNotes(route, hostPattern);
	const [startFret, endFret] = getFocusedFretRange(route, ghostNotes);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const fretCount = endFret - startFret + 1;
	const innerWidth = width - left - right;
	const innerHeight = height - top - bottom;
	const stringGap = innerHeight / 5;
	const cellWidth = innerWidth / fretCount;
	const colorData = getAllNoteColorsInCircleOfFifths();
	const parentPitchClass = getPitchClass(route.parentKey);
	const markerId = `route-arrow-${route.id}-${compact ? "compact" : "full"}`;
	const glowId = `route-glow-${route.id}-${compact ? "compact" : "full"}`;

	const xForFret = (fret: number) =>
		left + (fret - startFret + 0.5) * cellWidth;
	const yForString = (stringIndex: number) =>
		top + (5 - stringIndex) * stringGap;
	const points = route.notes
		.map((note) => `${xForFret(note.fret)},${yForString(note.stringIndex)}`)
		.join(" ");

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container || container.scrollWidth <= container.clientWidth) return;

		const routeCenterFret = (route.fretMin + route.fretMax) / 2;
		const routeCenterX =
			left + (routeCenterFret - startFret + 0.5) * cellWidth;
		const renderedScale = container.scrollWidth / width;
		const targetScrollLeft =
			routeCenterX * renderedScale - container.clientWidth / 2;
		container.scrollLeft = Math.max(
			0,
			Math.min(targetScrollLeft, container.scrollWidth - container.clientWidth)
		);
	}, [cellWidth, endFret, route.fretMax, route.fretMin, route.id, startFret]);

	return (
		<div className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#17110d] shadow-inner shadow-black/60">
			<div className="flex items-center gap-2 border-b border-slate-700/70 bg-slate-950/55 px-3 py-2 text-[11px] text-slate-400">
				<span className="inline-flex h-5 min-w-8 items-center justify-center rounded-full border border-dashed border-slate-400/80 px-1 font-mono text-[9px] text-slate-400">
					x…
				</span>
				<span>
					Dashed notes are the two host-box notes clipped from this 15-note
					route. Swipe sideways to follow the path.
				</span>
			</div>
			<div ref={scrollContainerRef} className="overflow-x-auto">
				<svg
					viewBox={`0 0 ${width} ${height}`}
					className="block h-auto min-w-[760px] w-full"
					role="img"
					aria-label={`${getRouteLabel(route)}, ${
						route.launchCount
					}-note low-E launch, hosted by ${getHostLabel(
						route
					)}. Fifteen ascending notes from ${route.notes[0].noteName}${
						route.notes[0].octave
					} to ${route.notes[14].noteName}${
						route.notes[14].octave
					}, plus two dashed host notes clipped from the route.`}
				>
					<title>{`${getRouteLabel(route)} — ${
						route.launchCount
					}-note launch in ${getHostLabel(route)}`}</title>
					<defs>
						<linearGradient id={glowId} x1="0" x2="1">
							<stop offset="0%" stopColor="#38bdf8" />
							<stop offset="48%" stopColor="#a78bfa" />
							<stop offset="100%" stopColor="#f59e0b" />
						</linearGradient>
						<marker
							id={markerId}
							markerWidth="7"
							markerHeight="7"
							refX="5"
							refY="3.5"
							orient="auto"
						>
							<path d="M0,0 L7,3.5 L0,7 Z" fill="#7dd3fc" opacity="0.9" />
						</marker>
					</defs>

					<rect
						x={left}
						y={top - 14}
						width={innerWidth}
						height={innerHeight + 28}
						rx="12"
						fill="#3d2817"
					/>

					{Array.from({ length: fretCount + 1 }, (_, index) => {
						const x = left + index * cellWidth;
						return (
							<line
								key={`fret-line-${index}`}
								x1={x}
								y1={top - 14}
								x2={x}
								y2={top + innerHeight + 14}
								stroke={startFret + index === 0 ? "#f8fafc" : "#94a3b8"}
								strokeWidth={startFret + index === 0 ? 4 : 1.5}
								opacity={startFret + index === 0 ? 0.95 : 0.7}
							/>
						);
					})}

					{Array.from({ length: fretCount }, (_, index) => {
						const fret = startFret + index;
						return (
							<text
								key={`fret-label-${fret}`}
								x={left + (index + 0.5) * cellWidth}
								y={height - 9}
								textAnchor="middle"
								fill="#94a3b8"
								fontSize="12"
								fontFamily="ui-monospace, monospace"
							>
								{fret}
							</text>
						);
					})}

					{Array.from({ length: 6 }, (_, stringIndex) => {
						const y = yForString(stringIndex);
						const isWound = stringIndex <= 3;
						return (
							<g key={`string-${stringIndex}`}>
								<line
									x1={left}
									y1={y}
									x2={left + innerWidth}
									y2={y}
									stroke={isWound ? "#cd7f32" : "#d1d5db"}
									strokeWidth={Math.max(1.5, 4.5 - stringIndex * 0.55)}
								/>
								<text
									x={left - 16}
									y={y + 4}
									textAnchor="end"
									fill="#cbd5e1"
									fontSize="13"
									fontFamily="ui-monospace, monospace"
								>
									{`${6 - stringIndex} ${STRING_NAMES[stringIndex]}`}
								</text>
							</g>
						);
					})}

					{ghostNotes.map((note) => {
						const x = xForFret(note.fret);
						const y = yForString(note.stringIndex);
						const radius = compact ? 11 : 13;

						return (
							<g
								key={`ghost-${note.hostIndex}-${note.stringIndex}-${note.fret}`}
								opacity="0.72"
							>
								<circle
									cx={x}
									cy={y}
									r={radius}
									fill="#17110d"
									stroke="#cbd5e1"
									strokeWidth="1.75"
									strokeDasharray="4 3"
								/>
								<text
									x={x}
									y={y + 0.5}
									textAnchor="middle"
									dominantBaseline="middle"
									fill="#cbd5e1"
									fontSize={compact ? 8.5 : 9.5}
									fontWeight="700"
									fontFamily="ui-monospace, monospace"
								>
									{`x${note.hostIndex}`}
								</text>
							</g>
						);
					})}

					<polyline
						points={points}
						fill="none"
						stroke="#020617"
						strokeWidth={compact ? 8 : 10}
						strokeLinecap="round"
						strokeLinejoin="round"
						opacity="0.65"
					/>
					<polyline
						points={points}
						fill="none"
						stroke={`url(#${glowId})`}
						strokeWidth={compact ? 3 : 4}
						strokeLinecap="round"
						strokeLinejoin="round"
						markerMid={`url(#${markerId})`}
						opacity="0.9"
					/>

					{route.notes.map((note) => {
						const x = xForFret(note.fret);
						const y = yForString(note.stringIndex);
						const palette = colorData[note.pitchClass];
						const label =
							labelMode === "notes"
								? note.noteName.replace("#", "♯").replace("b", "♭")
								: labelMode === "steps"
								? String(note.step)
								: note.degreeLabel.replace("#", "♯").replace("b", "♭");
						const isParentRoot = note.pitchClass === parentPitchClass;
						const radius = compact ? 13 : 15;

						return (
							<g key={`${note.stringIndex}-${note.fret}-${note.step}`}>
								{isParentRoot && !note.isTonic && (
									<circle
										cx={x}
										cy={y}
										r={radius + 5}
										fill="none"
										stroke="#38bdf8"
										strokeWidth="2"
										strokeDasharray="3 2"
										opacity="0.85"
									/>
								)}
								{note.isTonic && (
									<>
										<circle
											cx={x}
											cy={y}
											r={radius + 8}
											fill="none"
											stroke="#fbbf24"
											strokeWidth="2"
											opacity="0.35"
										/>
										<circle
											cx={x}
											cy={y}
											r={radius + 5}
											fill="none"
											stroke="#fde68a"
											strokeWidth="3"
										/>
									</>
								)}
								<circle
									cx={x}
									cy={y}
									r={radius}
									fill={palette.bg}
									stroke="#0f172a"
									strokeWidth="1.5"
								/>
								<text
									x={x}
									y={y + 0.5}
									textAnchor="middle"
									dominantBaseline="middle"
									fill={palette.text}
									fontSize={label.length > 2 ? 10 : 11.5}
									fontWeight="700"
									fontFamily="ui-monospace, monospace"
								>
									{label}
								</text>
							</g>
						);
					})}
				</svg>
			</div>
		</div>
	);
}

function RouteSummaryCard({
	route,
	selected,
	onSelect
}: {
	route: MajorScaleRoute;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={[
				"min-h-[92px] rounded-xl border p-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
				selected
					? "border-sky-300 bg-sky-500/20 shadow-[0_0_24px_rgba(56,189,248,0.12)]"
					: "border-slate-700 bg-slate-950/55 hover:border-slate-500 hover:bg-slate-800/70"
			].join(" ")}
			aria-pressed={selected}
		>
			<div className="flex items-center justify-between gap-2">
				<span className="font-semibold text-slate-100">
					{route.launchCount} on string 6
				</span>
				<span className="rounded-full bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-sky-200">
					{route.stringLoads.join("·")}
				</span>
			</div>
			<div className="mt-2 text-xs text-slate-400">
				host{" "}
				<span className="font-medium text-slate-200">
					{getHostLabel(route)}
				</span>
			</div>
		</button>
	);
}

export default function MajorScaleRunExplorer({
	selectedMajorKey
}: MajorScaleRunExplorerProps) {
	const modeGroups = useMemo(
		() => generateMajorScaleModeRoutes(selectedMajorKey),
		[selectedMajorKey]
	);
	const hostPatterns = useMemo(
		() => generateBoxShapePatterns(selectedMajorKey, "major"),
		[selectedMajorKey]
	);
	const [selectedModeIndex, setSelectedModeIndex] = useState(1);
	const [selectedLaunch, setSelectedLaunch] = useState<LaunchCount>(1);
	const [labelMode, setLabelMode] = useState<LabelMode>("degrees");
	const [perspective, setPerspective] = useState<MatrixPerspective>("tonic");
	const [detailLayout, setDetailLayout] = useState<DetailLayout>("focused");

	const selectedMode = modeGroups[selectedModeIndex] ?? modeGroups[0];
	const selectedRoute = selectedMode.routes[selectedLaunch - 1];
	const sequence = formatRouteSequence(selectedRoute);

	const selectRoute = (modeIndex: number, launchCount: LaunchCount) => {
		setSelectedModeIndex(mod(modeIndex, 7));
		setSelectedLaunch(launchCount);
	};

	return (
		<section
			className="mx-auto w-full max-w-[1500px] space-y-4"
			aria-labelledby="route-lab-title"
		>
			<div className="overflow-hidden rounded-2xl border border-sky-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/50 shadow-2xl">
				<div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:items-end md:p-7">
					<div>
						<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">
							Two-octave route lab
						</div>
						<h2
							id="route-lab-title"
							className="text-2xl font-bold text-white sm:text-3xl"
						>
							Seven boxes hide twenty-one complete routes.
						</h2>
						<p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
							Each 17-note box contains three two-octave modal windows. Read the
							relationship the other way and every modal tonic has three
							complete routes through neighboring boxes, each ending on the
							matching high-E tonic.
						</p>
					</div>
					<div className="grid grid-cols-3 gap-2 text-center">
						{[
							["7", "boxes"],
							["3", "windows"],
							["21", "routes"]
						].map(([value, label]) => (
							<div
								key={label}
								className="min-w-[72px] rounded-xl border border-white/10 bg-black/20 px-3 py-3"
							>
								<div className="text-2xl font-bold text-white">{value}</div>
								<div className="text-[10px] uppercase tracking-wider text-slate-400">
									{label}
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="border-t border-white/10 bg-black/15 px-5 py-3 text-sm text-slate-300 md:px-7">
					<span className="text-slate-500">Invariant:</span> 3 notes × 6 strings
					− 1 anti-drift note = 17; then 17 − 2 clipped notes = 15.
				</div>
			</div>

			<div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl sm:p-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3 className="text-lg font-semibold text-white">
							The 7 × 3 atlas
						</h3>
						<p className="mt-1 text-xs text-slate-400">
							Read it by modal destination or turn it sideways and read the
							three windows inside each position.
						</p>
					</div>
					<div className="inline-flex rounded-lg bg-slate-950 p-1 ring-1 ring-slate-700">
						{(
							[
								["tonic", "By tonic"],
								["position", "By position"]
							] as const
						).map(([value, label]) => (
							<button
								key={value}
								type="button"
								onClick={() => setPerspective(value)}
								className={`min-h-[40px] rounded-md px-3 text-sm font-medium transition-colors ${
									perspective === value
										? "bg-sky-600 text-white"
										: "text-slate-400 hover:text-white"
								}`}
								aria-pressed={perspective === value}
							>
								{label}
							</button>
						))}
					</div>
				</div>

					<div className="mt-4 overflow-x-auto pb-2">
						<p className="mb-2 text-[10px] text-slate-500 sm:hidden">
							Swipe sideways to compare all three launches.
						</p>
						<div className="min-w-[850px]">
						<div className="grid grid-cols-[190px_repeat(3,minmax(0,1fr))] gap-2 px-1 pb-2 text-center text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
							<div className="text-left">
								{perspective === "tonic" ? "Modal tonic" : "Host position"}
							</div>
							{(perspective === "tonic" ? [1, 2, 3] : [3, 2, 1]).map(
								(count) => (
									<div key={count}>{count}-note low-E launch</div>
								)
							)}
						</div>

						<div className="space-y-2">
							{modeGroups.map((group, rowIndex) => {
								const rowModeIndex =
									perspective === "tonic" ? group.modeIndex : rowIndex;
								const rowLabel =
									perspective === "tonic"
										? `${group.tonicName} ${group.modeName}`
										: `${modeGroups[rowIndex].tonicName} ${MAJOR_MODE_DEFINITIONS[rowIndex].name}`;
								const columns =
									perspective === "tonic"
										? LAUNCH_COUNTS.map((launchCount) => ({
												modeIndex: rowModeIndex,
												launchCount
										  }))
										: ([3, 2, 1] as LaunchCount[]).map((launchCount) => ({
												modeIndex: mod(rowIndex + (3 - launchCount), 7),
												launchCount
										  }));

								return (
									<div
										key={`${perspective}-${rowIndex}`}
										className="grid grid-cols-[190px_repeat(3,minmax(0,1fr))] gap-2"
									>
										<button
											type="button"
											onClick={() => {
												if (perspective === "position") {
													selectRoute(rowIndex, 3);
												} else {
													setSelectedModeIndex(rowModeIndex);
												}
											}}
											className="flex min-h-[62px] items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/65 px-3 text-left hover:border-slate-500"
										>
											<span
												className="h-8 w-1.5 rounded-full"
												style={{ backgroundColor: MODE_ACCENTS[rowIndex] }}
											/>
											<span>
												<span className="block font-semibold text-slate-100">
													{rowLabel}
												</span>
												<span className="mt-0.5 block text-[11px] text-slate-500">
													{perspective === "tonic"
														? MAJOR_MODE_DEFINITIONS[rowIndex].colorNote
														: "17 notes · 3 windows"}
												</span>
											</span>
										</button>

										{columns.map(({ modeIndex, launchCount }) => {
											const route =
												modeGroups[modeIndex].routes[launchCount - 1];
											const isSelected =
												selectedModeIndex === modeIndex &&
												selectedLaunch === launchCount;
											return (
												<button
													key={`${modeIndex}-${launchCount}`}
													type="button"
													onClick={() => selectRoute(modeIndex, launchCount)}
													className={[
														"min-h-[62px] rounded-xl border px-3 py-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
														isSelected
															? "border-sky-300 bg-sky-500/20 shadow-[0_0_20px_rgba(56,189,248,0.12)]"
															: "border-slate-700 bg-slate-800/55 hover:border-slate-500 hover:bg-slate-800"
													].join(" ")}
													aria-pressed={isSelected}
												>
													<span className="block text-sm font-semibold text-slate-100">
														{perspective === "tonic"
															? getHostLabel(route)
															: getRouteLabel(route)}
													</span>
													<span className="mt-1 block font-mono text-[10px] text-slate-500">
														{route.stringLoads.join(" · ")}
													</span>
												</button>
											);
										})}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:p-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
							Selected route
						</p>
						<h3 className="mt-1 text-2xl font-bold text-white">
							{getRouteLabel(selectedRoute)}
						</h3>
						<p className="mt-1 text-sm text-slate-400">
							{selectedRoute.launchCount}-note low-E launch inside{" "}
							<span className="font-semibold text-slate-200">
								{getHostLabel(selectedRoute)}
							</span>{" "}
							· s6f{selectedRoute.startFret} → s1f{selectedRoute.startFret}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<div className="inline-flex rounded-lg bg-slate-950 p-1 ring-1 ring-slate-700">
							{(
								[
									["focused", "Focused"],
									["compare", "Compare 3"]
								] as const
							).map(([value, label]) => (
								<button
									key={value}
									type="button"
									onClick={() => setDetailLayout(value)}
									className={`min-h-[44px] rounded-md px-3 text-xs font-medium ${
										detailLayout === value
											? "bg-sky-600 text-white"
											: "text-slate-400 hover:text-white"
									}`}
									aria-pressed={detailLayout === value}
								>
									{label}
								</button>
							))}
						</div>
						<div className="inline-flex rounded-lg bg-slate-950 p-1 ring-1 ring-slate-700">
							{(
								[
									["degrees", "Degrees"],
									["notes", "Notes"],
									["steps", "Steps"]
								] as const
							).map(([value, label]) => (
								<button
									key={value}
									type="button"
									onClick={() => setLabelMode(value)}
									className={`min-h-[44px] rounded-md px-3 text-xs font-medium ${
										labelMode === value
											? "bg-violet-600 text-white"
											: "text-slate-400 hover:text-white"
									}`}
									aria-pressed={labelMode === value}
								>
									{label}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="mt-5 grid gap-4 lg:grid-cols-2">
					<div className="min-w-0 rounded-xl border border-slate-700/80 bg-slate-950/45 p-4">
						<RouteWindowStrip route={selectedRoute} />
					</div>
					<div className="rounded-xl border border-slate-700/80 bg-slate-950/45 p-4">
						<StringLoadRibbon route={selectedRoute} />
					</div>
				</div>

				{detailLayout === "focused" ? (
					<div className="mt-5">
						<RouteFretboard
							route={selectedRoute}
							hostPattern={hostPatterns[selectedRoute.hostModeIndex]}
							labelMode={labelMode}
						/>
					</div>
				) : (
					<div className="mt-5 space-y-4">
						{selectedMode.routes.map((route) => (
							<div
								key={route.id}
								className={`rounded-xl border p-3 ${
									route.launchCount === selectedLaunch
										? "border-sky-400/70 bg-sky-400/5"
										: "border-slate-700 bg-slate-950/30"
								}`}
							>
								<button
									type="button"
									onClick={() => setSelectedLaunch(route.launchCount)}
									className="mb-3 flex w-full items-center justify-between gap-3 text-left"
								>
									<span className="font-semibold text-white">
										{route.launchCount} on string 6 · {getHostLabel(route)}
									</span>
									<span className="font-mono text-xs text-slate-500">
										{route.stringLoads.join("·")}
									</span>
								</button>
								<RouteFretboard
									route={route}
									hostPattern={hostPatterns[route.hostModeIndex]}
									labelMode={labelMode}
									compact
								/>
							</div>
						))}
					</div>
				)}

				<div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
					<div className="rounded-xl border border-slate-700 bg-slate-950/55 p-4">
						<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
							<h4 className="font-semibold text-white">Route itinerary</h4>
							<div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
								<span>
									<span className="mr-1 text-amber-300">◎</span>modal tonic
								</span>
								<span>
									<span className="mr-1 text-sky-300">◌</span>parent-major root
								</span>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							{formatRouteByString(selectedRoute).map((entry) => (
								<code
									key={entry}
									className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200"
								>
									{entry}
								</code>
							))}
						</div>
						<p className="mt-3 break-words font-mono text-[11px] leading-relaxed text-slate-500">
							{sequence}
						</p>
					</div>

					<div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
						<h4 className="font-semibold text-amber-100">
							What the model corrects
						</h4>
						<p className="mt-2 text-sm leading-relaxed text-slate-300">
							A repeated pitch at a string crossing is a useful unison handoff,
							but it is not the next step of a strictly ascending route. In A
							Dorian, after s6f7 (B), the next scale tone is s5f3 (C); s5f2 is
							the same B in a new location.
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				{selectedMode.routes.map((route) => (
					<RouteSummaryCard
						key={route.id}
						route={route}
						selected={route.launchCount === selectedLaunch}
						onSelect={() => {
							setSelectedLaunch(route.launchCount);
							setDetailLayout("focused");
						}}
					/>
				))}
			</div>

			<div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4 sm:flex-row sm:items-center">
				<p className="text-sm text-slate-400">
					The companion article derives the 17 → 15 window rule, names all 21
					routes, and turns it into a practice method.
				</p>
				<Link
					href="/blog/three-ways-through-the-major-scale"
					className="inline-flex min-h-[42px] shrink-0 items-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
				>
					Read the deep dive →
				</Link>
			</div>
		</section>
	);
}
