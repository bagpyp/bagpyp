import * as React from "react";

import { Project } from "../interfaces";

type ListDetailProps = {
	item: Project;
};

const ListDetail = ({ item: project }: ListDetailProps) => (
	<div>
		<h1>{project.name}</h1>
		<p>{project.id}</p>
	</div>
);

export default ListDetail;
