import { Client } from "../interfaces";

// Individual case studies from client work
export const caseStudiesData: Client[] = [
	{
		id: "mayo-clinic",
		name: "Mayo Clinic",
		role: "AI Engineer (via Artium AI)",
		period: "2024",
		location: "Remote",
		description:
			"Multi-agent RAG system accelerating medical research and discovery for one of the world's leading healthcare institutions.",
		highlights: [
			"Designed and implemented multi-agent architecture for medical research",
			"Built retrieval-augmented generation (RAG) system for knowledge synthesis",
			"Enabled researchers to accelerate discovery through AI-powered insights",
			"Integrated with existing medical knowledge databases",
			"Applied Continuous Alignment Testing (CAT) for production reliability"
		],
		technologies: [
			"Python",
			"LangChain",
			"Vector Databases",
			"OpenAI GPT-4",
			"RAG Architecture"
		],
		aiFeatures: [
			"Multi-Agent Systems",
			"Retrieval-Augmented Generation (RAG)",
			"Medical Knowledge Synthesis",
			"Production AI Monitoring"
		],
		logo: "mayo-logo.png",
		featured: true
	},
	{
		id: "ebay",
		name: "eBay",
		role: "AI Engineer (via Artium AI)",
		period: "2024",
		location: "Remote",
		description:
			"Enterprise-scale Agentic AI system optimizing legacy seller workspaces and transforming the online selling experience.",
		highlights: [
			"Architected agentic AI workflows for enterprise-scale deployment",
			"Integrated AI capabilities into legacy seller workspace systems",
			"Optimized seller workflows through intelligent automation",
			"Deployed production AI at massive scale",
			"Implemented CAT framework for continuous reliability monitoring"
		],
		technologies: [
			"Python",
			"TypeScript",
			"OpenAI",
			"Agentic Frameworks",
			"Enterprise APIs"
		],
		aiFeatures: [
			"Agentic AI Architecture",
			"Legacy System Integration",
			"Intelligent Workflow Automation",
			"Enterprise-Scale AI Deployment"
		],
		logo: "ebay-logo.png",
		featured: true
	},
	{
		id: "trust-and-will",
		name: "Trust & Will",
		role: "AI Engineer (via Artium AI)",
		period: "2024",
		location: "Remote",
		description:
			"Attorney-in-the-loop automation system digitizing estate planning practices with human oversight and AI efficiency.",
		highlights: [
			"Designed human-in-the-loop AI architecture for legal workflows",
			"Automated estate planning document generation and processing",
			"Maintained attorney oversight while increasing efficiency",
			"Built reliable AI system for sensitive legal operations",
			"Applied CAT framework for compliance and reliability monitoring"
		],
		technologies: [
			"Python",
			"OpenAI GPT-4",
			"Workflow Orchestration",
			"Document Automation"
		],
		aiFeatures: [
			"Human-in-the-Loop AI",
			"Legal Document Automation",
			"Workflow Orchestration",
			"Compliance Monitoring"
		],
		logo: "trust-will-logo.png",
		featured: true
	},
	{
		id: "arrive-health",
		name: "Arrive Health",
		role: "AI Engineer (via Artium AI)",
		period: "2024",
		location: "Remote",
		description:
			"Complex AI flows condensing critical clinical information to support patient care and healthcare decision-making.",
		highlights: [
			"Built AI systems for clinical information processing",
			"Designed complex information extraction pipelines",
			"Enabled AI-driven summarization for critical patient support",
			"Processed sensitive healthcare data with reliability guarantees",
			"Implemented production monitoring with CAT framework"
		],
		technologies: [
			"Python",
			"OpenAI",
			"Clinical Data Processing",
			"Information Extraction"
		],
		aiFeatures: [
			"Clinical Data Processing",
			"AI-Driven Summarization",
			"Information Extraction",
			"Healthcare AI Systems"
		],
		logo: "arrive-health-logo.png",
		featured: true
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
			"Spearheaded large-scale IAM platform modernization for autonomous vehicles",
			"Applied strangler fig pattern to replace decades-old legacy systems",
			"Built secure IAM platform in Java Spring Boot + GraphQL",
			"Architected global payments platform with React + Stripe.js",
			"Led technical team designing zero-downtime MongoDB migration service",
			"Delivered enterprise-scale microservices architecture"
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
		logo: "ford-logo.png",
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
			"Built enterprise Python ETL applications integrating Oracle EBS",
			"Enabled faster delivery and cross-team collaboration",
			"Championed Agile practices, TDD, and pair programming",
			"Shifted engineering culture toward modern practices",
			"Improved iteration velocity and maintainability"
		],
		technologies: ["Python", "Oracle EBS", "ETL Pipelines", "SQL", "Agile/TDD"],
		logo: "trimetlogo.png",
		featured: false
	},
	{
		id: "hillcrest",
		name: "Hillcrest Ski & Sports",
		role: "Software Developer → Principal Consultant",
		period: "February 2020 - Present",
		location: "Gresham, OR",
		description:
			"Built and continuously maintain e-commerce platform driving over $1M in annual sales. Ongoing client with active support and feature development.",
		highlights: [
			"Built company's first dynamic e-commerce platform (2020-2021)",
			"Transformed static site into real-time multi-channel fulfillment system",
			"Integrated 23,000+ SKUs with automated data pipelines",
			"Maintain and support RPBC2 licensed software (2020-Present)",
			"Provide ongoing technical support and feature development",
			"Drive over $1M in annual e-commerce revenue"
		],
		technologies: [
			"React",
			"Node.js",
			"Python",
			"E-commerce APIs",
			"Data Pipelines",
			"RPBC2"
		],
		logo: "hillcrestlogo.webp",
		featured: true
	}
];

export const getFeaturedCaseStudies = () =>
	caseStudiesData.filter((study) => study.featured);

export const getCaseStudyById = (id: string) =>
	caseStudiesData.find((study) => study.id === id);
