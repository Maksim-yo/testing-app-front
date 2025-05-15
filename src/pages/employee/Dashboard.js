import { useGetTestsQuery } from "../../app/api";

export default function Dashboard() {
  const { data: tests } = useGetTestsQuery();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Tests: {tests?.length}</p>
    </div>
  );
}
