import React from "react";
import Image from "next/image";
import styles from "../styles/ConsultancyService.module.css";

const ConsultancyService = () => (
	<div className={styles.container}>
		<section className={styles.intro}>
			<h1>Bagpyp | Software Consultancy</h1>
			<p>
				At Bagpyp, we specialize in transforming traditional business operations
				into modern, tech-forward digital enterprises. With expertise in
				cutting-edge methodologies and technologies, we ensure your business is
				market-ready and future-proof.
			</p>
		</section>

		<section className={styles.services}>
			<h2>Our Services</h2>
			<ul>
				<li>Custom Software Development</li>
				<li>Legacy System Refactoring</li>
				<li>Microservices Architecture</li>
				<li>Data Analysis and Optimization</li>
				<li>CI/CD Implementation</li>
			</ul>
		</section>

		<section className={styles.projects}>
			<h2>Highlighted Projects</h2>

			<div className={styles.project}>
				<h3>TriMet</h3>
				<p>
					Build, deploy and maintain ETL applications that service the Data
					Engineering, Application Development and Oracle EBS teams at TriMet.
				</p>
				<Image
					src="/img/projects/trimet_project.png"
					alt="TriMet Project"
					width={300}
					height={200}
				/>
			</div>

			<div className={styles.project}>
				<h3>Ford Motor Company</h3>
				<p>
					Overhauled the Identity and Access Management platform for the
					autonomous vehicle division, resulting in a more efficient and robust
					system.
				</p>
				<Image
					src="/img/projects/ford_project.png"
					alt="Ford Project"
					width={300}
					height={200}
				/>
			</div>
			<div className={styles.project}>
				<h3>Hillcrest Ski & Sports</h3>
				<p>
					Built the company’s first non-static website and integrated legacy
					systems with a modern eCommerce framework, enabling real-time,
					multi-channel order fulfillment.
				</p>
				<Image
					src="/img/projects/hillcrest_project.png"
					alt="Hillcrest Project"
					width={300}
					height={200}
				/>
			</div>
		</section>
	</div>
);

export default ConsultancyService;
