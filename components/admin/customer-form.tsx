"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomerStore, type Customer } from "@/lib/store/customer-store";

interface CustomerFormProps {
  customer?: Customer;
  onSaved: () => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSaved, onCancel }: CustomerFormProps) {
  const isEditing = Boolean(customer);
  const addCustomer = useCustomerStore((s) => s.addCustomer);
  const updateCustomer = useCustomerStore((s) => s.updateCustomer);

  const [name, setName] = React.useState(customer?.name ?? "");
  const [email, setEmail] = React.useState(customer?.email ?? "");
  const [phone, setPhone] = React.useState(customer?.phone ?? "");
  const [city, setCity] = React.useState(customer?.city ?? "");
  const [ordersCount, setOrdersCount] = React.useState(String(customer?.ordersCount ?? "0"));
  const [totalSpent, setTotalSpent] = React.useState(String(customer?.totalSpent ?? "0"));
  const [vip, setVip] = React.useState(customer?.vip ?? false);
  const [notes, setNotes] = React.useState(customer?.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    const result: Customer = {
      id: customer?.id ?? `c-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      ordersCount: Math.max(0, Number(ordersCount) || 0),
      totalSpent: Math.max(0, Number(totalSpent) || 0),
      joinedAt: customer?.joinedAt ?? new Date().toISOString().slice(0, 10),
      vip,
      notes: notes.trim() || undefined,
    };

    if (isEditing) {
      updateCustomer(customer!.id, result);
      toast.success(`${result.name} updated.`);
    } else {
      addCustomer(result);
      toast.success(`${result.name} added.`);
    }
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        <div>
          <Label className="mb-2 block">Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <Label className="mb-2 block">Email *</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
          </div>
          <div>
            <Label className="mb-2 block">City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai, MH" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Orders</Label>
            <Input type="number" min="0" value={ordersCount} onChange={(e) => setOrdersCount(e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Total Spent (INR)</Label>
            <Input type="number" min="0" value={totalSpent} onChange={(e) => setTotalSpent(e.target.value)} />
          </div>
        </div>
        <div>
          <Label className="mb-2 block">Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional" />
        </div>
        <Label className="flex cursor-pointer items-center gap-3">
          <Checkbox checked={vip} onCheckedChange={(v) => setVip(Boolean(v))} />
          VIP Customer
        </Label>
      </div>

      <div className="flex gap-3 border-t border-hairline px-6 py-5">
        <Button type="button" variant="secondary" size="md" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" className="flex-1">
          {isEditing ? "Save Changes" : "Add Customer"}
        </Button>
      </div>
    </form>
  );
}
