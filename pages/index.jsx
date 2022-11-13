import React from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const dummyData = [
  {
    name: "Prisma",
    type: "groceries", // take away food | groceries | maintenance | fun / hobby | gas | (home upgrades, or potentially other expenses)
    cost: 72,
  },
  {
    name: "Prisma",
    type: "groceries", //
    cost: 72,
  },
  {
    name: "Prisma",
    type: "groceries", //
    cost: 72,
  },
];

export default function Home() {
  const [expenseItems, setExpenseItems] = React.useState(dummyData);

  return (
    <div className={styles.container}>
      <Head>
        <title>Expense Tracker</title>
        <meta name="description" content="Expense tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Expense Tracker</h1>

        <div>
          <form>
            <input name="name" type="text" />
            <input name="cost" type="number" />
            <radio>1</radio>
            <radio>2</radio>
            <radio>3</radio>

            <input type="submit" value="Save" />
          </form>
        </div>

        <div>
          <h2>Dashboard</h2>

          <div>
            items:
            <pre>
              {JSON.stringify(expenseItems)}
              {/* {expenseItems.map((item) => (
                <div>{JSON.stringify(item)}</div>
              ))} */}
            </pre>
          </div>
        </div>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
