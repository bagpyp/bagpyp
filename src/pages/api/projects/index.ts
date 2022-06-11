import { NextApiRequest, NextApiResponse } from "next";
import { sampleProjectData } from "../../../utils/sample-projects";

const handler = (_req: NextApiRequest, res: NextApiResponse) => {
	try {
		res.status(200).json(sampleProjectData);
	} catch (err: any) {
		res.status(500).json({ statusCode: 500, message: err.message });
	}
};

export default handler;
