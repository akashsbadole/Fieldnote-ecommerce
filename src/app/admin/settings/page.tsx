import { getStoreSettings } from "@/lib/data";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">CONFIGURATION</span>
        <h2 className="mt-1 font-display text-3xl">Store settings</h2>
      </div>
      <StoreSettingsForm settings={settings} />
    </div>
  );
}
