"use client";

import React, { useState } from "react";
import type { TriadSettings, InversionNotation } from "../lib/triad-settings";
import { INVERSION_NOTATION_LABELS } from "../lib/triad-settings";

interface TriadSettingsPanelProps {
	settings: TriadSettings;
	onSettingsChange: (settings: TriadSettings) => void;
}

/**
 * Collapsible settings panel for configuring the triads display
 */
export default function TriadSettingsPanel({
	settings,
	onSettingsChange
}: TriadSettingsPanelProps) {
	const [isOpen, setIsOpen] = useState(false);

	const updateSetting = <K extends keyof TriadSettings>(
		key: K,
		value: TriadSettings[K]
	) => {
		onSettingsChange({
			...settings,
			[key]: value
		});
	};

	return (
		<div className="relative mb-2 flex justify-start">
			{/* Settings Toggle Button */}
			<div className="relative">
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="
          	px-2 py-2
				  bg-white dark:bg-slate-800
				  	rounded-lg shadow-md hover:shadow-lg transition-all
				  	border border-slate-200 dark:border-slate-700"
					title="Display Settings"
				>
					<svg
						className="w-4 h-4 text-slate-600 dark:text-slate-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				</button>

				{/* Settings Panel - Dropdown */}
				{isOpen && (
					<div className="
						absolute top-12 left-0

						bg-white dark:bg-slate-800
						rounded-lg shadow-xl
						border
							border-slate-200
							dark:border-slate-700
						z-50
					">
						<div className="space-2">
							{/* Toggles */}
							<div className="px-3">
								{/* Show Chromatic Notes */}
								<div
									onClick={() =>
										updateSetting(
											"showChromaticNotes",
											!settings.showChromaticNotes
										)
									}
									className="flex items-center gap-3 cursor-pointer py-1"
								>
									<div
										className="relative flex-shrink-0"
										style={{ width: "36px", height: "20px" }}
									>
										<div
											className="absolute inset-0 rounded-full transition-colors"
											style={{
												backgroundColor: settings.showChromaticNotes
													? "#34C759"
													: "#E5E7EB"
											}}
										></div>
										<div
											className="absolute bg-white rounded-full shadow-sm pointer-events-none"
											style={{
												width: "16px",
												height: "16px",
												left: "2px",
												top: "2px",
												transform: settings.showChromaticNotes
													? "translateX(16px)"
													: "translateX(0)",
												transition: "transform 0.2s ease"
											}}
										></div>
									</div>
									<span className="text-xs text-slate-700 dark:text-slate-300 select-none">
										Chromatic notes
									</span>
								</div>

								{/* Show Octave Colors */}
								<div
									onClick={() =>
										updateSetting(
											"showOctaveColors",
											!settings.showOctaveColors
										)
									}
									className="flex items-center gap-3 cursor-pointer py-1"
								>
									<div
										className="relative flex-shrink-0"
										style={{ width: "36px", height: "20px" }}
									>
										<div
											className="absolute inset-0 rounded-full transition-colors"
											style={{
												backgroundColor: settings.showOctaveColors
													? "#34C759"
													: "#E5E7EB"
											}}
										></div>
										<div
											className="absolute bg-white rounded-full shadow-sm pointer-events-none"
											style={{
												width: "16px",
												height: "16px",
												left: "2px",
												top: "2px",
												transform: settings.showOctaveColors
													? "translateX(16px)"
													: "translateX(0)",
												transition: "transform 0.2s ease"
											}}
										></div>
									</div>
									<span className="text-xs text-slate-700 dark:text-slate-300 select-none">
										Octave brightness
									</span>
								</div>

								{/* Show Root Halos */}
								<div
									onClick={() =>
										updateSetting("showRootHalos", !settings.showRootHalos)
									}
									className="flex items-center gap-3 cursor-pointer py-1"
								>
									<div
										className="relative flex-shrink-0"
										style={{ width: "36px", height: "20px" }}
									>
										<div
											className="absolute inset-0 rounded-full transition-colors"
											style={{
												backgroundColor: settings.showRootHalos
													? "#34C759"
													: "#E5E7EB"
											}}
										></div>
										<div
											className="absolute bg-white rounded-full shadow-sm pointer-events-none"
											style={{
												width: "16px",
												height: "16px",
												left: "2px",
												top: "2px",
												transform: settings.showRootHalos
													? "translateX(16px)"
													: "translateX(0)",
												transition: "transform 0.2s ease"
											}}
										></div>
									</div>
									<span className="text-xs text-slate-700 dark:text-slate-300 select-none">
										Root halos
									</span>
								</div>

								{/* Enable Hover Sound */}
								<div
									onClick={() =>
										updateSetting(
											"enableHoverSound",
											!settings.enableHoverSound
										)
									}
									className="flex items-center gap-3 cursor-pointer py-1"
								>
									<div
										className="relative flex-shrink-0"
										style={{ width: "36px", height: "20px" }}
									>
										<div
											className="absolute inset-0 rounded-full transition-colors"
											style={{
												backgroundColor: settings.enableHoverSound
													? "#34C759"
													: "#E5E7EB"
											}}
										></div>
										<div
											className="absolute bg-white rounded-full shadow-sm pointer-events-none"
											style={{
												width: "16px",
												height: "16px",
												left: "2px",
												top: "2px",
												transform: settings.enableHoverSound
													? "translateX(16px)"
													: "translateX(0)",
												transition: "transform 0.2s ease"
											}}
										></div>
									</div>
									<span className="text-xs text-slate-700 dark:text-slate-300 select-none">
										Hover sound
									</span>
								</div>
							</div>

							<div className="
								border-t
									border-slate-200
									dark:border-slate-700
								my-2">
							</div>

							{/* Inversion Notation */}
							<div className="space-y-1 p-2">
								<label className="text-[10px] font-medium text-slate-500 dark:text-slate-500 uppercase">
									Notation
								</label>
								<div className="flex gap-2">
									<button
										onClick={() =>
											updateSetting("inversionNotation", "symbols")
										}
										className="flex-1 px-2 py-1.5 text-xs rounded transition-colors font-medium"
										style={{
											backgroundColor:
												settings.inversionNotation === "symbols"
													? "#34C759"
													: "#E5E7EB",
											color:
												settings.inversionNotation === "symbols"
													? "#FFFFFF"
													: "#4B5563"
										}}
									>
										△¹²
									</button>
									<button
										onClick={() =>
											updateSetting("inversionNotation", "figured-bass")
										}
										className="flex-1 px-2 py-1.5 text-xs rounded transition-colors font-medium"
										style={{
											backgroundColor:
												settings.inversionNotation === "figured-bass"
													? "#34C759"
													: "#E5E7EB",
											color:
												settings.inversionNotation === "figured-bass"
													? "#FFFFFF"
													: "#4B5563"
										}}
									>
										⁶₄
									</button>
								</div>
							</div>

							{/* Chord Type (not yet functional) */}
							<div className="space-y-1 p-2">
								<label className="text-[10px] font-medium text-slate-500 dark:text-slate-500 uppercase">
									Type
								</label>
								<div className="flex gap-2">
									<button
										onClick={() => updateSetting("chordType", "major")}
										className="flex-1 px-2 py-1.5 text-xs rounded transition-colors font-medium"
										style={{
											backgroundColor:
												settings.chordType === "major" ? "#34C759" : "#E5E7EB",
											color:
												settings.chordType === "major" ? "#FFFFFF" : "#4B5563"
										}}
									>
										Major
									</button>
									<button
										onClick={() => updateSetting("chordType", "minor")}
										disabled
										className="flex-1 px-2 py-1.5 text-xs rounded cursor-not-allowed opacity-50"
										style={{
											backgroundColor: "#E5E7EB",
											color: "#9CA3AF"
										}}
										title="Coming soon"
									>
										Minor
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
