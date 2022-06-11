import React from "react";
import Link from "next/link";

import { Project } from "../interfaces";

type Props = {
	data: Project;
};

const ListItem = ({ data }: Props) => (
	<Link href="/projects/[id]" as={`/projects/${data.id}`}>
		<a>
			{data.id}: {data.name}
		</a>
	</Link>
);

export default ListItem;
