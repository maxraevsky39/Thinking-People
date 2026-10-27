// Keep the root URL available after the Plasmic locale route migration.
export const getServerSideProps = async () => ({
  redirect: { destination: "/en/", permanent: false },
});

export default function Index() { return null; }
