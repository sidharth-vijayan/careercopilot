import { getVaultItems } from "@/actions/vault";
import { VaultClient } from "@/components/dashboard/vault-client";

export const metadata = {
  title: "The Vault · Recut",
};

type VaultItemType = "experience" | "project" | "skill";

export default async function VaultPage() {
  const result = await getVaultItems();

  if (!result.success) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {result.error}
      </div>
    );
  }

  const items = (result.data ?? []).map((item) => ({
    id: item.id,
    type: item.type as VaultItemType,
    title: item.title,
    bulletPoints: item.bulletPoints,
  }));

  return <VaultClient initialItems={items} />;
}
