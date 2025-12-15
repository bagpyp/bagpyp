import { useState, useRef, useEffect, useCallback, ReactNode } from "react";

type FullscreenWrapperProps = {
	children: ReactNode;
	className?: string;
};

const FullscreenWrapper = ({ children, className = "" }: FullscreenWrapperProps) => {
	const [isFullscreen, setIsFullscreen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Handle escape key to exit fullscreen
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isFullscreen) {
				setIsFullscreen(false);
			}
		};

		// Listen for browser fullscreen changes
		const handleFullscreenChange = () => {
			if (!document.fullscreenElement) {
				setIsFullscreen(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, [isFullscreen]);

	// Prevent body scroll when in fullscreen
	useEffect(() => {
		if (isFullscreen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isFullscreen]);

	const toggleFullscreen = useCallback(async () => {
		if (!isFullscreen) {
			// Try native fullscreen first
			if (containerRef.current?.requestFullscreen) {
				try {
					await containerRef.current.requestFullscreen();
					setIsFullscreen(true);
				} catch {
					// Fallback to CSS fullscreen if native fails
					setIsFullscreen(true);
				}
			} else {
				// Fallback for browsers without fullscreen API
				setIsFullscreen(true);
			}
		} else {
			// Exit fullscreen
			if (document.fullscreenElement) {
				await document.exitFullscreen();
			}
			setIsFullscreen(false);
		}
	}, [isFullscreen]);

	return (
		<div
			ref={containerRef}
			className={`relative ${className} ${
				isFullscreen ? "fixed inset-0 z-50 bg-inherit" : ""
			}`}
		>
			{children}

			{/* Fullscreen toggle button */}
			<button
				onClick={toggleFullscreen}
				className="fixed bottom-4 right-4 z-[60] p-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white shadow-lg transition-all duration-200 backdrop-blur-sm border border-slate-600/50"
				title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
				aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
			>
				{isFullscreen ? (
					// Exit fullscreen icon (compress)
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
						/>
					</svg>
				) : (
					// Enter fullscreen icon (expand)
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
						/>
					</svg>
				)}
			</button>
		</div>
	);
};

export default FullscreenWrapper;
