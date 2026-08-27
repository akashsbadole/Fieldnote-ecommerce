"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, Pencil, Trash2, Plus } from "lucide-react";
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type ActionResult,
} from "@/actions/address-actions";
import { Button } from "@/components/ui/button";
import type { Address } from "@/lib/types";

const initialState: ActionResult = { success: false, message: "" };

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {addresses.map((a) =>
        editingId === a.id ? (
          <AddressForm
            key={a.id}
            address={a}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <div key={a.id} className="flex items-start justify-between border border-line p-4">
            <div className="text-sm">
              <p className="flex items-center gap-2 font-medium">
                {a.fullName}
                {a.isDefault && (
                  <span className="flex items-center gap-1 font-mono text-[0.65rem] uppercase text-forest">
                    <Star className="h-3 w-3 fill-forest" /> Default
                  </span>
                )}
              </p>
              <p className="text-ink-soft">
                {a.street}, {a.city}, {a.state} {a.zip}, {a.country}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!a.isDefault && <SetDefaultButton addressId={a.id} />}
              <button
                onClick={() => setEditingId(a.id)}
                aria-label="Edit address"
                className="cursor-pointer text-muted hover:text-forest"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <DeleteAddressButton addressId={a.id} />
            </div>
          </div>
        )
      )}

      {adding ? (
        <AddressForm onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex cursor-pointer items-center gap-1 font-mono text-xs text-forest hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add address
        </button>
      )}
    </div>
  );
}

function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const action = address ? updateAddressAction.bind(null, address.id) : createAddressAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onDone();
    } else if (state.message) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-3 border border-forest p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Full name</label>
          <input
            name="fullName"
            required
            defaultValue={address?.fullName}
            className="mt-1 w-full border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div className="col-span-2">
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Street</label>
          <input
            name="street"
            required
            defaultValue={address?.street}
            className="mt-1 w-full border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">City</label>
          <input
            name="city"
            required
            defaultValue={address?.city}
            className="mt-1 w-full border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">State</label>
          <input
            name="state"
            required
            defaultValue={address?.state}
            className="mt-1 w-full border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">ZIP</label>
          <input
            name="zip"
            required
            defaultValue={address?.zip}
            className="mt-1 w-full border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-forest"
          />
        </div>
        <div>
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">Country</label>
          <input
            name="country"
            required
            defaultValue={address?.country ?? "USA"}
            className="mt-1 w-full border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:border-forest"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 font-mono text-xs text-ink-soft">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} />
        Set as default address
      </label>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save address"}
        </Button>
      </div>
    </form>
  );
}

function SetDefaultButton({ addressId }: { addressId: string }) {
  const [pending, setPending] = useState(false);
  async function handleClick() {
    setPending(true);
    const res = await setDefaultAddressAction(addressId);
    setPending(false);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  }
  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="cursor-pointer font-mono text-[0.65rem] uppercase text-muted hover:text-forest disabled:opacity-50"
    >
      Set default
    </button>
  );
}

function DeleteAddressButton({ addressId }: { addressId: string }) {
  const [pending, setPending] = useState(false);
  async function handleClick() {
    if (!confirm("Remove this address?")) return;
    setPending(true);
    const res = await deleteAddressAction(addressId);
    setPending(false);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  }
  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label="Delete address"
      className="cursor-pointer text-muted hover:text-rust disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
