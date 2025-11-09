// Core data types for the AI consultancy portfolio

export type Client = {
	id: string;
	name: string;
	role: string;
	period: string;
	location: string;
	description: string;
	highlights: string[];
	technologies: string[];
	aiFeatures?: string[];
	logo?: string;
	featured: boolean;
	subClients?: SubClient[];
};

export type SubClient = {
	name: string;
	description: string;
	aiFeatures: string[];
};

export type Project = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	description: string;
	longDescription: string;
	client: string;
	technologies: string[];
	aiTechnologies?: string[];
	features: string[];
	outcomes?: string[];
	images: string[];
	featured: boolean;
	year: string;
	category: "AI/ML" | "Full-Stack" | "Data Engineering" | "Infrastructure";
};

export type BlogPost = {
	id: string;
	slug: string;
	title: string;
	subtitle?: string;
	excerpt: string;
	content: string;
	author: string;
	publishedDate: string;
	updatedDate?: string;
	tags: string[];
	category: string;
	readingTime: number;
	featured: boolean;
	image?: string;
};

export type Skill = {
	name: string;
	category: "Core" | "Soft" | "Practices" | "Technical";
	proficiency?: number;
};

export type Education = {
	degree: string;
	institution: string;
	period: string;
	details?: string;
};
