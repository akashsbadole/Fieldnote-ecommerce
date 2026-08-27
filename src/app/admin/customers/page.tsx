import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAllUsers, getOrdersForUser } from "@/lib/data";
import { BlockUserButton } from "@/components/admin/block-user-button";
import { UserRoleSelect } from "@/components/admin/user-role-select";

export default async function AdminCustomersPage() {
  const session = await auth();
  const users = await getAllUsers();
  const orderCounts = await Promise.all(
    users.map(async (u) => ({ id: u.id, count: (await getOrdersForUser(u.id)).length }))
  );

  return (
    <div>
      <div className="mb-6 border-b border-line pb-3">
        <span className="font-mono text-xs tracking-widest text-rust">ACCOUNTS</span>
        <h2 className="mt-1 font-display text-3xl">Users ({users.length})</h2>
      </div>

      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="text-muted">
            <th className="pb-2 font-normal">Name</th>
            <th className="pb-2 font-normal">Contact</th>
            <th className="pb-2 font-normal">Role</th>
            <th className="pb-2 font-normal">Orders</th>
            <th className="pb-2 font-normal">Joined</th>
            <th className="pb-2 font-normal">Last login</th>
            <th className="pb-2 font-normal">Status</th>
            <th className="pb-2 font-normal"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((u) => {
            const isSelf = u.id === session?.user.id;
            return (
              <tr key={u.id}>
                <td className="py-3">
                  <Link href={`/admin/customers/${u.id}`} className="hover:text-forest hover:underline">
                    {u.name}
                  </Link>{" "}
                  {isSelf && <span className="text-muted">(you)</span>}
                </td>
                <td className="py-3">{u.email || u.phone || "—"}</td>
                <td className="py-3">
                  {isSelf ? (
                    u.role
                  ) : (
                    <UserRoleSelect userId={u.id} role={u.role} />
                  )}
                </td>
                <td className="py-3">{orderCounts.find((o) => o.id === u.id)?.count ?? 0}</td>
                <td className="py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-3">
                  {u.lastLoginAt ? (
                    <>
                      {new Date(u.lastLoginAt).toLocaleDateString()}{" "}
                      <span className="text-muted">({u.loginCount ?? 0}×)</span>
                    </>
                  ) : (
                    <span className="text-muted">never</span>
                  )}
                </td>
                <td className={`py-3 ${u.blocked ? "text-rust" : "text-forest"}`}>
                  {u.blocked ? "Blocked" : "Active"}
                </td>
                <td className="py-3">
                  {!isSelf && <BlockUserButton userId={u.id} blocked={u.blocked} />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
