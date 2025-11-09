import { Client } from "../interfaces";

export const clientsData: Client[] = [
	{
		id: "artium-ai",
		name: "Artium AI",
		role: "Senior Software Engineer",
		period: "July 2024 - Present",
		location: "Los Angeles, CA",
		description:
			"One of only eight official OpenAI partners worldwide, building cutting-edge AI systems for Fortune 500 companies.",
		highlights: [
			"Created Continuous Alignment Testing (CAT), a groundbreaking framework for validating and monitoring agentic AI systems in production",
			"Led development of multi-agent RAG systems for medical research acceleration",
			"Architected enterprise-scale Agentic AI solutions",
			"Designed attorney-in-the-loop automation systems",
			"Built complex AI flows for clinical information processing"
		],
		technologies: [
			"Python",
			"TypeScript",
			"OpenAI GPT-4",
			"LangChain",
			"Vector Databases",
			"RAG",
			"Multi-Agent Systems"
		],
		aiFeatures: [
			"Continuous Alignment Testing (CAT) Framework",
			"Multi-Agent Architectures",
			"Retrieval-Augmented Generation (RAG)",
			"LLM System Design",
			"Production AI Monitoring"
		],
		featured: true,
		subClients: [
			{
				name: "Mayo Clinic",
				description:
					"Multi-agent/RAG system accelerating medical research and discovery",
				aiFeatures: [
					"Multi-agent collaboration",
					"Medical knowledge RAG",
					"Research acceleration AI"
				]
			},
			{
				name: "eBay",
				description:
					"Enterprise-scale Agentic AI optimizing seller workspaces and online selling",
				aiFeatures: [
					"Agentic AI workflows",
					"Legacy system integration",
					"Intelligent automation"
				]
			},
			{
				name: "Trust & Will",
				description:
					"Attorney-in-the-loop automation digitizing estate planning practices",
				aiFeatures: [
					"Human-in-the-loop AI",
					"Legal document automation",
					"Workflow orchestration"
				]
			},
			{
				name: "Arrive Health",
				description:
					"Complex AI flows condensing clinical information for critical patient support",
				aiFeatures: [
					"Clinical data processing",
					"Information extraction",
					"AI-driven summarization"
				]
			}
		]
	},
	{
		id: "ford",
		name: "Ford Motor Company",
		role: "Software Engineer → Engineering Manager",
		period: "September 2021 - September 2023",
		location: "Detroit, MI (via Integral.io)",
		description:
			"Led critical modernization efforts across Ford's autonomous vehicle and global payments divisions.",
		highlights: [
			"Spearheaded large-scale modernization of legacy Identity & Access Management platform for autonomous vehicles",
			"Applied strangler fig pattern to replace decades-old systems",
			"Architected global payments platform processing worldwide transactions",
			"Led technical team designing zero-downtime MongoDB migration service",
			"Delivered secure, efficient IAM platform for Ford's AV division"
		],
		technologies: [
			"Java Spring Boot",
			"GraphQL",
			"React",
			"Stripe.js",
			"Python",
			"MongoDB",
			"Microservices"
		],
		featured: true
	},
	{
		id: "trimet",
		name: "TriMet",
		role: "Software Engineer, Data Engineering",
		period: "December 2023 - July 2024",
		location: "Portland, OR",
		description:
			"Built and maintained enterprise Python ETL applications for Oregon's largest public transportation agency.",
		highlights: [
			"Built enterprise Python ETL applications integrating Oracle EBS with modern data pipelines",
			"Enabled faster delivery and cross-team collaboration",
			"Championed Agile practices, TDD, and pair programming",
			"Shifted engineering culture toward modern practices",
			"Improved iteration velocity and system maintainability"
		],
		technologies: ["Python", "Oracle EBS", "ETL Pipelines", "SQL", "Agile/TDD"],
		featured: false
	},
	{
		id: "hillcrest",
		name: "Hillcrest Ski & Sports",
		role: "Software Developer",
		period: "February 2020 - May 2021",
		location: "Gresham, OR",
		description:
			"Transformed a static website into a modern e-commerce platform driving over $1M in annual sales.",
		highlights: [
			"Built company's first dynamic e-commerce platform",
			"Integrated inventory and sales systems",
			"Enabled real-time, multi-channel fulfillment",
			"Developed automated data ingestion and cleanup pipelines",
			"Brought 23,000+ SKUs online",
			"Support and maintain RPBC2 licensed software"
		],
		technologies: [
			"React",
			"Node.js",
			"Python",
			"E-commerce APIs",
			"Data Pipelines"
		],
		featured: false
	}
];

export const getFeaturedClients = () =>
	clientsData.filter((client) => client.featured);

export const getClientById = (id: string) =>
	clientsData.find((client) => client.id === id);
