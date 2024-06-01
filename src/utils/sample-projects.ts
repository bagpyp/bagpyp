import { Project } from "../interfaces";

/** Dummy project data. */
export const sampleProjectData: Project[] = [
	{
		id: 1,
		title: "Retail Pro | Big Commerce API",
		description:
			"Custom software to integrate inventory data from a legacy system to a modern eCommerce platform.",
		long_description:
			"This project involved creating custom software that seamlessly integrated inventory data from a legacy system to a modern eCommerce platform. The integration helped streamline the inventory management process and improved data accuracy.",
		tech_used: ["Python", "scrapy", "RESTful API"],
		images: [
			"retail_pro_big_commerce_api_1.png",
			"retail_pro_big_commerce_api_2.png",
			"retail_pro_big_commerce_api_3.png"
		]
	},
	{
		id: 2,
		title: "Theatre Vertigo Web Application",
		description:
			"Developed a C# / ASP.NET web application for a small theatre company.",
		long_description:
			"This project involved developing a web application for Theatre Vertigo, a small theatre company. The application was built using Visual C#, ASP.NET, Entity Framework, and MS SQL Management Studio, providing a robust platform for managing the theatre's operations.",
		tech_used: [
			"Visual C#",
			"ASP.NET",
			"Entity Framework",
			"MS SQL Management Studio",
			"JavaScript"
		],
		images: [
			"theatre_vertigo_web_application_1.png",
			"theatre_vertigo_web_application_2.png",
			"theatre_vertigo_web_application_3.png"
		]
	},
	{
		id: 3,
		title: "First Python Script",
		description:
			"Part of a thesis in grad school, using Numpy/SciPy, matplotlib, and graph theory.",
		long_description:
			"This project was a significant part of my thesis in grad school, where I used Numpy, SciPy, matplotlib, and graph theory to analyze and visualize complex data sets. The script provided valuable insights and contributed to the research findings.",
		tech_used: ["Numpy", "SciPy", "matplotlib", "Graph theory"],
		images: "first_python_script.png"
	},
	{
		id: 4,
		title: "Car Insurance Quote",
		description: "A C# and MVC project that generates a car insurance quote.",
		long_description:
			"This project was a C# and MVC application designed to generate car insurance quotes. The application utilized ASP.NET and IIS to provide a user-friendly interface for inputting data and generating accurate insurance quotes.",
		tech_used: ["ASP.NET", "IIS"],
		images: "car_insurance_quote.png"
	},
	{
		id: 5,
		title: "Academy Cinemas Website",
		description:
			"A Bootstrap project to practice using the bootstrap framework.",
		long_description:
			"This project involved creating a website for Academy Cinemas using the Bootstrap framework. The website was designed to be responsive and visually appealing, utilizing HTML, CSS, and Bootstrap to create a professional-looking site.",
		tech_used: ["HTML", "CSS", "Bootstrap"],
		images: "academy_cinemas_website.png"
	},
	{
		id: 6,
		title: "Library Management System",
		description:
			"A SQL project creating a Library Management System database and schema.",
		long_description:
			"This project involved creating a comprehensive Library Management System database and schema using SQL. The system was designed to efficiently manage library operations, including cataloging, member management, and transaction tracking.",
		tech_used: ["SQL"],
		images: "library_management_system.png"
	}
];
