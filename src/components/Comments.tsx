import Giscus from "@giscus/react";
import { useEffect, useState } from "react";

type Props = {
	slug: string;
};

const Comments = ({ slug }: Props) => {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		// Check initial dark mode state
		const checkDarkMode = () => {
			setIsDark(document.documentElement.classList.contains("dark"));
		};

		checkDarkMode();

		// Watch for dark mode changes
		const observer = new MutationObserver(checkDarkMode);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"]
		});

		return () => observer.disconnect();
	}, []);

	return (
		<section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
			<h2 className="mb-8 text-slate-900 dark:text-slate-100">Comments</h2>
			<Giscus
				repo="bagpyp/bagpyp"
				repoId="R_kgDOHfLMGg"
				category="Announcements"
				categoryId="DIC_kwDOHfLMGs4DBMm4"
				mapping="specific"
				term={slug}
				strict="0"
				reactionsEnabled="1"
				emitMetadata="0"
				inputPosition="top"
				theme={isDark ? "dark" : "light"}
				lang="en"
				loading="lazy"
			/>
		</section>
	);
};

export default Comments;
