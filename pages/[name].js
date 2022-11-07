import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'

import { Client } from '@notionhq/client'

export default function Home({ cake, nextDate, error }) {
  const { name } = useRouter().query;

  let content;
  if (error) {
    content = <main className={styles.main}>
      <h1 className='{styles.title}'>The cake is a lie.</h1>
      <div>({error})</div>
    </main>
  } else {
    content = <main className={styles.main}>
      <h1 className={styles.title}>
        Bringt {name} bald Kuchen mit?
      </h1>

      <p className={styles.description}>
        {cake ? 'Ja' : 'Nein'}
      </p>
      {nextDate ? <p className={styles.date}>
        {`Sogar schon am ${nextDate}!`}
      </p> : ''}
      
    </main>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Kuchen?</title>
        <meta name="description" content={`Wird ${name} Kuchen mitbringen?`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {content}

      <footer className={styles.footer}>
        <a
          href="https://niggelga.me"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} A project by me.
        </a>
      </footer>
    </div>
  )
}


export async function getServerSideProps({ params, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=59'
  )

  const { name } = params;

  if (!name || name.length < 1) {
    // Redirect to Nicolas page
    return {
      redirect: {
        destination: '/Nicolas',
        permanent: false,
      }
    }
  }

  // Make request
  const notion = new Client({ auth: process.env.NOTION_TOKEN })

  let data;

  try {
    data = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE,
      filter: {
        "and": [
          {
            property: "Name",
            rich_text: {
              contains: name,
            },
          },
          {
            property: "Abgeliefert?",
            select: {
              equals: "Nö",
            },
          }
        ]
      }
    });
  } catch (e) {
    process.stdout.write(e.toString());

    return {
      props: {
        cake: false,
        error: 'Something went wrong while fetching the data from notion',
      }
    }
  }

  // If data fails, return 404
  if (!data) {
    return {
      notFound: true,
    }
  }

  let nextDate = data.results.map(e => Date.parse(e.properties["Fällig wann"].date.start)).sort((a, b) => a - b)[0];

  if (nextDate) {
    let options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    nextDate = new Date(nextDate).toLocaleDateString("de-DE", options);
  } else {
    nextDate = null;
  }


  return {
    props: {
      cake: data.results.length > 0,
      nextDate: nextDate,
    },
  }
}
