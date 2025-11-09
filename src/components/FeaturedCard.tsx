import { Client, Project, BlogPost } from "../interfaces";
import CaseStudyCard from "./CaseStudyCard";
import ProjectCard from "./ProjectCard";
import BlogPostCard from "./BlogPostCard";

type Props = {
	item: Client | Project | BlogPost;
	type: "case-study" | "project" | "blog";
};

/**
 * Universal Featured Card Component
 *
 * Renders the appropriate card type based on the item type.
 * Used on homepage for flexible featured content.
 */
const FeaturedCard = ({ item, type }: Props) => {
	if (type === "case-study") {
		return <CaseStudyCard caseStudy={item as Client} />;
	}

	if (type === "project") {
		return <ProjectCard project={item as Project} />;
	}

	if (type === "blog") {
		return <BlogPostCard post={item as BlogPost} />;
	}

	return null;
};

export default FeaturedCard;
