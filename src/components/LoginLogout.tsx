import { useUser } from "@auth0/nextjs-auth0";
import Image from "next/image";
import Link from "next/link";
import styles from '../styles//LoginLogout.module.css';

const LoginLogout = () => {
	const { user } = useUser();

	return (
		<>
			{user && (
				<Link href={"/api/auth/logout"}>
					<a>
						<Image
							className={styles.circularImage}
							src={user.picture ?? "../img/defaultUser.png"}
							alt={user.name ?? "User Profile"}
							width={75}
							height={75}
						></Image>
					</a>
				</Link>
			)}
			{!user && <Link href={"/api/auth/login"}>login</Link>}
		</>
	);
};

export default LoginLogout;
