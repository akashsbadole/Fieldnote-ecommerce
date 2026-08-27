import { auth } from "@/lib/auth";
import { getAddressesForUser } from "@/lib/data";
import { ProfileForm } from "@/components/account/profile-form";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { AddressBook } from "@/components/account/address-book";
import { DeactivateAccountButton } from "@/components/account/deactivate-account-button";

export default async function ProfilePage() {
  const session = await auth();
  const addresses = await getAddressesForUser(session!.user.id);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="mb-4 border-b border-line pb-3 font-display text-xl">Profile</h2>
        <ProfileForm name={session!.user.name ?? ""} email={session!.user.email ?? ""} />
      </div>

      <div>
        <h2 className="mb-4 border-b border-line pb-3 font-display text-xl">Password</h2>
        <ChangePasswordForm />
      </div>

      <div>
        <h2 className="mb-4 border-b border-line pb-3 font-display text-xl">Address book</h2>
        <AddressBook addresses={addresses} />
      </div>

      <div>
        <h2 className="mb-4 border-b border-line pb-3 font-display text-xl">Danger zone</h2>
        <DeactivateAccountButton />
      </div>
    </div>
  );
}
