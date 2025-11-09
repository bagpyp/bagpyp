import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/LoginLogout.module.css";

const LoginLogout = () => {
	const { user } = useUser();

	return (
		<>
			{user && (
				<Link href={"/api/auth/logout"}>
					<Image
						className={styles.circularImage}
						src={user.picture ?? "/img/defaultUser.png"}
						alt={user.name ?? "User Profile"}
						width={75}
						height={75}
					/>
				</Link>
			)}
			{!user && (
				<Link href={"/api/auth/login"}>
					<Image
						className={styles.circularImage}
						src={"/img/defaultUser.png"}
						alt={"login"}
						width={75}
						height={75}
					/>
				</Link>
			)}
		</>
	);
};

export default LoginLogout;
