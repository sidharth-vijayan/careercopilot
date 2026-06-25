import { getApplications } from "@/actions/application";
import { ApplicationsClient } from "@/components/dashboard/applications-client";

export default async function ApplicationsPage() {
  const res = await getApplications();
  const applications = res.success ? (res.data || []) : [];

  return <ApplicationsClient initialApplications={applications} />;
}
